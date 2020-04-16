// +build js,wasm

package signer

import (
	"syscall/js"

	mint "github.com/void616/gm.mint"
	msigner "github.com/void616/gm.mint/signer"
	"gm.mint.js/h"
)

// Generate (): Signer;
func Generate(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	sig, err := msigner.New()
	if err != nil {
		panic(err)
	}

	return newSigner(sig.PrivateKey(), sig.PublicKey())
}

// FromPK (privateKey: string): Signer;
func FromPK(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	pvt, err := mint.ParsePrivateKey(args[0].String())
	if err != nil {
		panic(err)
	}
	sig := msigner.FromPrivateKey(pvt)

	return newSigner(sig.PrivateKey(), sig.PublicKey())
}

// ---

func newSigner(pvt mint.PrivateKey, pub mint.PublicKey) map[string]interface{} {
	pvtarr, err := h.GetUint8Array(pvt[:])
	if err != nil {
		panic(err)
	}
	pubarr, err := h.GetUint8Array(pub[:])
	if err != nil {
		panic(err)
	}

	return map[string]interface{}{
		"_privateKey":         pvtarr,
		"_publicKey":          pubarr,
		"PrivateKey":          js.FuncOf(PrivateKey),
		"PublicKey":           js.FuncOf(PublicKey),
		"SignMessage":         js.FuncOf(SignMessage),
		"SignTransferAssetTx": js.FuncOf(SignTransferAssetTx),
	}
}

func thisPrivateKey(this js.Value) mint.PrivateKey {
	b, err := h.GetBytes(this.Get("_privateKey"))
	if err != nil {
		panic(err)
	}
	pvt, err := mint.BytesToPrivateKey(b)
	if err != nil {
		panic(err)
	}
	return pvt
}

func thisSigner(this js.Value) *msigner.Signer {
	pvt := thisPrivateKey(this)
	return msigner.FromPrivateKey(pvt)
}

func thisPublicKey(this js.Value) mint.PublicKey {
	b, err := h.GetBytes(this.Get("_publicKey"))
	if err != nil {
		panic(err)
	}
	pub, err := mint.BytesToPublicKey(b)
	if err != nil {
		panic(err)
	}
	return pub
}
