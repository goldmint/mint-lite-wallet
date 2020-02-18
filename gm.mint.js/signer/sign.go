// +build js,wasm

package signer

import (
	"syscall/js"

	"gm.mint.js/h"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/amount"
	"github.com/void616/gm.mint/transaction"
)

// SignMessage (message:Uint8Array):string - signs a message, returns signature as Base58 string
func SignMessage(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	sig := thisSigner(this)

	msg, err := h.GetBytes(args[0])
	if err != nil {
		panic(err)
	}

	return sig.Sign(msg).String()
}

// SignTransferAssetTx (nonce:number, address:string, token:string, tokenAmount:string):Transaction - signs transfer asset tx
func SignTransferAssetTx(this js.Value, args []js.Value) interface{} {
	defer h.Recover()

	pub, err := mint.ParsePublicKey(args[1].String())
	if err != nil {
		panic("invalid address")
	}
	tok, err := mint.ParseToken(args[2].String())
	if err != nil {
		panic("invalid token")
	}
	amo, err := amount.FromString(args[3].String())
	if err != nil {
		panic("invalid amount")
	}

	txCode := transaction.TransferAssetTx
	stx, err := (&transaction.TransferAsset{
		Address: pub,
		Token:   tok,
		Amount:  amo,
	}).Sign(thisSigner(this), uint64(args[0].Int()))
	if err != nil {
		panic("failed to sign transaction")
	}

	return newTransaction(stx.Data, txCode, stx.Digest)
}
