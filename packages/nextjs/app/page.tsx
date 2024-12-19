"use client";

import PaymentForm from "~~/components/PaymentForm";
import PaymentList from "~~/components/PaymentList";
import RefundForm from "~~/components/RefundForm";

const Home = () => {
  return (
    <div className="container mx-auto p-6">
      {/* Заголовок основной страницы */}
      <h1 className="text-4xl font-extrabold text-center text-orange-600 mb-8">Payment Contract Interface</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PaymentForm /> {/* Компонент для отправки платежа */}
        <RefundForm /> {/* Компонент для возврата платежа */}
      </div>

      <div className="mt-8">
        <PaymentList /> {/* Компонент для отображения списка платежей */}
      </div>
    </div>
  );
};

export default Home;
