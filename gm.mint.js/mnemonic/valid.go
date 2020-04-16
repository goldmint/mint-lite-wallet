// +build js,wasm

package mnemonic

import (
	"syscall/js"

	mmnemonic "github.com/void616/gm.mint/mnemonic"
	"gm.mint.js/h"
)

// Valid (seedPhrase: string): boolean;
func Valid(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	seedPhrase := args[0].String()

	return mmnemonic.Valid(seedPhrase)
}
