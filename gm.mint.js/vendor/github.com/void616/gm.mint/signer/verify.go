package signer

import (
	"fmt"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/signer/ed25519"
)

// Verify a message with a public key of a signer
func Verify(pub mint.PublicKey, message []byte, sig mint.Signature) error {

	// check public key size
	if len(pub) != ed25519.PublicKeySize {
		return fmt.Errorf("public key has invalid size %v, expected %v", len(pub), ed25519.PublicKeySize)
	}

	// check message size
	if len(message) == 0 {
		return fmt.Errorf("message has invalid size %v, expected at least 1", len(message))
	}

	// check signature size
	if len(sig) != ed25519.SignatureSize {
		return fmt.Errorf("signature has invalid size %v, expected %v", len(sig), ed25519.SignatureSize)
	}

	// verify
	if !ed25519.Verify(pub[:], message, sig[:]) {
		return fmt.Errorf("invalid signature for this message")
	}

	return nil
}
