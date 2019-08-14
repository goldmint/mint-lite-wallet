package signer

import (
	"fmt"

	sumuslib "github.com/void616/gm-sumuslib"
	"github.com/void616/gm-sumuslib/signer/ed25519"
)

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

// FromPK makes keypair from prehashed private key
func FromPK(b []byte) (*Signer, error) {

	// check pk size
	if len(b) != 64 {
		return nil, fmt.Errorf("Private key has invalid size %v, expected %v", len(b), 64)
	}

	// copy pk bytes
	pvt := make([]byte, 64)
	copy(pvt, b)

	ret := &Signer{
		privateKey:  pvt,
		publicKey:   ed25519.PublicKeyFromPrehashedPK(pvt),
		initialized: true,
	}

	return ret, nil
}

// ---

// Signer data
type Signer struct {
	initialized bool
	privateKey  []byte
	publicKey   []byte
}

func (s *Signer) assert() {
	if !s.initialized {
		panic("Signer is not initialized")
	}
}

// Sign message with a key
func (s *Signer) Sign(message []byte) sumuslib.Signature {
	s.assert()
	var sig sumuslib.Signature
	copy(sig[:], ed25519.SignWithPrehashed(s.privateKey, s.publicKey, message))
	return sig
}

// PrivateKey of the signer
func (s *Signer) PrivateKey() sumuslib.PrivateKey {
	s.assert()
	var k sumuslib.PrivateKey
	copy(k[:], s.privateKey)
	return k
}

// PublicKey of the signer
func (s *Signer) PublicKey() sumuslib.PublicKey {
	s.assert()
	var k sumuslib.PublicKey
	copy(k[:], s.publicKey)
	return k
}
