export interface Wallet {
  id: number,
  name: string,
  publicKey: string,
  privateKey: string,
  nonce: {
    main: number,
    test: number
  },
  tx?: {
    hash: string,
    endTime: number,
    amount: number,
    token: string,
    network: string,
    data: {
      data: string,
      name: string
    }
  }
}
