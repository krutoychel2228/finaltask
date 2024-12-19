import { ethers } from "ethers";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// Компонент для отображения данных одного платежа
const PaymentItem = ({ paymentId }: { paymentId: number }) => {
  // Получаем данные о платеже по его ID
  const { data, isLoading, isError } = useScaffoldReadContract({
    contractName: "PaymentContract",
    functionName: "getPayment",
    args: [BigInt(paymentId)], // Передаем идентификатор платежа
  });

  // Если данные загружаются, показываем индикатор загрузки
  if (isLoading) {
    return <div className="p-4 bg-orange-100 text-orange-600">Loading payment...</div>;
  }

  // Если произошла ошибка при загрузке
  if (isError || data === undefined) {
    return <div className="p-4 bg-red-100 text-red-600">Error loading payment.</div>;
  }

  const [sender, amount, message, , refunded] = data;
  return (
    <div className="p-4 bg-white rounded-lg shadow-md hover:bg-orange-100 transition-colors">
      <p className="font-bold text-orange-600">ID: {paymentId}</p>
      <p className="font-bold text-orange-600">Sender: {sender}</p>
      <p className="font-bold text-orange-600">Amount: {ethers.formatEther(amount)} ETH</p>
      <p className="font-bold text-orange-600">Message: {message}</p>
      <p className="font-semibold text-orange-600">Status: {refunded ? "Refunded" : "Not Refunded"}</p>
    </div>
  );
};

export default PaymentItem;
