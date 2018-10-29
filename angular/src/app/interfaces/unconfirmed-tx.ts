export interface UnconfirmedTx {
  id: string,
  tabId: string,
  from: string,
  to: string,
  token: string,
  amount: number,
  network: string
}