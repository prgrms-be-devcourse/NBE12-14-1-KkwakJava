interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrders: () => void;
}

export default function OrderSuccessModal({
                                            isOpen,
                                            onClose,
                                            onViewOrders,
                                          }: OrderSuccessModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
      <div
          className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40 px-4
      "
      >
        <div
            role="dialog"
            aria-modal="true"
            className="
          w-full max-w-sm
          rounded-2xl
          border border-[#E9E5DC]
          bg-white
          p-6
          text-center
          shadow-xl
          dark:border-[#4a3b2f]
          dark:bg-[#2b211a]
        "
        >
          {/* 완료 아이콘 */}
          <div
              className="
            mx-auto flex h-14 w-14
            items-center justify-center
            rounded-full
            bg-[#F6F4F0]
            text-2xl font-bold
            text-[#4E2D1D]
            dark:bg-[#3d2e22]
            dark:text-[#e8c9a0]
          "
          >
            ✓
          </div>

          <h2 className="mt-5 text-xl font-bold text-[#2b2420] dark:text-[#f3e9dc]">
            주문이 완료되었습니다.
          </h2>

          <p className="mt-2 text-sm text-[#8a7d70]">
            주문 내역은 배송 조회 페이지에서 확인할 수 있습니다.
          </p>

          <div className="mt-6 flex gap-3">
            {/* 닫기 */}
            <button
                type="button"
                onClick={onClose}
                className="
              flex-1 rounded-lg
              border border-[#E9E5DC]
              bg-white
              px-4 py-2.5
              text-sm font-semibold
              text-[#4E2D1D]
              transition-all duration-200
              hover:bg-[#F6F4F0]
              dark:border-[#4a3b2f]
              dark:bg-[#2b211a]
              dark:text-[#e8c9a0]
              dark:hover:bg-[#3d2e22]
            "
            >
              닫기
            </button>

            {/* 주문 내역 조회 */}
            <button
                type="button"
                onClick={onViewOrders}
                className="
              flex-1 rounded-lg
              bg-[#4E2D1D]
              px-4 py-2.5
              text-sm font-semibold
              text-white
              transition-all duration-200
              hover:-translate-y-0.5
              hover:bg-[#3D2115]
              hover:shadow-md
              active:translate-y-0
              dark:bg-[#e8c9a0]
              dark:text-[#201812]
              dark:hover:bg-[#d9b98e]
            "
            >
              주문 내역 조회
            </button>
          </div>
        </div>
      </div>
  );
}