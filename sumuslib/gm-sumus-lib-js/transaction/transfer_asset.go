package transaction

import (
	"encoding/hex"

	"github.com/gopherjs/gopherjs/js"
	sumuslib "github.com/void616/gm-sumuslib"
	"github.com/void616/gm-sumuslib/amount"
	"github.com/void616/gm-sumuslib/signer"
	"github.com/void616/gm-sumuslib/transaction"
)

// TransferAsset constructs and signs a transaction that sends an asset, returning `Result`
func TransferAsset(privateKey string, nonce uint64, address string, token string, tokenAmount string) *js.Object {
	b, err := sumuslib.Unpack58(privateKey)
	if err != nil {
		panic("Invalid private key")
	}
	sig, err := signer.FromPK(b)
	if err != nil {
		panic("Failed to make signer")
	}

	addressBytes, err := sumuslib.UnpackAddress58(address)
	if err != nil {
		panic("Invalid address")
	}

	tokenEnum, err := sumuslib.ParseToken(token)
	if err != nil {
		panic("Unknown token specified")
	}

	amo := amount.NewFloatString(tokenAmount)
	if amo == nil {
		panic("Invlid amount")
	}

	stx, err := (&transaction.TransferAsset{
		Address: addressBytes,
		Token:   tokenEnum,
		Amount:  amo,
	}).Construct(sig, nonce)
	if err != nil {
		panic("Failed to sign transaction")
	}

	return js.MakeWrapper(
		&Result{
			mName:   sumuslib.TransactionTransferAssets.String(),
			mData:   hex.EncodeToString(stx.Data),
			mDigest: sumuslib.Pack58(stx.Digest[:]),
		},
	)
}
