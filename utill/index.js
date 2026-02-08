import elliptic from "elliptic";
import cryptoHash from "../utill/crypto-hash.js";

export const ec = new elliptic.ec("secp256k1");

export const verifySignature = ({ publicKey, data, signature }) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, "hex");
  return keyFromPublic.verify(cryptoHash(data), signature);
};
