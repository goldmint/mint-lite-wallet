export interface TransactionList {
  blockNumber: number,
  createDate: Date,
  destinationWallet: string,
  id: number,
  sourceWallet: string,
  timeStamp: Date,
  tokenType: string,
  tokensCount: number,
  transactionFee: number,
  transactionId: number,
  uniqueId: string
}