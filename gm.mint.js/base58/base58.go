// +build js,wasm

package base58

import (
	"syscall/js"

	mint "github.com/void616/gm.mint"
	"gm.mint.js/h"
)

// Pack (bytes:Uint8Array, length:number):string - packs bytes into Base58
func Pack(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	b, err := h.GetBytes(args[0])
	if err != nil {
		panic(err)
	}
	return mint.Pack58(b)
}

// Valid (base58:string):boolean - checks Base58 string
func Valid(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	_, err := mint.Unpack58(args[0].String())
	return err == nil
}

// Unpack (base58:string):Uint8Array - unpacks Base58 string into bytes array
func Unpack(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	b, err := mint.Unpack58(args[0].String())
	if err != nil {
		panic("invalid base58 string")
	}
	arr, err := h.GetUint8Array(b)
	if err != nil {
		panic(err)
	}
	return arr
}
