package transaction

import (
	"fmt"
	"io"

	"github.com/void616/gm.mint/signer"
)

var _ = Transactioner(&UserData{})

// UserData transaction data
type UserData struct {
	Data []byte
}

// Sign impl
func (t *UserData) Sign(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	if t.Data == nil {
		return nil, fmt.Errorf("data is empty")
	}

	ctor := newConstructor(nonce)
	ctor.PutPublicKey(signer.PublicKey()) // signer public key
	ctor.PutUint32(uint32(len(t.Data)))   // data size
	ctor.PutBytes(t.Data)                 // data bytes
	return ctor.Sign(signer)
}

// Parse impl
func (t *UserData) Parse(r io.Reader) (*ParsedTransaction, error) {
	pars, err := newParser(r)
	if err != nil {
		return nil, err
	}
	from := pars.GetPublicKey()  // signer public key
	size := pars.GetUint32()     // data size
	t.Data = pars.GetBytes(size) // data bytes
	return pars.Complete(from)
}

// Code impl
func (t *UserData) Code() Code {
	return UserDataTx
}
