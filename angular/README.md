Goldmint Lite Wallet



## Integration



### Selected account

```js
window.GoldMint.getAccount().then(res => {
	if (res.length == 0) {
		// user is logged out
	} else {
		// res[0] string contains a public key (Base58)
	}
})
```



### Balance

```js
window.GoldMint.getBalance(
	publicKey // string, Base58 public key
).then(res => {
	if (res == null) {
		// user is logged out
	} else {
		// res is an object: {gold: "0.000000000000000000", mint: "0.000000000000000000"} 
	}
})
```



### Transaction

```js
window.GoldMint.sendTransaction(
	to,    // string, Base58 public key
	token, // string, MNT|GOLD
	amount // string, float-point up to 18 decimal places
).then(res => {
	if (res == null) {
		// user is logged out
	} else {
		// res is a string and contains transaction digest (Base58)
	}
});

// OR

window.GoldMint.openSendTokenPage(
	to,    // string, Base58 public key
	token, // string, MNT|GOLD
).then(res => {
	if (res == null) {
		// user is logged out
	} else {
		// res is true
	}
});
```



### Message signing

```js
window.GoldMint.signMessage(
	data,     // Uint8Array, message bytes
	publicKey // string, optional, Base58 public key of desired account
).then(res => {
	if (res == null) {
		// user is logged out
		// or user declined a request
		// or specified public key wasn't found
		// or specified parameters are invalid
	} else {
		// res is a string and contains a signature (Base58)
	}
})
```


### Signature validation

```js
window.GoldMint.verifySignature(
	data,      // Uint8Array, message bytes
	signature, // string, Base58 signature
	publicKey  // string, Base58 public key
).then(res => {
	if (res == null) {
		// user is logged out
		// or specified parameters are invalid
	} else {
		// res is a bool, true means signature is valid, false otherwise
	}
})
```



## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.7.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
