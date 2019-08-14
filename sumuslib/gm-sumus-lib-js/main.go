package main

import (
	"gm-sumus-lib-js/base58"
	"gm-sumus-lib-js/signer"
	"gm-sumus-lib-js/transaction"

	"github.com/gopherjs/gopherjs/js"
)

func main() {
	mapping := map[string]interface{}{
		"Signer": map[string]interface{}{
			"Generate": signer.Generate,
			"FromPK":   signer.FromPK,
			"Sign":     signer.Sign,
			"Verify":   signer.Verify,
		},
		"Base58": map[string]interface{}{
			"Pack":   base58.Pack,
			"Unpack": base58.Unpack,
		},
		"Transaction": map[string]interface{}{
			"TransferAsset": transaction.TransferAsset,
		},
	}
	if js.Global != nil {
		js.Global.Set("SumusLib", mapping)
	}
}
