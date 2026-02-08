import dotenv from "dotenv";
dotenv.config();

export const MINE_RATE = 1000;
export const INITIAL_DIFFICULTY = 3;

export const GENESIS_DATA = {
  timestamp: 1,
  lastHash: "--------",
  hash: "hash-one",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};

export const redisOptions = {
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD, // <--- Add this line
};

export const STARTING_BALANCE = 1000;

export const REWARD_INPUT = { address: "*authorized-reward*" };

export const MINING_REWARD = 50;

export const MINING_REWARD_INPUT = { address: "*mining-reward*" };
