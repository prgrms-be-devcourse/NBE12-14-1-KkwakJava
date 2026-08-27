'use client'

import { useEffect, useState, type FormEvent } from 'react'

interface OrderItem {
  orderItemId: number
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  itemTotalPrice: number
}

interface Order {
  orderId: number
  email: string
  postalCode: string | null
  address: string | null
  orderDate: string
  totalAmount: number
  items: OrderItem[]
}

interface Product {
  id: number
  name: string
  price: number
  imageUrl: string | null
}

interface EditForm {
  postalCode: string
  address: string
  items: { productId: number; productName: string; quantity: number }[]
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

const DELIVERY_CUTOFF_HOUR = 14

function getDeliveryWindowEnd(orderDateIso: string): Date {
  const orderDate = new Date(orderDateIso)
  const windowEnd = new Date(orderDate)
  windowEnd.setHours(DELIVERY_CUTOFF_HOUR, 0, 0, 0)

  if (orderDate.getHours() >= DELIVERY_CUTOFF_HOUR) {
    windowEnd.setDate(windowEnd.getDate() + 1)
  }

  return windowEnd
}

function isDelivered(orderDateIso: string, now: Date): boolean {
  return now >= getDeliveryWindowEnd(orderDateIso)
}

function formatWindowDate(date: Date): string {
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())} (${weekday})`
}

interface DeliveryGroup {
  key: string
  windowEnd: Date
  orders: Order[]
}

function groupOrdersByDeliveryWindow(orders: Order[]): DeliveryGroup[] {
  const map = new Map<string, DeliveryGroup>()

  orders.forEach((order) => {
    const windowEnd = getDeliveryWindowEnd(order.orderDate)
    const key = windowEnd.toISOString()
    const existing = map.get(key)

    if (existing) {
      existing.orders.push(order)
    } else {
      map.set(key, { key, windowEnd, orders: [order] })
    }
  })

  return Array.from(map.values()).sort((a, b) => b.windowEnd.getTime() - a.windowEnd.getTime())
}

function formatOrderDate(iso: string): string {
  const d = new Date(iso)
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())} (${weekday}) ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

const inputClass =
  'w-full rounded-lg border border-[#E9E5DC] px-3 py-2.5 text-sm text-[#2b2420] placeholder:text-[#b3a596] focus:outline-none focus:ring-2 focus:ring-[#4E2D1D] dark:border-[#4a3b2f] dark:bg-[#2b211a] dark:text-[#f3e9dc]'

export default function DeliveryPage() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [productImages, setProductImages] = useState<Record<number, string | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null)

  const [confirmingGroupDeleteKey, setConfirmingGroupDeleteKey] = useState<string | null>(null)
  const [deletingGroup, setDeletingGroup] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((res) => res.json())
      .then((products: Product[]) => {
        const map: Record<number, string | null> = {}
        products.forEach((p) => {
          map[p.id] = p.imageUrl
        })
        setProductImages(map)
      })
      .catch(() => {
        // 상품 이미지 조회 실패는 썸네일 없이 그냥 진행
      })
  }, [])

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('⚠️ 이메일을 입력해주세요')
      setOrders([])
      setSearched(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ email: email.trim() })
      const response = await fetch(`${API_BASE_URL}/orders?${params}`)

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.message ?? '주문 조회에 실패했습니다.')
      }

      const data: Order[] = await response.json()
      setOrders(data)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 조회에 실패했습니다.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = (orderId: number) => {
    setError(null)
    setConfirmingDeleteId(orderId)
  }

  const handleDeleteCancel = () => {
    setConfirmingDeleteId(null)
  }

  const handleDeleteConfirm = async (orderId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.message ?? '주문 삭제에 실패했습니다.')
      }

      setOrders((prev) => prev.filter((order) => order.orderId !== orderId))
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 삭제에 실패했습니다.')
    } finally {
      setConfirmingDeleteId(null)
    }
  }

  const handleGroupDeleteRequest = (key: string) => {
    setError(null)
    setConfirmingGroupDeleteKey(key)
  }

  const handleGroupDeleteCancel = () => {
    setConfirmingGroupDeleteKey(null)
  }

  const handleGroupDeleteConfirm = async (group: DeliveryGroup) => {
    setDeletingGroup(true)

    try {
      const params = new URLSearchParams()
      group.orders.forEach((order) => params.append('orderIds', String(order.orderId)))

      const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.message ?? '배송 묶음 삭제에 실패했습니다.')
      }

      const idsToRemove = new Set(group.orders.map((order) => order.orderId))
      setOrders((prev) => prev.filter((order) => !idsToRemove.has(order.orderId)))
    } catch (err) {
      setError(err instanceof Error ? err.message : '배송 묶음 삭제에 실패했습니다.')
    } finally {
      setDeletingGroup(false)
      setConfirmingGroupDeleteKey(null)
    }
  }

  const handleEditClick = (order: Order) => {
    setError(null)
    setEditingOrderId(order.orderId)
    setEditForm({
      postalCode: order.postalCode ?? '',
      address: order.address ?? '',
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
      })),
    })
  }

  const handleEditCancel = () => {
    setError(null)
    setEditingOrderId(null)
    setEditForm(null)
  }

  const handleEditQuantityChange = (productId: number, quantity: number) => {
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
          }
        : prev,
    )
  }

  const handleEditSave = async (orderId: number) => {
    if (!editForm) return

    setSavingEdit(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode: editForm.postalCode,
          address: editForm.address,
          items: editForm.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.message ?? '주문 수정에 실패했습니다.')
      }

      const updated: Order = await response.json()
      setOrders((prev) =>
        prev.map((order) => (order.orderId === orderId ? updated : order)),
      )
      setEditingOrderId(null)
      setEditForm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 수정에 실패했습니다.')
    } finally {
      setSavingEdit(false)
    }
  }

  const now = new Date()
  const deliveredCount = orders.filter((order) => isDelivered(order.orderDate, now)).length
  const groups = groupOrdersByDeliveryWindow(orders)

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#2b2420] dark:bg-[#201812] dark:text-[#f3e9dc]">
      <header className="flex items-center justify-between border-b border-[#E9E5DC] bg-white px-6 py-4 dark:border-[#4a3b2f] dark:bg-[#2b211a] sm:px-12">
        <div className="flex items-center gap-2 text-lg font-bold text-[#4E2D1D] dark:text-[#e8c9a0]">
          <span aria-hidden="true" className="text-xl leading-none">☕️</span>
          Grids &amp; Circles
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="/order" className="text-[#8a7d70] hover:text-[#2b2420] dark:hover:text-[#f3e9dc]">
            원두 주문
          </a>
          <a href="/delivery" className="border-b-2 border-[#4E2D1D] font-semibold dark:border-[#e8c9a0]">
            배송 조회
          </a>
        </nav>
      </header>

      <div className="px-6 py-8 sm:px-12">
        <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F6F4F0] text-[#4E2D1D] dark:bg-[#3d2e22] dark:text-[#e8c9a0]">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <path
                d="M3 7h11v8H3z M14 10h4l3 3v2h-7z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="7" cy="18" r="1.6" fill="currentColor" />
              <circle cx="17.5" cy="18" r="1.6" fill="currentColor" />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold">배송 조회</h1>
            <p className="text-sm text-[#8a7d70]">이메일로 주문 내역과 배송 상태를 확인하세요.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#E9E5DC] bg-white p-6 shadow-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]">
            <h2 className="mb-1 text-base font-bold">주문 조회</h2>
            <p className="mb-5 text-sm text-[#8a7d70]">
              이메일로 주문 내역과 배송 상태를 조회할 수 있습니다.
            </p>

            <form onSubmit={handleSearch}>
              <label className="mb-1.5 block text-sm font-medium text-[#8a7d70]" htmlFor="email-input">
                이메일
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className={inputClass}
              />

              <div className="mt-3 flex gap-2 rounded-lg bg-[#F6F4F0] p-3 text-xs text-[#8a7d70] dark:bg-[#332720]">
                <span aria-hidden="true">ⓘ</span>
                <span>당일 오후 2시 이후 주문은 다음 날 배송이 시작됩니다.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-lg bg-[#4E2D1D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#523120] disabled:opacity-60 dark:bg-[#e8c9a0] dark:text-[#201812]"
              >
                {loading ? ' 🚂 조회 중 • • • ' : '조회하기'}
              </button>

              {error && (
                <p className="mt-4 rounded-lg bg-[#FEE2E2] px-4 py-2.5 text-sm text-[#DC2626] dark:bg-[#3d211d] dark:text-[#f0897a]">
                  {error}
                </p>
              )}
            </form>
          </aside>

          <main>
            {searched && (
              <div className="relative mb-6 grid grid-cols-2 rounded-2xl border border-[#E9E5DC] bg-white px-6 py-5 shadow-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]">
                <div className="flex items-center justify-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6F4F0] dark:bg-[#3d2e22]">
                    🛍️
                  </span>
                  <div>
                    <div className="text-xs text-[#8a7d70]">조회된 주문</div>
                    <div className="text-xl font-bold">{orders.length}건</div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 bg-[#E9E5DC] dark:bg-[#4a3b2f]" />
                <div className="flex items-center justify-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2f4e6] text-[#2f8558] dark:bg-[#1f3a28] dark:text-[#7fd79a]">
                    ✓
                  </span>
                  <div>
                    <div className="text-xs text-[#8a7d70]">배송 완료</div>
                    <div className="text-xl font-bold text-[#2f8558] dark:text-[#7fd79a]">
                      {deliveredCount}건
                    </div>
                  </div>
                </div>
              </div>
            )}

            {searched && (
              <div>
                <h3 className="mb-4 text-base font-bold">주문 / 배송 내역</h3>

                {orders.length === 0 && (
                  <p className="rounded-2xl border border-[#E9E5DC] bg-white py-10 text-center text-sm text-[#8a7d70] dark:border-[#4a3b2f] dark:bg-[#2b211a]">
                    조회 결과가 없습니다.
                  </p>
                )}

                {groups.map((group) => {
                  const groupDelivered = now >= group.windowEnd
                  const isConfirmingGroupDelete = confirmingGroupDeleteKey === group.key

                  return (
                    <div
                      key={group.key}
                      className="mb-6 rounded-2xl border border-dashed border-[#E9E5DC] bg-[#F6F5F2] p-4 dark:border-[#4a3b2f] dark:bg-[#241b14]"
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-3 px-2">
                        <span className="text-sm font-bold">
                          {formatWindowDate(group.windowEnd)} 배송 묶음
                        </span>
                        <span className="text-xs text-[#8a7d70]">{group.orders.length}건 합배송</span>
                        {groupDelivered && (
                          <span className="rounded-full bg-[#e2f4e6] px-3 py-1 text-xs font-semibold text-[#2f8558] dark:bg-[#1f3a28] dark:text-[#7fd79a]">
                            배송완료
                          </span>
                        )}
                        <div className="ml-auto">
                          {isConfirmingGroupDelete ? (
                            <div className="flex items-center gap-2 text-sm text-[#8a7d70]">
                              묶음 전체를 삭제할까요?
                              <button
                                type="button"
                                disabled={deletingGroup}
                                onClick={() => handleGroupDeleteConfirm(group)}
                                className="rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#B91C1C] disabled:opacity-60"
                              >
                                삭제
                              </button>
                              <button
                                type="button"
                                disabled={deletingGroup}
                                onClick={handleGroupDeleteCancel}
                                className="rounded-lg border border-[#E9E5DC] bg-[#F6F4F0] px-3 py-1.5 text-xs hover:bg-[#E9E5DC] dark:border-[#4a3b2f]"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleGroupDeleteRequest(group.key)}
                              className="rounded-lg border border-[#FECACA] px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEE2E2] dark:border-[#5c332c] dark:text-[#f0897a]"
                            >
                              배송묶음 삭제
                            </button>
                          )}
                        </div>
                      </div>

                      {group.orders.map((order) => {
                        const delivered = isDelivered(order.orderDate, now)
                        const isEditing = editingOrderId === order.orderId
                        const isConfirmingDelete = confirmingDeleteId === order.orderId

                        return (
                          <div
                            key={order.orderId}
                            className="mb-4 rounded-2xl border border-[#E9E5DC] bg-white p-6 shadow-sm last:mb-0 dark:border-[#4a3b2f] dark:bg-[#2b211a]"
                          >
                      <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-[#E9E5DC] pb-3 dark:border-[#4a3b2f]">
                        <span className="font-bold">주문번호 #{order.orderId}</span>
                        <span className="text-sm text-[#8a7d70]">
                          주문일 {formatOrderDate(order.orderDate)}
                        </span>
                        {delivered && (
                          <span className="ml-auto rounded-full bg-[#e2f4e6] px-3 py-1 text-xs font-semibold text-[#2f8558] dark:bg-[#1f3a28] dark:text-[#7fd79a]">
                            배송완료
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1.3fr]">
                        <div>
                          <div className="mb-3 flex gap-2.5">
                            <span aria-hidden="true">✉️</span>
                            <div>
                              <div className="text-xs text-[#8a7d70]">이메일</div>
                              <div className="text-sm">{order.email}</div>
                            </div>
                          </div>
                          <div className="flex gap-2.5">
                            <span aria-hidden="true">📍</span>
                            <div className="flex-1">
                              <div className="mb-1 text-xs text-[#8a7d70]">배송지</div>
                              {isEditing && editForm ? (
                                <div className="flex flex-col gap-1.5">
                                  <input
                                    value={editForm.postalCode}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, postalCode: e.target.value })
                                    }
                                    placeholder="우편번호"
                                    className={inputClass}
                                  />
                                  <input
                                    value={editForm.address}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, address: e.target.value })
                                    }
                                    placeholder="주소"
                                    className={inputClass}
                                  />
                                </div>
                              ) : (
                                <div className="text-sm">
                                  {order.postalCode ?? '-'} {order.address ?? ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 text-xs font-semibold text-[#8a7d70]">주문 상품</div>
                          {(isEditing && editForm ? editForm.items : order.items).map((item) => {
                            const productId = item.productId
                            const imageUrl = productImages[productId]
                            const quantity = item.quantity
                            const originalItem = order.items.find(
                              (oi) => oi.productId === productId,
                            )

                            return (
                              <div key={productId} className="flex items-center gap-3 py-1.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F6F4F0] dark:bg-[#3d2e22]">
                                  {imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <span aria-hidden="true">☕</span>
                                  )}
                                </div>
                                <span className="min-w-0 flex-1 text-sm">{item.productName}</span>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) =>
                                      handleEditQuantityChange(
                                        productId,
                                        Math.max(1, Number(e.target.value)),
                                      )
                                    }
                                    className="w-14 rounded-md border border-[#E9E5DC] px-2 py-1 text-center text-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]"
                                  />
                                ) : (
                                  <span className="min-w-[56px] text-right text-sm text-[#8a7d70]">
                                    {quantity}개
                                  </span>
                                )}
                                <span className="min-w-[70px] text-right text-sm">
                                  {originalItem ? formatPrice(originalItem.unitPrice * quantity) : ''}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E9E5DC] pt-4 dark:border-[#4a3b2f]">
                        <div className="text-sm text-[#8a7d70]">
                          총 금액{' '}
                          <strong className="ml-2 text-base text-[#2b2420] dark:text-[#f3e9dc]">
                            {formatPrice(order.totalAmount)}
                          </strong>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                disabled={savingEdit}
                                onClick={() => handleEditSave(order.orderId)}
                                className="rounded-lg bg-[#4E2D1D] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#523120] disabled:opacity-60 dark:bg-[#e8c9a0] dark:text-[#201812]"
                              >
                                저장
                              </button>
                              <button
                                type="button"
                                disabled={savingEdit}
                                onClick={handleEditCancel}
                                className="rounded-lg border border-[#E9E5DC] bg-[#F6F4F0] px-4 py-1.5 text-sm hover:bg-[#E9E5DC] dark:border-[#4a3b2f]"
                              >
                                취소
                              </button>
                            </>
                          ) : isConfirmingDelete ? (
                            <div className="flex items-center gap-2 text-sm text-[#8a7d70]">
                              정말 삭제할까요?
                              <button
                                type="button"
                                onClick={() => handleDeleteConfirm(order.orderId)}
                                className="rounded-lg bg-[#DC2626] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#B91C1C]"
                              >
                                삭제
                              </button>
                              <button
                                type="button"
                                onClick={handleDeleteCancel}
                                className="rounded-lg border border-[#E9E5DC] bg-[#F6F4F0] px-4 py-1.5 text-sm hover:bg-[#E9E5DC] dark:border-[#4a3b2f]"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <>
                              {!delivered && (
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(order)}
                                  className="rounded-lg border border-[#E9E5DC] bg-[#F6F4F0] px-4 py-1.5 text-sm hover:bg-[#E9E5DC] dark:border-[#4a3b2f] dark:hover:bg-[#332720]"
                                >
                                  수정
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteRequest(order.orderId)}
                                className="rounded-lg border border-[#FECACA] px-4 py-1.5 text-sm text-[#DC2626] hover:bg-[#FEE2E2] dark:border-[#5c332c] dark:text-[#f0897a]"
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}

                {orders.length > 0 && (
                  <p className="mt-2 text-xs text-[#8a7d70]">
                    ⓘ 배송 정보는 택배사 사정에 따라 업데이트가 지연될 수 있습니다.
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
        </div>
      </div>
    </div>
  )
}
