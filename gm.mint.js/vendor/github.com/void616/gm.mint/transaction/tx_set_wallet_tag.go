package transaction

import (
	"fmt"
	"io"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/signer"
)

var _ = Transactioner(&SetWalletTag{})

// SetWalletTag transaction data
type SetWalletTag struct {
	Address mint.PublicKey
	Tag     mint.WalletTag
}

// Sign impl
func (t *SetWalletTag) Sign(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	ctor := newConstructor(nonce)
	ctor.PutPublicKey(signer.PublicKey()) // signer public key
	ctor.PutPublicKey(t.Address)          // address / public key
	ctor.PutByte(uint8(t.Tag))            // tag
	return ctor.Sign(signer)
}

// Parse impl
func (t *SetWalletTag) Parse(r io.Reader) (*ParsedTransaction, error) {
	pars, err := newParser(r)
	if err != nil {
		return nil, err
	}
	from := pars.GetPublicKey()     // signer public key
	t.Address = pars.GetPublicKey() // address / public key
	tagCode := pars.GetByte()       // tag
	// ensure tag is valid
	if !mint.ValidWalletTag(tagCode) {
		return nil, fmt.Errorf("unknown wallet tag with code `%v`", tagCode)
	}
	t.Tag = mint.WalletTag(tagCode)
	return pars.Complete(from)
}

// Code impl
func (t *SetWalletTag) Code() Code {
	return SetWalletTagTx
}
