JS implementation of GM Mint Blockchain Library (WASM)

## Build
```sh
./build.sh
```

## Usage
Load `/dist/mint.wasm` (see `dist/index.html`) and access library with `mint` global variable.

```ts

// Base58
mint.Pack(bytes:Uint8Array, length:number):string // packs bytes into Base58
mint.Valid(base58:string):boolean // checks Base58 string
mint.Unpack(base58:string):Uint8Array // unpacks Base58 string into bytes array

// Signer creation
mint.Signer.Generate():Signer // generates a random private key
mint.Signer.FromPK(privateKey:string):Signer // creates signer from Base58 private key

// Signer's methods
Signer.PrivateKey():string // returns signer's private key
Signer.PublicKey():string // returns signer's public key
Signer.SignMessage(message:Uint8Array):string // signs a message, returns signature as Base58 string
Signer.SignTransferAssetTx(nonce:number, address:string, token:string, tokenAmount:string):Transaction // signs transfer asset tx

// Signed transaction fields:
Transaction.Data // hex-encoded data
Transaction.Name // name
Transaction.Digest // digest as Base58

// Signed message verification
Verify(message:Uint8Array, signature:string, publicKey:string):boolean // verifies a signature
```