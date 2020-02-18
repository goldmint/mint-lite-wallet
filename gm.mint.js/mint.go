// +build js,wasm

package main

import (
	"fmt"
	"syscall/js"

	"gm.mint.js/base58"
	"gm.mint.js/signer"
	"gm.mint.js/verify"
)

var stopper chan struct{}

func init() {
	stopper = make(chan struct{})
}

func main() {
	js.Global().Set("mint", js.ValueOf(
		map[string]interface{}{
			"Signer": map[string]interface{}{
				"Generate": js.FuncOf(signer.Generate),
				"FromPK":   js.FuncOf(signer.FromPK),
			},
			"Base58": map[string]interface{}{
				"Pack":   js.FuncOf(base58.Pack),
				"Valid":  js.FuncOf(base58.Valid),
				"Unpack": js.FuncOf(base58.Unpack),
			},
			"Verify": js.FuncOf(verify.Verify),
			"Exit": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				close(stopper)
				return js.Undefined()
			}),
		},
	))

	fmt.Println("mint started")
	<-stopper
}
