Goldmint Lite Wallet Extension

## Usage

```ts
// getAccount() returns currently selected account address
GoldMint.getAccount(): Promise<string[]> // ['MoTjAg69racozaceaTgfNwmy4q9bpdtJ6imbSghURUatB7E3P']

// getBalance() checks balance of the `address`
GoldMint.getBalance(address: string): Promise<object> // {mint: "0.000000000000000000", gold: "0.000000000000000000"}

// getCurrentNetwork() returns currently selected network
GoldMint.getCurrentNetwork(): Promise<string> // 'main'


// sendTransaction() tries to send `amount` of `token` from currently selected wallet to the `address`. Returns transaction `digest`
GoldMint.sendTransaction(address: string, token: string, amount: number): Promise<string>

// openSendTokenPage() opens token sending page in Goldmint Lite Wallet extension
GoldMint.openSendTokenPage(address: string, token: string, amount: number): Promise<boolean>


// signMessage() prompts user to sign `message` bytes (ed25519) with currently selected account's private key. Returns `signature`
GoldMint.signMessage(message: Uint8Array): Promise<string>

// verifySignature() verifies `signature` of `message` bytes (ed25519) signed by an owner of `publicKey` (address)
GoldMint.verifySignature(message: Uint8Array, signature: string, publicKey: string): Promise<boolean>
```

Notes:
* `address` is 32 bytes of an address, Base58-encoded (+4 bytes of checksum)
* `amount` is token amount (string, 18 decimal places)
* `digest` is 32 bytes of a digest, Base58-encoded (+4 bytes of checksum)
* `signature` is 64 bytes of a signature, Base58-encoded (+4 bytes of checksum)
* `token` is "GOLD" or "MNT"