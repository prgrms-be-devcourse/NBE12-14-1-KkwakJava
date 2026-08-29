interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  isProcessing?: boolean;
  processingText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
                                       isOpen,
                                       title,
                                       message,
                                       confirmText = '확인',
                                       cancelText = '취소',
                                       variant = 'primary',
                                       isProcessing = false,
                                       processingText = '처리 중...',
                                       onConfirm,
                                       onCancel,
                                     }: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const confirmButtonClass =
      variant === 'danger'
          ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
          : 'bg-[#4E2D1D] hover:bg-[#3D2115]';

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
          shadow-xl
          dark:border-[#4a3b2f]
          dark:bg-[#2b211a]
        "
        >
          <h2 className="text-lg font-bold text-[#2b2420] dark:text-[#f3e9dc]">
            {title}
          </h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#8a7d70]">
            {message}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="
              rounded-lg
              border border-[#E9E5DC]
              bg-white
              px-4 py-2
              text-sm font-semibold
              text-[#4E2D1D]
              transition-all duration-200
              hover:bg-[#F6F4F0]
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-[#4a3b2f]
              dark:bg-[#2b211a]
              dark:text-[#e8c9a0]
              dark:hover:bg-[#3d2e22]
            "
            >
              {cancelText}
            </button>

            <button
                type="button"
                onClick={onConfirm}
                disabled={isProcessing}
                className={`
              rounded-lg
              px-4 py-2
              text-sm font-semibold
              text-white
              transition-all duration-200
              hover:-translate-y-0.5
              hover:shadow-md
              active:translate-y-0
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
              ${confirmButtonClass}
            `}
            >
              {isProcessing ? processingText : confirmText}
            </button>
          </div>
        </div>
      </div>
  );
}