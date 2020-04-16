// +build js,wasm

package mnemonic

import (
	"syscall/js"

	mmnemonic "github.com/void616/gm.mint/mnemonic"
	"gm.mint.js/h"
)

// Generate (): string;
func Generate(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	phrase, err := mmnemonic.New()
	if err != nil {
		panic(err)
	}

	return phrase
}
