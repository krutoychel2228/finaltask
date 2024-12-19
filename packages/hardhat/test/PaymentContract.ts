import { expect } from "chai";

import { ethers } from "hardhat";

describe("PaymentContract", function () {
  let PaymentContract: any, paymentContract: any, owner: any, addr1: any, addr2: any;

  beforeEach(async function () {
    // Деплой контракта перед каждым тестом
    [owner, addr1, addr2] = await ethers.getSigners();
    PaymentContract = await ethers.getContractFactory("PaymentContract");
    paymentContract = await PaymentContract.deploy();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await paymentContract.owner()).to.equal(owner.address);
    });
  });

  describe("Payments", function () {
    it("Should accept payments and emit event", async function () {
      const message = "Test payment";
      const amount = ethers.parseEther("1");

      await expect(paymentContract.connect(addr1).pay(message, { value: amount }))
        .to.emit(paymentContract, "PaymentReceived")
        .withArgs(addr1.address, amount, message);

      // Проверить, что платёж записан
      const totalPayments = await paymentContract.getTotalPayments();
      expect(totalPayments).to.equal(1);

      const [paymentSender, paymentAmount, paymentMessage, , paymentRefunded] = await paymentContract.getPayment(0);
      expect(paymentSender).to.equal(addr1.address);
      expect(paymentAmount).to.equal(BigInt(amount));
      expect(paymentMessage).to.equal(message);
      expect(paymentRefunded).to.equal(false);
    });

    it("Should fail if payment is zero", async function () {
      await expect(paymentContract.connect(addr1).pay("Zero payment", { value: 0 })).to.be.revertedWith(
        "Payment must be greater than 0",
      );
    });
  });

  describe("Refunds", function () {
    it("Should refund payment by ID", async function () {
      const amount = ethers.parseEther("1");

      // Отправка платежа
      await paymentContract.connect(addr1).pay("Refundable payment", { value: amount });

      // Возврат средств
      await expect(paymentContract.connect(owner).refund(0))
        .to.emit(paymentContract, "RefundIssued")
        .withArgs(addr1.address, amount, 0);

      const [, , , , refunded] = await paymentContract.getPayment(0);
      expect(refunded).to.equal(true);
    });

    it("Should fail if non-owner tries to refund", async function () {
      const amount = ethers.parseEther("1");
      await paymentContract.connect(addr1).pay("Refundable payment", { value: amount });

      await expect(paymentContract.connect(addr1).refund(0)).to.be.revertedWith("Only owner can issue refunds");
    });

    it("Should fail if payment is already refunded", async function () {
      const amount = ethers.parseEther("1");
      await paymentContract.connect(addr1).pay("Refundable payment", { value: amount });

      await paymentContract.connect(owner).refund(0);

      await expect(paymentContract.connect(owner).refund(0)).to.be.revertedWith("Payment already refunded");
    });

    it("Should fail for invalid payment ID", async function () {
      await expect(paymentContract.connect(owner).refund(0)).to.be.revertedWith("Invalid payment ID");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow owner to withdraw all funds", async function () {
      const amount = ethers.parseEther("1");

      // Отправка платежей
      await paymentContract.connect(addr1).pay("Payment 1", { value: amount });
      await paymentContract.connect(addr2).pay("Payment 2", { value: amount });

      const contractBalance = await paymentContract.getBalance();
      expect(contractBalance).to.equal(ethers.parseEther("2"));

      // Вывод средств владельцем
      await paymentContract.connect(owner).withdraw();

      const newBalance = await paymentContract.getBalance();
      expect(newBalance).to.equal(0);
    });

    it("Should fail if non-owner tries to withdraw", async function () {
      await expect(paymentContract.connect(addr1).withdraw()).to.be.revertedWith("Only owner can withdraw");
    });
  });

  describe("Getters", function () {
    it("Should return the correct total number of payments", async function () {
      const amount = ethers.parseEther("1");

      await paymentContract.connect(addr1).pay("Payment 1", { value: amount });
      await paymentContract.connect(addr2).pay("Payment 2", { value: amount });

      const totalPayments = await paymentContract.getTotalPayments();
      expect(totalPayments).to.equal(2);
    });

    it("Should return the correct details of a payment", async function () {
      const amount = ethers.parseEther("1");
      const message = "Test payment";

      await paymentContract.connect(addr1).pay(message, { value: amount });

      const [paymentSender, paymentAmount, paymentMessage, , paymentRefunded] = await paymentContract.getPayment(0);
      expect(paymentSender).to.equal(addr1.address);
      expect(paymentAmount).to.equal(BigInt(amount));
      expect(paymentMessage).to.equal(message);
      expect(paymentRefunded).to.equal(false);
    });
  });
});
