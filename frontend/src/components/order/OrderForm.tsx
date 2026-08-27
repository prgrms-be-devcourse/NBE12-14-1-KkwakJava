interface OrderFormProps {
  email: string;
  postalCode: string;
  address: string;
  totalAmount: number;

  onEmailChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onAddressChange: (value: string) => void;

  onSubmit: () => void;
}

export default function OrderForm({
                                    email,
                                    postalCode,
                                    address,
                                    totalAmount,
                                    onEmailChange,
                                    onPostalCodeChange,
                                    onAddressChange,
                                    onSubmit,
                                  }: OrderFormProps) {
  const inputClass =
      'mt-2 block w-full rounded-lg border border-[#E9E5DC] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#4E2D1D]';

  return (
      <div className="border-t border-[#E9E5DC] pt-7">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#4E2D1D]">
            주문 정보
          </h2>

          <p className="mt-1 text-sm text-[#8C857B]">
            배송에 필요한 정보를 입력해 주세요.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-semibold text-[#2B2523]">
            이메일
            <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="example@email.com"
                className={inputClass}
            />
          </label>

          <label className="text-sm font-semibold text-[#2B2523]">
            우편번호
            <input
                type="text"
                value={postalCode}
                onChange={(e) => onPostalCodeChange(e.target.value)}
                placeholder="우편번호를 입력하세요"
                className={inputClass}
            />
          </label>

          <label className="text-sm font-semibold text-[#2B2523]">
            주소
            <input
                type="text"
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                placeholder="주소를 입력하세요"
                className={inputClass}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#E9E5DC] py-5">
        <span className="text-sm font-semibold text-[#2B2523]">
          총 주문 금액
        </span>

          <strong className="text-xl text-[#4E2D1D]">
            {totalAmount.toLocaleString()}원
          </strong>
        </div>

        <button
            type="button"
            onClick={onSubmit}
            className="w-full rounded-lg bg-[#4E2D1D] py-3.5 text-sm font-bold text-white hover:bg-[#523120]"
        >
          주문하기
        </button>
      </div>
  );
}