package transaction

import (
	"io"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/amount"
	"github.com/void616/gm.mint/signer"
)

var _ = Transactioner(&DistributionFee{})

// DistributionFee transaction data
type DistributionFee struct {
	OwnerAddress mint.PublicKey
	AmountMNT    *amount.Amount
	AmountGOLD   *amount.Amount
}

// Sign impl
func (t *DistributionFee) Sign(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	ctor := newConstructor(nonce)
	ctor.PutPublicKey(signer.PublicKey()) // signer public key
	ctor.PutPublicKey(t.OwnerAddress)     // owner address / public key
	ctor.PutAmount(t.AmountMNT)           // mnt amount
	ctor.PutAmount(t.AmountGOLD)          // gold amount
	return ctor.Sign(signer)
}

// Parse impl.
func (t *DistributionFee) Parse(r io.Reader) (*ParsedTransaction, error) {
	pars, err := newParser(r)
	if err != nil {
		return nil, err
	}

	from := pars.GetPublicKey()          // signer public key
	t.OwnerAddress = pars.GetPublicKey() // owner address / public key
	t.AmountMNT = pars.GetAmount()       // mnt amount
	t.AmountGOLD = pars.GetAmount()      // gold amount

	return pars.Complete(from)
}

// Code impl
func (t *DistributionFee) Code() Code {
	return DistributionFeeTx
}
