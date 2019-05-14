export const environment = {
  production: false,
  webWallet: {
    main: 'https://app.goldmint.io/#/scanner/address/',
    test: 'https://staging.goldmint.io/cabinet/#/scanner/address/'
  },
  networkUrl: {
    main: 'https://service.goldmint.io/sumus/mainnet/v1',
    test: 'https://service.goldmint.io/sumus/testnet/v1'
  },
  detailsTxInfoLink: {
    main: 'https://app.goldmint.io/#/scanner/tx/',
    test: 'https://staging.goldmint.io/cabinet/#/scanner/tx/'
  },
  timeTxFailed: 1800000, // 30 minutes,
  backupVersion: 2
};
