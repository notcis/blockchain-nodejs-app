import hexToBinary from "hex-to-binary"; // นำเข้าฟังก์ชัน hexToBinary สำหรับแปลงค่าแฮชจากเลขฐานสิบหกเป็นเลขฐานสอง
import Block from "./block"; // นำเข้าคลาส Block
import { GENESIS_DATA, MINE_RATE } from "../config"; // นำเข้าข้อมูล Genesis และ MINE_RATE จากไฟล์ config
import cryptoHash from "../utill/crypto-hash"; // นำเข้าฟังก์ชัน cryptoHash สำหรับสร้างค่าแฮช

describe("Block", () => {
  // เริ่มต้นชุดการทดสอบสำหรับคลาส Block
  const timestamp = 2000; // กำหนดค่า timestamp สำหรับบล็อกทดสอบ
  const lastHash = "foo-lastHash"; // กำหนดค่า lastHash สำหรับบล็อกทดสอบ
  const hash = "foo-hash"; // กำหนดค่า hash สำหรับบล็อกทดสอบ
  const data = ["foo-data", "bar-data"]; // กำหนดข้อมูลสำหรับบล็อกทดสอบ
  const nonce = 1; // กำหนดค่า nonce สำหรับบล็อกทดสอบ
  const difficulty = 1; // กำหนดค่า difficulty สำหรับบล็อกทดสอบ

  const block = new Block({
    // สร้าง Block instance สำหรับการทดสอบคุณสมบัติพื้นฐาน
    timestamp, // กำหนด timestamp
    lastHash, // กำหนด lastHash
    hash, // กำหนด hash
    data, // กำหนด data
    nonce, // กำหนด nonce
    difficulty, // กำหนด difficulty
  }); // จบการสร้าง Block instance

  it("has a timestamp, lastHash, hash and data property", () => {
    // ทดสอบว่าบล็อกมีคุณสมบัติ timestamp, lastHash, hash และ data
    expect(block.timestamp).toEqual(timestamp); // ตรวจสอบว่า timestamp ตรงกัน
    expect(block.lastHash).toEqual(lastHash); // ตรวจสอบว่า lastHash ตรงกัน
    expect(block.hash).toEqual(hash); // ตรวจสอบว่า hash ตรงกัน
    expect(block.data).toEqual(data); // ตรวจสอบว่า data ตรงกัน
    expect(block.nonce).toEqual(nonce); // ตรวจสอบว่า nonce ตรงกัน
    expect(block.difficulty).toEqual(difficulty); // ตรวจสอบว่า difficulty ตรงกัน
  }); // จบการทดสอบคุณสมบัติ

  describe("genesis()", () => {
    // เริ่มต้นชุดการทดสอบสำหรับเมธอด genesis()
    const genesisBlock = Block.genesis(); // เรียกใช้เมธอด genesis() เพื่อสร้าง Genesis Block

    it("returns a block instance", () => {
      // ทดสอบว่าเมธอดคืนค่า Block instance
      expect(genesisBlock instanceof Block).toBe(true); // ตรวจสอบว่า genesisBlock เป็นอินสแตนซ์ของ Block
    }); // จบการทดสอบ Block instance

    it("returns the genesis data", () => {
      // ทดสอบว่าเมธอดคืนค่าข้อมูล Genesis ที่ถูกต้อง
      expect(genesisBlock).toEqual(GENESIS_DATA); // ตรวจสอบว่า genesisBlock ตรงกับ GENESIS_DATA
    }); // จบการทดสอบ Genesis data
  }); // จบชุดการทดสอบ genesis()

  describe("mineBlock()", () => {
    // เริ่มต้นชุดการทดสอบสำหรับเมธอด mineBlock()
    const lastBlock = Block.genesis(); // สร้าง Genesis Block เป็น lastBlock
    const data = "mined data"; // กำหนดข้อมูลสำหรับบล็อกที่จะขุด
    const minedBlock = Block.mineBlock({ lastBlock, data }); // เรียกใช้เมธอด mineBlock() เพื่อขุดบล็อกใหม่

    it("returns a Block instance", () => {
      // ทดสอบว่าเมธอดคืนค่า Block instance
      expect(minedBlock instanceof Block).toBe(true); // ตรวจสอบว่า minedBlock เป็นอินสแตนซ์ของ Block
    }); // จบการทดสอบ Block instance

    it("sets the `lastHash` to be the `hash` of the lastBlock", () => {
      // ทดสอบว่า lastHash ของบล็อกที่ขุดตรงกับ hash ของ lastBlock
      expect(minedBlock.lastHash).toEqual(lastBlock.hash); // ตรวจสอบว่า lastHash ตรงกัน
    }); // จบการทดสอบ lastHash

    it("sets the `data`", () => {
      // ทดสอบว่าข้อมูลของบล็อกที่ขุดตรงกับข้อมูลที่ส่งเข้าไป
      expect(minedBlock.data).toEqual(data); // ตรวจสอบว่า data ตรงกัน
    }); // จบการทดสอบ data

    it("sets a `timestamp`", () => {
      // ทดสอบว่าบล็อกที่ขุดมี timestamp
      expect(minedBlock.timestamp).not.toEqual(undefined); // ตรวจสอบว่า timestamp ไม่เป็น undefined
    }); // จบการทดสอบ timestamp

    it("creates a SHA-256 `hash` based on the proper inputs", () => {
      // ทดสอบว่า hash ของบล็อกที่ขุดถูกสร้างขึ้นอย่างถูกต้องด้วย SHA-256
      expect(minedBlock.hash).toEqual(
        // ตรวจสอบว่า hash ตรงกับค่าที่คำนวณโดย cryptoHash
        cryptoHash(
          // เรียกใช้ cryptoHash
          minedBlock.timestamp, // timestamp ของบล็อกที่ขุด
          minedBlock.nonce, // nonce ของบล็อกที่ขุด
          minedBlock.difficulty, // difficulty ของบล็อกที่ขุด
          lastBlock.hash, // hash ของ lastBlock
          data, // data ของบล็อกที่ขุด
        ), // จบการเรียก cryptoHash
      ); // จบการตรวจสอบ hash
    }); // จบการทดสอบ SHA-256 hash

    it("sets a `hash` that matches the difficulty criteria", () => {
      // ทดสอบว่า hash ของบล็อกที่ขุดตรงตามเงื่อนไขความยาก (มี '0' นำหน้าตามจำนวน difficulty)
      expect(
        // ตรวจสอบว่า
        hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty), // แปลง hash เป็นเลขฐานสองและตัดส่วนหน้าตาม difficulty
      ).toEqual("0".repeat(minedBlock.difficulty)); // ตรงกับสตริง '0' ซ้ำๆ ตามจำนวน difficulty
    }); // จบการทดสอบ difficulty criteria

    it("adjusts the difficulty", () => {
      // ทดสอบว่า difficulty ถูกปรับเปลี่ยน
      const possibleResults = [
        // กำหนดผลลัพธ์ที่เป็นไปได้สำหรับการปรับ difficulty
        lastBlock.difficulty + 1, // เพิ่มขึ้น 1
        lastBlock.difficulty - 1, // ลดลง 1
      ]; // จบการกำหนด possibleResults
      expect(possibleResults.includes(minedBlock.difficulty)).toBe(true); // ตรวจสอบว่า difficulty ของบล็อกที่ขุดอยู่ในผลลัพธ์ที่เป็นไปได้
    }); // จบการทดสอบการปรับ difficulty
  }); // จบชุดการทดสอบ mineBlock()

  describe("adjustDifficulty()", () => {
    // เริ่มต้นชุดการทดสอบสำหรับเมธอด adjustDifficulty()
    it("raises the difficulty for a quickly mined block", () => {
      // ทดสอบว่า difficulty เพิ่มขึ้นสำหรับบล็อกที่ขุดเร็วเกินไป
      expect(
        // ตรวจสอบว่า
        Block.adjustDifficulty({
          // เรียกใช้เมธอด adjustDifficulty()
          originalBlock: block, // บล็อกต้นฉบับ
          timestamp: block.timestamp + MINE_RATE - 100, // timestamp ที่เร็วกว่า MINE_RATE
        }), // จบการเรียก adjustDifficulty()
      ).toEqual(block.difficulty + 1); // ผลลัพธ์ควรเป็น difficulty เพิ่มขึ้น 1
    }); // จบการทดสอบ difficulty เพิ่มขึ้น

    it("lowers the difficulty for a slowly mined block", () => {
      // ทดสอบว่า difficulty ลดลงสำหรับบล็อกที่ขุดช้าเกินไป
      expect(
        // ตรวจสอบว่า
        Block.adjustDifficulty({
          // เรียกใช้เมธอด adjustDifficulty()
          originalBlock: block, // บล็อกต้นฉบับ
          timestamp: block.timestamp + MINE_RATE + 100, // timestamp ที่ช้ากว่า MINE_RATE
        }), // จบการเรียก adjustDifficulty()
      ).toEqual(block.difficulty - 1); // ผลลัพธ์ควรเป็น difficulty ลดลง 1
    }); // จบการทดสอบ difficulty ลดลง

    it("has a lower limit of 1", () => {
      // ทดสอบว่า difficulty มีค่าต่ำสุดที่ 1
      block.difficulty = -1; // กำหนด difficulty ของบล็อกต้นฉบับเป็นค่าติดลบ
      expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1); // ตรวจสอบว่าผลลัพธ์คือ 1
    }); // จบการทดสอบ lower limit
  }); // จบชุดการทดสอบ adjustDifficulty()
}); // สิ้นสุดชุดการทดสอบสำหรับคลาส Block
