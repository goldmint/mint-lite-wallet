export interface Wallet {
  id: number,
  name: string,
  publicKey: string,
  privateKey: string,
  tx?: {
    hash: string,
    endTime: number
  }
}