package transaction

import (
	"fmt"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/signer"
	"golang.org/x/crypto/sha3"
)

// Verify transaction payload
func Verify(from mint.PublicKey, payload []byte, signature mint.Signature) error {
	if len(payload) == 0 {
		return fmt.Errorf("invalid payload")
	}

	// make payload digest
	hasher := sha3.New256()
	_, err := hasher.Write(payload)
	if err != nil {
		return err
	}
	digest := hasher.Sum(nil)

	// verify
	return signer.Verify(from, digest, signature)
}
