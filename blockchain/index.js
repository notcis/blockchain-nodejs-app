import Block from "./block.js"; // นำเข้าคลาส Block จากไฟล์ block.js
import cryptoHash from "../utill/crypto-hash.js"; // นำเข้าฟังก์ชัน cryptoHash จากไฟล์ crypto-hash.js
import { MINING_REWARD, REWARD_INPUT } from "../config.js"; // นำเข้าค่าคงที่สำหรับการขุดรางวัลและอินพุตของรางวัลจากไฟล์ config.js
import Transaction from "../wallet/transaction.js"; // นำเข้าคลาส Transaction จากไฟล์ transaction.js
import Wallet from "../wallet/index.js"; // นำเข้าคลาส Wallet จากไฟล์ index.js ในโฟลเดอร์ wallet

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });

    this.chain.push(newBlock);
  }

  replaceChain(chain, validateTransactions, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error(
        "The incoming chain must be longer. Current length:",
        this.chain.length,
        "Incoming length:",
        chain.length,
      );
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming chain must be valid.");
      return;
    }

    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error("The incoming chain has invalid transaction data.");
      return;
    }

    if (onSuccess) onSuccess();
    console.log("replacing chain with", chain);
    this.chain = chain;
  }

  validTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionCount = 0;

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;

          if (rewardTransactionCount > 1) {
            console.error("Miner rewards exceeds limit");
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error("Miner reward amount is invalid");
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error("Invalid transaction");
            return false;
          }

          // Create a sub-chain that includes all blocks *before* the current block 'i'
          const recentChain = chain.slice(0, i);
          const trueBalance = Wallet.calculateBalance({
            chain: recentChain, // ใช้ sub-chain สำหรับการคำนวณยอดคงเหลือ
            address: transaction.input.address,
          });

          if (transaction.input.amount !== trueBalance) {
            console.error("Invalid input amount");
            return false;
          }

          if (transactionSet.has(transaction)) {
            console.error(
              "An identical transaction appears more than once in the block",
            );
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    return true;
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
      const actualLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty,
      );

      if (hash !== validatedHash) return false;

      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
    }

    return true;
  }
}

export default Blockchain; // ส่งออกคลาส Blockchain เป็นค่า default
