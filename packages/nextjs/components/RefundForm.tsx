import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const RefundForm = () => {
  // Состояние для хранения ID платежа
  const [paymentId, setPaymentId] = useState("");

  // Хук для вызова функции контракта "refund"
  const { writeContractAsync: refundPayment, isMining } = useScaffoldWriteContract({
    contractName: "PaymentContract",
  });

  // Обработчик возврата средств
  const handleRefund = async (e: any) => {
    e.preventDefault();

    // Проверка, что введен валидный ID платежа
    if (!paymentId) {
      alert("Enter a valid payment ID!");
      return;
    }

    try {
      // Выполнение функции возврата средств в смарт-контракте
      await refundPayment({
        functionName: "refund",
        args: [BigInt(paymentId)], // Аргумент — это ID платежа
      });
      alert("Refund issued successfully!");
      setPaymentId(""); // Очистка поля ID платежа
    } catch (error) {
      console.error("Error issuing refund:", error);
    }
  };

  return (
    <form onSubmit={handleRefund} className="p-6 bg-orange-50 rounded-lg shadow-lg space-y-4 w-full max-w-md mx-auto">
      {/* Заголовок формы */}
      <h2 className="text-2xl font-semibold text-orange-600">Refund Payment</h2>

      {/* Поле для ввода ID платежа */}
      <input
        type="number"
        placeholder="Payment ID"
        value={paymentId}
        onChange={e => setPaymentId(e.target.value)}
        className="input input-bordered w-full p-4 text-gray-700 bg-white rounded-lg focus:ring-2 focus:ring-orange-400"
        required
      />

      {/* Кнопка возврата средств */}
      <button
        type="submit"
        className={`btn btn-primary w-full p-4 text-white rounded-lg ${isMining ? "loading" : ""} bg-orange-500 hover:bg-orange-600`}
      >
        Refund Payment
      </button>
    </form>
  );
};

export default RefundForm;
