// +build js,wasm

package verify

import (
	"syscall/js"

	mint "github.com/void616/gm.mint"
	msigner "github.com/void616/gm.mint/signer"
	"gm.mint.js/h"
)

// Verify (message:Uint8Array, signature:string, publicKey:string):boolean - verifies a signature
func Verify(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	message, err := h.GetBytes(args[0])
	if err != nil {
		panic(err)
	}

	sig, err := mint.ParseSignature(args[1].String())
	if err != nil {
		panic("invalid signature")
	}

	pub, err := mint.ParsePublicKey(args[2].String())
	if err != nil {
		panic("invalid public key")
	}

	return msigner.Verify(pub, message, sig) == nil
}
