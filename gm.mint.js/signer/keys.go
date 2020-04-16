// +build js,wasm

package signer

import (
	"syscall/js"

	"gm.mint.js/h"
)

// PrivateKey (): string;
func PrivateKey(this js.Value, args []js.Value) interface{} {
	defer h.Recover()
	return thisPrivateKey(this).String()
}

// PublicKey (): string;
func PublicKey(this js.Value, args []js.Value) interface{} {
	defer h.Recover()
	return thisPublicKey(this).String()
}
