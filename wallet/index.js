import { STARTING_BALANCE } from "../config.js"; // นำเข้าค่าเริ่มต้นของยอดเงินจากไฟล์ config
import { ec } from "../utill/index.js"; // นำเข้า elliptic curve object (ec) จากไฟล์ utill
import cryptoHash from "../utill/crypto-hash.js"; // นำเข้าฟังก์ชัน cryptoHash จากไฟล์ utill
import Transaction from "./transaction.js"; // นำเข้าคลาส Transaction

class Wallet {
  // กำหนดคลาส Wallet
  constructor() {
    // constructor สำหรับสร้าง Wallet object
    this.balance = STARTING_BALANCE; // กำหนด balance ของ wallet ด้วยค่าเริ่มต้น

    this.keyPair = ec.genKeyPair(); // สร้างคู่คีย์ (private key และ public key) โดยใช้ elliptic curve

    // ดึง public key จาก keyPair และเข้ารหัสเป็นรูปแบบ hexadecimal
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }
  sign(data) {
    // เมธอดสำหรับเซ็นข้อมูล
    // แฮชข้อมูลก่อนแล้วจึงใช้ private key ใน keyPair เซ็นข้อมูลนั้น
    return this.keyPair.sign(cryptoHash(data));
  }
  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    }

    // เมธอดสำหรับสร้าง transaction
    if (amount > this.balance) {
      // ตรวจสอบว่าจำนวนเงินที่ต้องการส่งเกินยอดคงเหลือใน wallet หรือไม่
      throw new Error("Amount exceeds balance"); // ถ้าเกิน ให้โยน Error
    }

    return new Transaction({
      // สร้างและคืนค่า Transaction object ใหม่
      senderWallet: this, // กำหนด wallet ปัจจุบันเป็นผู้ส่ง
      recipient, // ผู้รับ
      amount, // จำนวนเงิน
    });
  }

  static calculateBalance({ chain, address }) {
    // เมธอด static สำหรับคำนวณยอดเงิน
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }
        const addressOutput = transaction.outputMap[address];
        if (addressOutput) {
          outputsTotal += addressOutput;
        }
      }
      if (hasConductedTransaction) {
        break;
      }
    }

    return hasConductedTransaction
      ? outputsTotal
      : STARTING_BALANCE + outputsTotal;
  }
}

export default Wallet; // ส่งออกคลาส Wallet เพื่อให้ไฟล์อื่นสามารถนำไปใช้ได้
