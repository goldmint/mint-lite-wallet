GM Sumus library for JS (port via GopherJS)

## Building

Get GopherJS:
```sh
go get -u github.com/gopherjs/gopherjs
```

Then move the module to the `GOPATH` and build:
```sh
export GOOS="linux"
export GOARCH="amd64"
gopherjs build -m -o sumuslib.js *.go
```

## API

Include `sumuslib.js` and access API via `window.SumusLib` global variable.



### Signer
Private keys and signing (ed25519).

#### Generate ()
Generate a new key pair.
```js
var sig = window.SumusLib.Signer.Generate();
sig.PrivateKey(); // "WNggZGcoWfdMKwGwMY6NbKAeH5qt4QAX3imHSz57T8VBNEbBZ777AV5GqGZ6qemAG2vrbJjcRXV4ZMKLod6yxQJn2zdqx"
sig.PublicKey(); // "26ZwYjaJaGdHwJavpapgwriY3X6YsZZPFXj8g4NXtzcbdgN2hA"
```

#### FromPK (string)
Load a key pair from a Base58 string.
```js
window.SumusLib.Signer.FromPK(
	// private key:
	"WNggZGcoWfdMKwGwMY6NbKAeH5qt4QAX3imHSz57T8VBNEbBZ777AV5GqGZ6qemAG2vrbJjcRXV4ZMKLod6yxQJn2zdqx"
).PublicKey();
// "26ZwYjaJaGdHwJavpapgwriY3X6YsZZPFXj8g4NXtzcbdgN2hA"
```

#### Sign (bytes, string)
Sign a byte array.
```js
window.SumusLib.Signer.Sign(
	// data bytes:
	new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]),
	// private key:
	"WNggZGcoWfdMKwGwMY6NbKAeH5qt4QAX3imHSz57T8VBNEbBZ777AV5GqGZ6qemAG2vrbJjcRXV4ZMKLod6yxQJn2zdqx"
);
// "7Sn8VDSM2wG58VUyGaimNZb1xtnrDrNYwd98xREJcZSCPav8fc64LedGuTGVG9kbSxeF65MNCtGZev1oFB5sZCtdAGWVD"
```

#### Verify (bytes, string, string)
Verify a signature.
```js
var data = Uint8Array.from(window.atob("3q2+7w"), c => c.charCodeAt(0)); // 0xDE 0xAD 0xBE 0xEF
var valid = window.SumusLib.Signer.Verify(
	// data bytes:
	data,
	// data signature:
	"7Sn8VDSM2wG58VUyGaimNZb1xtnrDrNYwd98xREJcZSCPav8fc64LedGuTGVG9kbSxeF65MNCtGZev1oFB5sZCtdAGWVD", 
	// signer's public key:
	"26ZwYjaJaGdHwJavpapgwriY3X6YsZZPFXj8g4NXtzcbdgN2hA"
);
// true
```


### Base58
Base58 (Sumus implementation with checksum) manipulations.

#### Pack (bytes)
Pack bytes into a Base58 string.
```js
window.SumusLib.Base58.Pack(new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]));
// "eFGDJR3ZD7H"
```

#### Unpack (string)
Unpack Base58 string into a byte array.
```js
var result = window.SumusLib.Base58.Unpack("eFGDJR3ZD7H");
result.Valid(); // true
result.Data(); // Uint8Array(4) [222, 173, 190, 239]
```

### Transaction
Transactions signing using a private key.

#### TransferAsset (string, int, string, string, string)
Construct and sign TransferAsset transaction.
```js
var tx = window.SumusLib.Transaction.TransferAsset(
	// private key
	"WNggZGcoWfdMKwGwMY6NbKAeH5qt4QAX3imHSz57T8VBNEbBZ777AV5GqGZ6qemAG2vrbJjcRXV4ZMKLod6yxQJn2zdqx",
	// transaction nonce/ID
	12,
	// destination address
	"26ZwYjaJaGdHwJavpapgwriY3X6YsZZPFXj8g4NXtzcbdgN2hA",
	// token (gold|mnt)
	"gold",
	// amount (18 decimal places)
	"1.000000000000000001"
);
tx.Name(); // "TransferAssetsTransaction"
tx.Digest(); // "KqXCXxhBgtmsdgr4JKYFpqadugr3hhLVm6MzFcYz6Awm21CEL"
tx.Data(); // "0c0000000000000001.....da26c8a277b2904ae01"
```
