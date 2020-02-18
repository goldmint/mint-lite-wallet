package signer

import (
	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/signer/ed25519"
)

// Signer data
type Signer struct {
	initialized bool
	privateKey  []byte
	publicKey   []byte
}

// New made from random keypair
func New() (*Signer, error) {

	// generate pk
	_, pk, err := ed25519.GenerateKey(nil)
	if err != nil {
		return nil, err
	}

	// pk contains seed+public - prehash it
	pkPrehashed := pk.Prehash()

	return &Signer{
		privateKey:  pkPrehashed,
		publicKey:   ed25519.PublicKeyFromPrehashedPK(pkPrehashed),
		initialized: true,
	}, nil
}

// FromPrivateKey makes keypair from prehashed private key
func FromPrivateKey(k mint.PrivateKey) *Signer {
	return &Signer{
		privateKey:  k[:],
		publicKey:   ed25519.PublicKeyFromPrehashedPK(k[:]),
		initialized: true,
	}
}

// FromBytes makes keypair from prehashed private key
func FromBytes(b []byte) (*Signer, error) {
	pvt, err := mint.BytesToPrivateKey(b)
	if err != nil {
		return nil, err
	}
	ret := &Signer{
		privateKey:  pvt[:],
		publicKey:   ed25519.PublicKeyFromPrehashedPK(pvt[:]),
		initialized: true,
	}
	return ret, nil
}

// ---

func (s *Signer) assert() {
	if !s.initialized {
		panic("signer is not initialized")
	}
}

// Sign message with a key
func (s *Signer) Sign(message []byte) mint.Signature {
	s.assert()
	var sig mint.Signature
	copy(sig[:], ed25519.SignWithPrehashed(s.privateKey, s.publicKey, message))
	return sig
}

// PrivateKey of the signer
func (s *Signer) PrivateKey() mint.PrivateKey {
	s.assert()
	var k mint.PrivateKey
	copy(k[:], s.privateKey)
	return k
}

// PublicKey of the signer
func (s *Signer) PublicKey() mint.PublicKey {
	s.assert()
	var k mint.PublicKey
	copy(k[:], s.publicKey)
	return k
}
