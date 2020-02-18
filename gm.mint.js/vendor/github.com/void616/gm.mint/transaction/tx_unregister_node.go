package transaction

import (
	"io"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/signer"
)

var _ = Transactioner(&UnregisterNode{})

// UnregisterNode transaction data
type UnregisterNode struct {
	NodeAddress mint.PublicKey
}

// Sign impl
func (t *UnregisterNode) Sign(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	ctor := newConstructor(nonce)
	ctor.PutPublicKey(signer.PublicKey()) // signer public key
	ctor.PutPublicKey(t.NodeAddress)      // node public key
	return ctor.Sign(signer)
}

// Parse impl
func (t *UnregisterNode) Parse(r io.Reader) (*ParsedTransaction, error) {
	pars, err := newParser(r)
	if err != nil {
		return nil, err
	}
	from := pars.GetPublicKey()         // signer public key
	t.NodeAddress = pars.GetPublicKey() // node public key
	return pars.Complete(from)
}

// Code impl
func (t *UnregisterNode) Code() Code {
	return UnregisterNodeTx
}
