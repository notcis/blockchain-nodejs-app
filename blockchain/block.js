import hexToBinary from "hex-to-binary"; // นำเข้าฟังก์ชัน hexToBinary สำหรับแปลงค่าแฮชจากเลขฐานสิบหกเป็นเลขฐานสอง
import { GENESIS_DATA, MINE_RATE } from "../config.js"; // นำเข้าข้อมูลเริ่มต้น (GENESIS_DATA) และอัตราการขุด (MINE_RATE) จากไฟล์ config.js
import cryptoHash from "../utill/crypto-hash.js"; // นำเข้าฟังก์ชัน cryptoHash สำหรับสร้างค่าแฮช

class Block {
  // กำหนดคลาส Block
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    // constructor สำหรับสร้าง Block instance
    this.timestamp = timestamp; // เวลาที่สร้างบล็อก
    this.lastHash = lastHash; // ค่าแฮชของบล็อกก่อนหน้า
    this.hash = hash; // ค่าแฮชของบล็อกปัจจุบัน
    this.data = data; // ข้อมูลที่เก็บในบล็อก
    this.nonce = nonce; // ค่า nonce ที่ใช้ในการขุด (Proof of Work)
    this.difficulty = difficulty; // ค่าความยากในการขุดบล็อก
  }

  static genesis() {
    // เมธอด static สำหรับสร้าง Genesis Block (บล็อกแรกสุดใน Blockchain)
    return new this(GENESIS_DATA); // คืนค่า Block instance ที่สร้างจาก GENESIS_DATA
  }

  static mineBlock({ lastBlock, data }) {
    // เมธอด static สำหรับขุดบล็อกใหม่
    let hash, timestamp; // ประกาศตัวแปร hash และ timestamp
    const lastHash = lastBlock.hash; // ดึงค่า lastHash จากบล็อกก่อนหน้า
    let { difficulty } = lastBlock; // ดึงค่า difficulty จากบล็อกก่อนหน้า
    let nonce = 0; // กำหนดค่า nonce เริ่มต้นเป็น 0

    do {
      // เริ่มต้นลูป do-while สำหรับการขุด (Proof of Work)
      nonce++; // เพิ่มค่า nonce ไปเรื่อยๆ
      timestamp = Date.now(); // กำหนด timestamp ปัจจุบัน
      difficulty = Block.adjustDifficulty({
        // ปรับค่า difficulty ตามเวลาที่ใช้ในการขุด
        originalBlock: lastBlock, // บล็อกก่อนหน้า
        timestamp, // timestamp ปัจจุบัน
      }); // เรียกเมธอด adjustDifficulty เพื่อคำนวณความยากใหม่
      hash = cryptoHash(
        // สร้างค่าแฮชใหม่ด้วยข้อมูลทั้งหมด
        timestamp, // timestamp
        lastHash, // lastHash
        data, // data
        nonce, // nonce ที่เพิ่มขึ้น
        difficulty, // difficulty ที่ปรับแล้ว
      ); // เรียกใช้ cryptoHash เพื่อสร้างค่าแฮช
    } while ( // เงื่อนไขในการวนลูป: ตรวจสอบว่าแฮชที่ได้ตรงตามเงื่อนไขความยากหรือไม่
      hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty) // แปลงแฮชเป็นเลขฐานสองและตรวจสอบว่ามี '0' นำหน้าตามจำนวน difficulty หรือไม่
    ); // ถ้าไม่ตรงตามเงื่อนไข ให้วนลูปใหม่

    return new this({ timestamp, lastHash, data, difficulty, nonce, hash }); // คืนค่า Block instance ที่ขุดได้
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    // เมธอด static สำหรับปรับค่าความยากในการขุด
    const { difficulty } = originalBlock; // ดึงค่า difficulty ของบล็อกต้นฉบับ
    const difference = timestamp - originalBlock.timestamp; // คำนวณความแตกต่างของเวลาในการขุด
    if (difficulty < 1) {
      // ตรวจสอบว่า difficulty ต่ำกว่า 1 หรือไม่
      return 1; // ถ้าต่ำกว่า 1 ให้คืนค่า 1 (เป็นค่าต่ำสุด)
    } // จบเงื่อนไข difficulty < 1

    if (difference > MINE_RATE) {
      // ถ้าเวลาที่ใช้ในการขุดมากกว่า MINE_RATE (ขุดช้าเกินไป)
      return difficulty - 1; // ลดค่า difficulty ลง 1
    } // จบเงื่อนไข difference > MINE_RATE

    return difficulty + 1; // ถ้าเวลาที่ใช้ในการขุดน้อยกว่าหรือเท่ากับ MINE_RATE (ขุดเร็วเกินไป) ให้เพิ่มค่า difficulty ขึ้น 1
  } // จบเมธอด adjustDifficulty
}

export default Block; // ส่งออกคลาส Block เป็นค่า default
