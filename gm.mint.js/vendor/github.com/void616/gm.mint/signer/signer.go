package signer

import (
	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/internal/ed25519"
)

// Signer data
type Signer struct {
	private mint.PrivateKey
	public  mint.PublicKey
}

// New made from random keypair
func New() (*Signer, error) {
	p, err := mint.NewPrivateKey()
	if err != nil {
		return nil, err
	}
	return FromPrivateKey(p), nil
}

// FromPrivateKey makes keypair from prehashed private key
func FromPrivateKey(k mint.PrivateKey) *Signer {
	return &Signer{
		private: k,
		public:  k.PublicKey(),
	}
}

// Sign message with a key
func (s *Signer) Sign(message []byte) mint.Signature {
	var sig mint.Signature
	copy(sig[:], ed25519.SignWithPrehashed(s.private[:], s.public[:], message))
	return sig
}

// PrivateKey of the signer
func (s *Signer) PrivateKey() mint.PrivateKey {
	return s.private
}

// PublicKey of the signer
func (s *Signer) PublicKey() mint.PublicKey {
	return s.public
}
