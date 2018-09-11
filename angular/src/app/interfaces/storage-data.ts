import {Wallet} from "./wallet";

export interface StorageData {
  currentWallet: number,
  wallets: Wallet[]
}