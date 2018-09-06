import {Wallet} from "./wallet";

export interface StorageData {
  identify: string,
  currentWallet: number,
  wallets: Wallet[]
}