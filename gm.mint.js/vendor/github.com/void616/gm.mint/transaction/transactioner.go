package transaction

import (
	"fmt"
	"io"

	"github.com/void616/gm.mint/signer"
)

// Transactioner is a transaction interface
type Transactioner interface {
	Sign(signer *signer.Signer, nonce uint64) (*SignedTransaction, error)
	Parse(r io.Reader) (*ParsedTransaction, error)
	Code() Code
}

// CodeToTransaction returns corresponding transaction data holder
func CodeToTransaction(code Code) (Transactioner, error) {
	switch code {
	case RegisterNodeTx:
		return &RegisterNode{}, nil
	case UnregisterNodeTx:
		return &UnregisterNode{}, nil
	case SetWalletTagTx:
		return &SetWalletTag{}, nil
	case UnsetWalletTagTx:
		return &UnsetWalletTag{}, nil
	case UserDataTx:
		return &UserData{}, nil
	case TransferAssetTx:
		return &TransferAsset{}, nil
	case DistributionFeeTx:
		return &DistributionFee{}, nil
	}
	return nil, fmt.Errorf("transaction code %v is not implemented", code)
}
