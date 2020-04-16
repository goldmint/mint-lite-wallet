package mnemonic

import (
	cryptorand "crypto/rand"
	"crypto/sha512"
	"fmt"

	bip39 "github.com/tyler-smith/go-bip39"
	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/internal/ed25519"
	"golang.org/x/crypto/pbkdf2"
)

// New generates a new seed phrase
func New() (phrase string, err error) {

	// random bytes
	entropySize := 32
	entropy := make([]byte, entropySize)
	n, err := cryptorand.Read(entropy)
	if err != nil {
		return
	}
	if n != entropySize {
		err = fmt.Errorf("failed to generate entropy of %v bytes", entropySize)
		return
	}

	// random phrase
	phrase, err = bip39.NewMnemonic(entropy)
	if err != nil {
		return
	}

	return
}

// Recover returns a private key from passed seed phrase
func Recover(phrase, extraWord string) (pvt mint.PrivateKey, err error) {

	// validate phrase
	if !Valid(phrase) {
		err = fmt.Errorf("invalid phrase")
		return
	}

	// hash phrase with salt (at least 8 bytes) and get 32 bytes for ed25519 seeding
	seed := pbkdf2.Key([]byte(phrase), []byte("mintmint"+extraWord), 2048, 32, sha512.New)
	if len(seed) != ed25519.SeedSize {
		err = fmt.Errorf("seed is %v bytes, expected %v bytes", len(seed), ed25519.SeedSize)
		return
	}

	// new ed25519 key
	key := ed25519.NewKeyFromSeed(seed)

	// prehash
	pvt, err = mint.BytesToPrivateKey(key.Prehash())
	if err != nil {
		return
	}

	return
}

// Valid checks seed phrase
func Valid(phrase string) bool {
	_, err := bip39.MnemonicToByteArray(phrase)
	return err == nil
}
