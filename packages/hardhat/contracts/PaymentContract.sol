// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract PaymentContract {
    // Переменная для хранения адреса владельца контракта
    address public owner;

    // Структура для хранения данных о платеже
    struct Payment {
        address sender;     // Адрес отправителя платежа
        uint256 amount;     // Сумма платежа в wei
        string message;     // Сообщение, отправленное вместе с платежом
        uint256 timestamp;  // Время, когда был сделан платёж
        bool refunded;      // Флаг, указывающий, был ли платёж возвращён
    }

    // Массив для хранения всех платежей
    Payment[] public payments;

    // Событие для регистрации нового платежа
    event PaymentReceived(address indexed from, uint256 amount, string message);

    // Событие для регистрации возврата средств
    event RefundIssued(address indexed to, uint256 amount, uint256 paymentId);

    // Конструктор, который устанавливает владельца контракта
    constructor() {
        owner = msg.sender; // Владелец контракта — это адрес, который развернул контракт
    }

    /**
     * @dev Функция для внесения платежа в контракт.
     * @param message Сообщение, отправленное вместе с платежом.
     */
    function pay(string memory message) public payable {
        require(msg.value > 0, "Payment must be greater than 0"); // Проверка, что сумма больше 0

        // Создание нового платежа и добавление его в массив
        payments.push(Payment(
            msg.sender,
            msg.value,
            message,
            block.timestamp,
            false
        ));

        // Генерация события о новом платеже
        emit PaymentReceived(msg.sender, msg.value, message);
    }

    /**
     * @dev Функция для возврата средств по ID платежа. Только владелец контракта может вызвать.
     * @param paymentId ID платежа, который нужно вернуть.
     */
    function refund(uint256 paymentId) public {
        require(msg.sender == owner, "Only owner can issue refunds"); // Проверка прав вызова
        require(paymentId < payments.length, "Invalid payment ID");   // Проверка валидности ID

        Payment storage payment = payments[paymentId]; // Получение ссылки на платёж по ID

        require(!payment.refunded, "Payment already refunded");       // Проверка, что платёж ещё не был возвращён
        require(payment.amount > 0, "Payment amount must be greater than 0"); // Проверка суммы

        // Возврат средств отправителю платежа
        payable(payment.sender).transfer(payment.amount);

        // Пометка платежа как возвращённого
        payment.refunded = true;

        // Генерация события о возврате средств
        emit RefundIssued(payment.sender, payment.amount, paymentId);
    }

    /**
     * @dev Функция для получения общего числа платежей.
     * @return Общее количество платежей.
     */
    function getTotalPayments() public view returns (uint256) {
        return payments.length;
    }

    /**
     * @dev Функция для получения данных о конкретном платеже.
     * @param paymentId ID платежа.
     * @return Адрес отправителя, сумма, сообщение, время и статус возврата.
     */
    function getPayment(uint256 paymentId) public view returns (address, uint256, string memory, uint256, bool) {
        require(paymentId < payments.length, "Payment does not exist"); // Проверка валидности ID

        Payment memory payment = payments[paymentId]; // Получение данных о платеже
        return (payment.sender, payment.amount, payment.message, payment.timestamp, payment.refunded);
    }

    /**
     * @dev Функция для вывода всех средств владельцем контракта.
     */
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw"); // Проверка прав вызова

        uint256 balance = address(this).balance; // Получение текущего баланса контракта
        require(balance > 0, "No funds to withdraw"); // Проверка, что на контракте есть средства

        // Перевод всех средств владельцу
        payable(owner).transfer(balance);
    }

    /**
     * @dev Функция для получения текущего баланса контракта.
     * @return Баланс контракта в wei.
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
