// +build js,wasm

package mnemonic

import (
	"syscall/js"

	mmnemonic "github.com/void616/gm.mint/mnemonic"
	"gm.mint.js/h"
)

// Recover (seedPhrase: string, extraWord?: string): string;
func Recover(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	seedPhrase := args[0].String()

	extraWord := ""
	if len(args) > 1 {
		extraWord = args[1].String()
	}

	pvt, err := mmnemonic.Recover(seedPhrase, extraWord)
	if err != nil {
		panic(err)
	}

	return pvt.String()
}
