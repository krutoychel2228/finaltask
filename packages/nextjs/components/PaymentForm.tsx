import { useState } from "react";
import { ethers } from "ethers";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const PaymentForm = () => {
  // Состояние для хранения сообщения и суммы платежа
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");

  // Хук для вызова функции контракта "pay"
  const { writeContractAsync: sendPayment, isMining } = useScaffoldWriteContract({
    contractName: "PaymentContract",
  });

  // Обработчик отправки формы
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Проверка, что сумма введена корректно
    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter a valid amount!");
      return;
    }

    try {
      // Отправка платежа через смарт-контракт
      await sendPayment({
        functionName: "pay",
        args: [message],
        value: ethers.parseEther(amount || "0"), // Перевод суммы в wei
      });
      alert("Payment sent successfully!");
      setMessage(""); // Очистка поля сообщения
      setAmount(""); // Очистка поля суммы
    } catch (error) {
      console.error("Error sending payment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-orange-50 rounded-lg shadow-lg space-y-4 w-full max-w-md mx-auto">
      {/* Заголовок формы */}
      <h2 className="text-2xl font-semibold text-orange-600">Send Payment</h2>

      {/* Поле для ввода сообщения */}
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="input input-bordered w-full p-4 text-gray-700 bg-white rounded-lg focus:ring-2 focus:ring-orange-400"
        required
      />

      {/* Поле для ввода суммы в ETH */}
      <input
        type="number"
        placeholder="Amount in ETH"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="input input-bordered w-full p-4 text-gray-700 bg-white rounded-lg focus:ring-2 focus:ring-orange-400"
        required
      />

      {/* Кнопка отправки платежа */}
      <button
        type="submit"
        className={`btn btn-primary w-full p-4 text-white rounded-lg ${isMining ? "loading" : ""} bg-orange-500 hover:bg-orange-600`}
      >
        Send Payment
      </button>
    </form>
  );
};

export default PaymentForm;
