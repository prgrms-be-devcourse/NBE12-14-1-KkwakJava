'use client'

import { useEffect, useState, type FormEvent } from 'react'
import type { OrderResponse } from '@/types/order'
import { getOrders, updateOrder, deleteOrder, deleteOrders } from '@/api/orderApi'

interface Product {
  id: number
  name: string
  price: number
  imageUrl: string | null
}

interface EditForm {
  postalCode: string
  address: string
  items: { productId: number; productName: string; unitPrice: number; quantity: number }[]
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
  orders: OrderResponse[]
}

function groupOrdersByDeliveryWindow(orders: OrderResponse[]): DeliveryGroup[] {
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
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [productImages, setProductImages] = useState<Record<number, string | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)

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

  // 주문 완료 시 주문 내역 자동 조회
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailFromQuery = params.get('email')

    if (!emailFromQuery) {
      return
    }

    const loadOrders = async () => {
      setEmail(emailFromQuery)
      setLoading(true)
      setError(null)

      try {
        const data = await getOrders(emailFromQuery)
        setOrders(data)
        setSearched(true)
      } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : '주문 조회에 실패했습니다.'
        )
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
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
      const data = await getOrders(email.trim())
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
      await deleteOrder(orderId)
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
      const orderIds = group.orders.map((order) => order.orderId)
      await deleteOrders(orderIds)

      const idsToRemove = new Set(orderIds)
      setOrders((prev) => prev.filter((order) => !idsToRemove.has(order.orderId)))
    } catch (err) {
      setError(err instanceof Error ? err.message : '배송 묶음 삭제에 실패했습니다.')
    } finally {
      setDeletingGroup(false)
      setConfirmingGroupDeleteKey(null)
    }
  }

  const handleEditClick = (order: OrderResponse) => {
    setError(null)
    setEditSuccess(false)
    setEditingOrderId(order.orderId)
    setEditForm({
      postalCode: order.postalCode ?? '',
      address: order.address ?? '',
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
    })
  }

  const handleEditCancel = () => {
    setError(null)
    setEditSuccess(false)
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

    const editedOrder = orders.find((order) => order.orderId === orderId)
    if (!editedOrder) return

    const windowEnd = getDeliveryWindowEnd(editedOrder.orderDate).getTime()
    const siblingOrders = orders.filter(
      (order) => order.orderId !== orderId && getDeliveryWindowEnd(order.orderDate).getTime() === windowEnd,
    )

    setSavingEdit(true)
    setError(null)

    try {
      const updatedEdited = await updateOrder(orderId, {
        postalCode: editForm.postalCode,
        address: editForm.address,
        items: editForm.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })

      // 같은 배송 묶음의 나머지 주문에도 동일한 배송지를 일괄 반영 (상품/수량은 각자 그대로 유지)
      const updatedSiblings = await Promise.all(
        siblingOrders.map((sibling) =>
          updateOrder(sibling.orderId, {
            postalCode: editForm.postalCode,
            address: editForm.address,
            items: sibling.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          }),
        ),
      )

      const updatedById = new Map<number, OrderResponse>()
      updatedById.set(updatedEdited.orderId, updatedEdited)
      updatedSiblings.forEach((order) => updatedById.set(order.orderId, order))

      setOrders((prev) => prev.map((order) => updatedById.get(order.orderId) ?? order))
      setEditSuccess(true)
      setTimeout(() => {
        setEditingOrderId(null)
        setEditForm(null)
        setEditSuccess(false)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 수정에 실패했습니다.')
    } finally {
      setSavingEdit(false)
    }
  }

  const now = new Date()
  const deliveredCount = orders.filter((order) => isDelivered(order.orderDate, now)).length
  const groups = groupOrdersByDeliveryWindow(orders)
  const editingOrder = orders.find((order) => order.orderId === editingOrderId) ?? null
  const deletingOrder = orders.find((order) => order.orderId === confirmingDeleteId) ?? null

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#2b2420] dark:bg-[#201812] dark:text-[#f3e9dc]">
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
                        {!groupDelivered && (
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
                        )}
                      </div>

                      {groupDelivered && (
                        <p className="mb-4 rounded-lg bg-[#FEE2E2] px-4 py-2.5 text-sm text-[#DC2626] dark:bg-[#3d211d] dark:text-[#f0897a]">
                          배송이 완료된 주문 건은 수정/삭제가 불가능합니다.
                        </p>
                      )}

                      {group.orders.map((order) => {
                        const delivered = isDelivered(order.orderDate, now)

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
                                    <div className="text-sm">
                                      {order.postalCode ?? '-'} {order.address ?? ''}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="mb-2 text-xs font-semibold text-[#8a7d70]">주문 상품</div>
                                {order.items.map((item) => {
                                  const imageUrl = productImages[item.productId]

                                  return (
                                    <div key={item.productId} className="flex items-center gap-3 py-1.5">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F6F4F0] dark:bg-[#3d2e22]">
                                        {imageUrl ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                          <span aria-hidden="true">☕</span>
                                        )}
                                      </div>
                                      <span className="min-w-0 flex-1 text-sm">{item.productName}</span>
                                      <span className="min-w-[56px] text-right text-sm text-[#8a7d70]">
                                        {item.quantity}개
                                      </span>
                                      <span className="min-w-[70px] text-right text-sm">
                                        {formatPrice(item.itemTotalPrice)}
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
                              {!delivered && (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditClick(order)}
                                    className="rounded-lg border border-[#E9E5DC] bg-[#F6F4F0] px-4 py-1.5 text-sm hover:bg-[#E9E5DC] dark:border-[#4a3b2f] dark:hover:bg-[#332720]"
                                  >
                                    수정
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRequest(order.orderId)}
                                    className="rounded-lg border border-[#FECACA] px-4 py-1.5 text-sm text-[#DC2626] hover:bg-[#FEE2E2] dark:border-[#5c332c] dark:text-[#f0897a]"
                                  >
                                    삭제
                                  </button>
                                </div>
                              )}
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

      {editingOrder && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-[#2b211a]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">주문 수정 (#{editingOrder.orderId})</h3>
              <button
                type="button"
                onClick={handleEditCancel}
                aria-label="닫기"
                className="text-[#8a7d70] hover:text-[#2b2420] dark:hover:text-[#f3e9dc]"
              >
                ✕
              </button>
            </div>

            {editSuccess ? (
              <p className="rounded-lg bg-[#e2f4e6] px-4 py-3 text-sm font-medium text-[#2f8558] dark:bg-[#1f3a28] dark:text-[#7fd79a]">
                ✓ 반영되었습니다.
              </p>
            ) : (
              <>
                <div className="mb-4 text-sm text-[#8a7d70]">
                  <p>주문일 {formatOrderDate(editingOrder.orderDate)}</p>
                  <p>이메일 {editingOrder.email}</p>
                </div>

                <label className="mb-1.5 block text-sm font-medium text-[#8a7d70]" htmlFor="modal-postal-code">
                  우편번호
                </label>
                <input
                  id="modal-postal-code"
                  value={editForm.postalCode}
                  onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                  placeholder="우편번호"
                  className={inputClass}
                />

                <label className="mt-3 mb-1.5 block text-sm font-medium text-[#8a7d70]" htmlFor="modal-address">
                  주소
                </label>
                <input
                  id="modal-address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="주소"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-[#8a7d70]">
                  ⓘ 이 배송지는 같은 배송 묶음의 나머지 주문에도 함께 적용됩니다.
                </p>

                <div className="mt-4 mb-2 text-xs font-semibold text-[#8a7d70]">주문 상품</div>
                {editForm.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 py-1.5">
                    <span className="min-w-0 flex-1 text-sm">{item.productName}</span>
                    <span className="text-xs text-[#8a7d70]">{formatPrice(item.unitPrice)}</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleEditQuantityChange(item.productId, Math.max(1, Number(e.target.value)))
                      }
                      className="w-14 rounded-md border border-[#E9E5DC] px-2 py-1 text-center text-sm dark:border-[#4a3b2f] dark:bg-[#2b211a]"
                    />
                    <span className="min-w-[70px] text-right text-sm font-medium">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="mt-3 flex items-center justify-between border-t border-[#E9E5DC] pt-3 dark:border-[#4a3b2f]">
                  <span className="text-sm text-[#8a7d70]">총 금액</span>
                  <strong className="text-base text-[#2b2420] dark:text-[#f3e9dc]">
                    {formatPrice(editForm.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
                  </strong>
                </div>

                {error && (
                  <p className="mt-3 rounded-lg bg-[#FEE2E2] px-4 py-2.5 text-sm text-[#DC2626] dark:bg-[#3d211d] dark:text-[#f0897a]">
                    {error}
                  </p>
                )}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={handleEditCancel}
                    className="rounded-lg border border-[#E9E5DC] bg-[#F6F4F0] px-4 py-1.5 text-sm hover:bg-[#E9E5DC] disabled:opacity-60 dark:border-[#4a3b2f]"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={() => handleEditSave(editingOrder.orderId)}
                    className="rounded-lg bg-[#4E2D1D] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#523120] disabled:opacity-60 dark:bg-[#e8c9a0] dark:text-[#201812]"
                  >
                    {savingEdit ? '저장 중...' : '저장'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#2b211a]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">주문 삭제 (#{deletingOrder.orderId})</h3>
              <button
                type="button"
                onClick={handleDeleteCancel}
                aria-label="닫기"
                className="text-[#8a7d70] hover:text-[#2b2420] dark:hover:text-[#f3e9dc]"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-[#F6F4F0] p-3 text-sm dark:bg-[#332720]">
              <p>주문일 {formatOrderDate(deletingOrder.orderDate)}</p>
              <p>이메일 {deletingOrder.email}</p>
              <p className="mt-1">
                {deletingOrder.items.map((item) => `${item.productName} ${item.quantity}개`).join(', ')}
              </p>
              <p className="mt-1 font-semibold">총 금액 {formatPrice(deletingOrder.totalAmount)}</p>
            </div>

            <p className="mb-5 text-sm">해당 주문 건을 삭제하시겠습니까?</p>

            {error && (
              <p className="mb-4 rounded-lg bg-[#FEE2E2] px-4 py-2.5 text-sm text-[#DC2626] dark:bg-[#3d211d] dark:text-[#f0897a]">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="rounded-lg border border-[#E9E5DC] bg-[#F6F4F0] px-4 py-1.5 text-sm hover:bg-[#E9E5DC] dark:border-[#4a3b2f]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deletingOrder.orderId)}
                className="rounded-lg bg-[#DC2626] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#B91C1C]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
