// +build js,wasm

package signer

import (
	"encoding/hex"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/transaction"
)

func newTransaction(data []byte, code transaction.Code, dig mint.Digest) map[string]interface{} {
	return map[string]interface{}{
		"Data":   hex.EncodeToString(data),
		"Name":   code.String(),
		"Digest": dig.String(),
	}
}
