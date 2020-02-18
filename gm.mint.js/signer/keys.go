// +build js,wasm

package signer

import (
	"syscall/js"

	"gm.mint.js/h"
)

// PrivateKey ():string - returns signer's private key
func PrivateKey(this js.Value, args []js.Value) interface{} {
	defer h.Recover()
	return thisPrivateKey(this).String()
}

// PublicKey ():string - returns signer's public key
func PublicKey(this js.Value, args []js.Value) interface{} {
	defer h.Recover()
	return thisPublicKey(this).String()
}
