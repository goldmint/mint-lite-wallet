export const environment = {
  production: false,
  webWallet: 'https://app.goldmint.io/#/scanner/address/',
  networkUrl: {
    main: 'https://service.goldmint.io/sumus/mainnet/v1',
    test: 'https://service.goldmint.io/sumus/testnet/v1'
  },
  rateUrl: 'https://service.goldmint.io/info/rate/v1',
  detailsTxInfoLink: 'https://app.goldmint.io/#/scanner/tx/',
  timeTxFailed: 1800000, // 30 minutes,
  backupVersion: 2
};
