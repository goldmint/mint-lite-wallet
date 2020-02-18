package transaction

import (
	"io"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/signer"
)

var _ = Transactioner(&RegisterNode{})

// RegisterNode transaction data
type RegisterNode struct {
	NodeAddress mint.PublicKey
	NodeIP      string
}

// Sign impl
func (t *RegisterNode) Sign(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	ctor := newConstructor(nonce)
	ctor.PutPublicKey(signer.PublicKey()) // signer public key
	ctor.PutPublicKey(t.NodeAddress)      // node public key
	ctor.PutString64(t.NodeIP)            // node ip
	return ctor.Sign(signer)
}

// Parse impl
func (t *RegisterNode) Parse(r io.Reader) (*ParsedTransaction, error) {
	pars, err := newParser(r)
	if err != nil {
		return nil, err
	}
	from := pars.GetPublicKey()         // signer public key
	t.NodeAddress = pars.GetPublicKey() // node public key
	t.NodeIP = pars.GetString64()       // node ip
	return pars.Complete(from)
}

// Code impl
func (t *RegisterNode) Code() Code {
	return RegisterNodeTx
}
