export interface Wallet {
  id: number,
  name: string,
  publicKey: string,
  privateKey: string,
  nonce: number,
  tx?: {
    hash: string,
    endTime: number,
    amount: number,
    token: string,
    network: string
  }
}