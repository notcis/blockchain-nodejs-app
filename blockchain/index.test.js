import Block from "./block";
import Blockchain from "./index";
import { jest, beforeEach, expect, test, it, describe } from "@jest/globals";
import cryptoHash from "../utill/crypto-hash";
import Wallet from "../wallet";
import Transaction from "../wallet/transaction";

describe("Blockchain", () => {
  // เริ่มต้นชุดการทดสอบสำหรับคลาส Blockchain
  let blockchain, newChain, originalChain, errorMock; // ประกาศตัวแปรสำหรับเก็บอินสแตนซ์ของ Blockchain และเชนต่างๆ

  beforeEach(() => {
    // ทำงานก่อนการทดสอบแต่ละครั้งในชุดนี้
    blockchain = new Blockchain(); // สร้างอินสแตนซ์ใหม่ของ Blockchain สำหรับการทดสอบ
    newChain = new Blockchain(); // สร้างอินสแตนซ์ใหม่ของ Blockchain สำหรับเชนใหม่
    errorMock = jest.fn(); // สร้าง mock function สำหรับ console.error

    originalChain = blockchain.chain; // เก็บเชนเริ่มต้นของ blockchain ไว้เพื่อเปรียบเทียบภายหลัง
    global.console.error = errorMock; // แทนที่ console.error ด้วย mock function
  });

  it("contains a `chain` Array instance", () => {
    // ทดสอบว่า blockchain มีคุณสมบัติ `chain` ที่เป็นอินสแตนซ์ของ Array
    expect(blockchain.chain instanceof Array).toBe(true); // ตรวจสอบว่า blockchain.chain เป็น Array จริง
  });

  it("starts with the genesis block", () => {
    // ทดสอบว่าบล็อกแรกในเชนคือ genesis block
    expect(blockchain.chain[0]).toEqual(Block.genesis()); // ตรวจสอบว่าบล็อกแรกเท่ากับ genesis block ที่สร้างโดย Block.genesis()
  });

  it("adds a new block to the chain", () => {
    // ทดสอบว่าสามารถเพิ่มบล็อกใหม่เข้าสู่เชนได้
    const NewData = "foo bar"; // กำหนดข้อมูลใหม่สำหรับบล็อก
    blockchain.addBlock({ data: NewData }); // เพิ่มบล็อกใหม่ด้วยข้อมูลที่กำหนด
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(NewData); // ตรวจสอบว่าข้อมูลของบล็อกสุดท้ายในเชนตรงกับข้อมูลที่เพิ่มเข้าไป
  });

  describe("isValidChain()", () => {
    // เริ่มต้นชุดการทดสอบสำหรับเมธอด isValidChain
    describe("when chain does not start with the genesis block", () => {
      // กรณีที่เชนไม่ได้เริ่มต้นด้วย genesis block
      it("returns false", () => {
        // ควรคืนค่าเป็น false
        blockchain.chain[0] = { data: "fake-genesis" }; // เปลี่ยนบล็อกแรกให้เป็นข้อมูลปลอม

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); // ตรวจสอบว่า isValidChain คืนค่า false
      });
    });
    describe("when the chain starts with the genesis block and has multiple blocks", () => {
      // กรณีที่เชนเริ่มต้นด้วย genesis block และมีหลายบล็อก
      beforeEach(() => {
        // ทำงานก่อนการทดสอบแต่ละครั้งในชุดนี้
        blockchain.addBlock({ data: "Bears" }); // เพิ่มบล็อกแรก
        blockchain.addBlock({ data: "Beets" }); // เพิ่มบล็อกที่สอง
        blockchain.addBlock({ data: "Battlestar Galactica" }); // เพิ่มบล็อกที่สาม
      });
      describe("and a lastHash reference has changed", () => {
        // และค่า lastHash อ้างอิงมีการเปลี่ยนแปลง
        it("returns false", () => {
          // ควรคืนค่าเป็น false
          blockchain.chain[2].lastHash = "broken-lastHash"; // เปลี่ยน lastHash ของบล็อกที่สองให้ผิดเพี้ยน

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); // ตรวจสอบว่า isValidChain คืนค่า false
        });
      });
      describe("and the chain contains a block with invalid field", () => {
        // และเชนมีบล็อกที่มีข้อมูลไม่ถูกต้อง
        it("returns false", () => {
          // ควรคืนค่าเป็น false
          blockchain.chain[2].data = "some-bad-and-evil-data"; // เปลี่ยนข้อมูลของบล็อกที่สองให้ผิดเพี้ยน

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); // ตรวจสอบว่า isValidChain คืนค่า false
        });
      });

      describe("and the chain contains a block with a jumped difficulty", () => {
        // และเชนมีบล็อกที่มีความยากที่ข้ามไป
        it("returns false", () => {
          // ควรคืนค่าเป็น false
          const lastBlock = blockchain.chain[blockchain.chain.length - 1]; // เก็บบล็อกสุดท้ายในเชน
          const lastHash = lastBlock.hash; // เก็บ hash ของบล็อกสุดท้าย
          const timestamp = Date.now(); // เก็บ timestamp ปัจจุบัน
          const nonce = 0; // เก็บ nonce เป็น 0
          const data = []; // เก็บข้อมูลเป็นอาเรย์ว่าง
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data); // สร้าง hash ใหม่
          const badBlock = new Block({
            // สร้างบล็อกที่ไม่ถูกต้อง
            timestamp,
            lastHash,
            hash,
            nonce,
            difficulty,
            data,
          });
          blockchain.chain.push(badBlock); // เพิ่มบล็อกที่ไม่ถูกต้องเข้าสู่เชน

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); // ตรวจสอบว่า isValidChain คืนค่า false
        });
      });

      describe("and the chain does not contain any invalid blocks", () => {
        // และเชนไม่มีบล็อกที่ไม่ถูกต้องเลย
        it("returns true", () => {
          // ควรคืนค่าเป็น true
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true); // ตรวจสอบว่า isValidChain คืนค่า true
        });
      });
    });
  });

  describe("replaceChain()", () => {
    // เริ่มต้นชุดการทดสอบสำหรับเมธอด replaceChain
    let logMock; // ประกาศตัวแปรสำหรับ mock console.error และ console.log

    beforeEach(() => {
      // ทำงานก่อนการทดสอบแต่ละครั้งในชุดนี้

      logMock = jest.fn(); // สร้าง mock function สำหรับ console.log

      global.console.log = logMock; // แทนที่ console.log ด้วย mock function
    });

    describe("when the new chain is not longer", () => {
      // กรณีที่เชนใหม่ไม่ยาวกว่าเชนปัจจุบัน
      beforeEach(() => {
        // ทำงานก่อนการทดสอบแต่ละครั้งในชุดนี้
        newChain.chain[0] = { new: "chain" }; // เปลี่ยนบล็อกแรกของเชนใหม่ (ทำให้ความยาวไม่เปลี่ยนแปลง)
        blockchain.replaceChain(newChain.chain); // เรียกเมธอด replaceChain ด้วยเชนใหม่
      });
      it("does not replace the chain", () => {
        // ไม่ควรแทนที่เชน
        expect(blockchain.chain).toEqual(originalChain); // ตรวจสอบว่าเชนยังคงเป็นเชนเดิม
      });
      it("logs an error", () => {
        // ควรมีการบันทึกข้อผิดพลาด
        expect(errorMock).toHaveBeenCalled(); // ตรวจสอบว่า console.error ถูกเรียกใช้
      });
    });

    describe("when the chain is longer", () => {
      // กรณีที่เชนใหม่ยาวกว่าเชนปัจจุบัน
      beforeEach(() => {
        // ทำงานก่อนการทดสอบแต่ละครั้งในชุดนี้
        newChain.addBlock({ data: "Bears" }); // เพิ่มบล็อกแรกในเชนใหม่
        newChain.addBlock({ data: "Beets" }); // เพิ่มบล็อกที่สองในเชนใหม่
        newChain.addBlock({ data: "Battlestar Galactica" }); // เพิ่มบล็อกที่สามในเชนใหม่
      });
      describe("and the chain is invalid", () => {
        // และเชนใหม่ไม่ถูกต้อง
        beforeEach(() => {
          // ทำงานก่อนการทดสอบแต่ละครั้งในชุดนี้
          newChain.chain[2].hash = "some-fake-hash"; // ทำให้ hash ของบล็อกที่สองในเชนใหม่ผิดเพี้ยน
          blockchain.replaceChain(newChain.chain); // เรียกเมธอด replaceChain ด้วยเชนใหม่
        });
        it("does not replace the chain", () => {
          // ไม่ควรแทนที่เชน
          expect(blockchain.chain).toEqual(originalChain); // ตรวจสอบว่าเชนยังคงเป็นเชนเดิม
        });
        it("logs an error", () => {
          // ควรมีการบันทึกข้อผิดพลาด
          expect(errorMock).toHaveBeenCalled(); // ตรวจสอบว่า console.error ถูกเรียกใช้
        });
      });
      describe("and the chain is valid", () => {
        // และเชนใหม่ถูกต้อง
        beforeEach(() => {
          // ทำงานก่อนการทดสอบแต่ละครั้งในชุดนี้
          blockchain.replaceChain(newChain.chain); // เรียกเมธอด replaceChain ด้วยเชนใหม่
        });
        it("replaces the chain", () => {
          // ควรแทนที่เชน
          expect(blockchain.chain).toEqual(newChain.chain); // ตรวจสอบว่าเชนถูกแทนที่ด้วยเชนใหม่
        });
        it("logs about the chain replacement", () => {
          // ควรมีการบันทึกเกี่ยวกับการแทนที่เชน
          expect(logMock).toHaveBeenCalled(); // ตรวจสอบว่า console.log ถูกเรียกใช้
        });
      });
    });

    describe("and the `validateTransactions` flag is true", () => {
      it("calls validTransactionData()", () => {
        const validTransactionDataMock = jest.fn();
        blockchain.validTransactionData = validTransactionDataMock;
        newChain.addBlock({ data: "foo" });
        blockchain.replaceChain(newChain.chain, true);
        expect(validTransactionDataMock).toHaveBeenCalled();
      });
    });
  });

  describe("validTransactionData()", () => {
    // เริ่มต้นชุดการทดสอบสำหรับเมธอด validTransactionData
    let transaction, rewardTransaction, wallet;

    beforeEach(() => {
      // ทำงานก่อนการทดสอบแต่ละครั้งในชุดนี้
      wallet = new Wallet();
      transaction = wallet.createTransaction({
        recipient: "foo-address",
        amount: 65,
      });
      rewardTransaction = Transaction.rewardTransaction({
        minerWallet: wallet,
      });
    });

    describe("and the transaction data is valid", () => {
      // และข้อมูลการทำรายการถูกต้อง
      it("returns true", () => {
        newChain.addBlock({
          data: [transaction, rewardTransaction],
        });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          true,
        );
        expect(errorMock).not.toHaveBeenCalled();
      });
    });

    describe("and the transaction data has multiple rewards", () => {
      it("returns false and logs an error", () => {
        newChain.addBlock({
          data: [transaction, rewardTransaction, rewardTransaction],
        });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false,
        );
        expect(errorMock).toHaveBeenCalled();
      });
    });
    describe("and the transaction data has at least one malformed outputMap", () => {
      describe("and the transaction is not a reward transaction", () => {
        it("returns false and logs an error", () => {
          transaction.outputMap[wallet.publicKey] = 999999;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(
            blockchain.validTransactionData({ chain: newChain.chain }),
          ).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("and the transaction is a reward transaction", () => {
        it("returns false and logs an error", () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(
            blockchain.validTransactionData({ chain: newChain.chain }),
          ).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
    describe("and the transaction data has at least one malformed input", () => {
      it("returns false and logs an error", () => {
        wallet.balance = 9000;

        const evilOutputMap = {
          [wallet.publicKey]: 8900,
          fooRecipient: 100,
        };
        const evilTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(evilOutputMap),
          },
          outputMap: evilOutputMap,
        };

        newChain.addBlock({ data: [evilTransaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false,
        );
        expect(errorMock).toHaveBeenCalled();
      });
    });
    describe("and the transaction data has at least one invalid amount", () => {
      it("returns false and logs an error", () => {
        newChain.addBlock({
          data: [transaction, transaction, transaction, rewardTransaction],
        });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false,
        );
        expect(errorMock).toHaveBeenCalled();
      });
    });
  });
});
