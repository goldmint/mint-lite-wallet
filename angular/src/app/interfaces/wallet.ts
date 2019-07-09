export interface Wallet {
  id: number;
  name: string;
  publicKey: string;
  privateKey: string;
  tx?: Tx[] | any;
}

export interface Tx {
  hash: string;
  endTime: number;
  amount: number;
  token: string;
  network: string;
  nonce: number;
  blockId: number;
  data: {
    data: string;
    name: string;
  }
}
