import PaymentItem from "~~/components/PaymentItem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const PaymentList = () => {
  // Хук для чтения общего количества платежей из контракта
  const { data: totalPayments } = useScaffoldReadContract({
    contractName: "PaymentContract",
    functionName: "getTotalPayments",
  });

  return (
    <div className="p-6 bg-orange-50 rounded-lg shadow-lg space-y-4 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-orange-600">Payments List</h2>
      <p className="text-orange-500">Total Payments: {Number(totalPayments) || 0}</p>

      {/* Отображение списка платежей */}
      <ul className="space-y-4">
        {totalPayments &&
          Array.from({ length: Number(totalPayments) || 0 }).map((_, index) => (
            <PaymentItem key={index} paymentId={index} />
          ))}
      </ul>
    </div>
  );
};

export default PaymentList;
