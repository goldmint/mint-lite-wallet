export const environment = {
  production: true,
  webWallet: 'https://app.cyberbridge.ee/#/scanner/address/',
  networkUrl: {
    main: 'https://service.goldmint.io/mint/mainnet/v1',
    test: 'https://service.goldmint.io/mint/testnet/v1'
  },
  rateUrl: 'https://service.goldmint.io/info/rate/v1',
  detailsTxInfoLink: 'https://app.cyberbridge.ee/#/scanner/tx/',
  timeTxFailed: 1800000, // 30 minutes,
  backupVersion: 2
};
