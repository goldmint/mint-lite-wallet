WASM implementation of Mint blockchain core library.

## Build
```sh
./build.sh
```

## Usage
Load `/dist/mint.wasm` (see `dist/index.html`) and access library with `mint` global variable.

## JS Methods
For sake of clarity, described API is in TypeScript form (probably). \
Public keys (addresses), private keys, digests and signatures are in form of Base58 string. \
Valid `token` is "GOLD" or "MNT".

```ts

// Global methods via `mint` global variable:

// Packs bytes into Base58 string
mint.Base58.Pack(bytes: Uint8Array, length: number):string;
// Checks Base58 string
mint.Base58.Valid(base58: string): boolean;
// Unpacks Base58 string into bytes array
mint.Base58.Unpack(base58: string): Uint8Array;

// Generates signer with random private key
mint.Signer.Generate(): Signer;
// Creates signer from Base58 private key
mint.Signer.FromPK(privateKey: string): Signer;

// Generates random seed phrase
mint.Mnemonic.Generate(): string;
// Checks seed phrase
mint.Mnemonic.Valid(seedPhrase: string): boolean;
// Returns private key from seed phrase salted with optional password (extra word)
mint.Mnemonic.Recover(seedPhrase: string, extraWord?: string): string;

// Verifies a signed message
mint.Verify(message: Uint8Array, signature: string, publicKey: string): boolean;


// Signer instance
class Signer {
	// Returns signer's private key as Base58 string
	PrivateKey(): string;
	// Returns signer's public key as Base58 string
	PublicKey(): string;
	// Signs a message, returns signature as Base58 string
	SignMessage(message: Uint8Array): string;
	// Signs "transfer asset" transaction
	SignTransferAssetTx(nonce: number, address: string, token: string, tokenAmount: string): Transaction;
};


// Transaction instance
class Transaction {
	// Hex-encoded transaction data
	Data: string;
	// Transaction name
	Name: string;
	// Digest of the transaction
	Digest: string;
}

```
