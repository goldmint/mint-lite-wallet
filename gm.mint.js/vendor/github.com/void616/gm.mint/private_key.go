package mint

import (
	"encoding/json"
	"fmt"

	"github.com/void616/gm.mint/internal/ed25519"
)

// PrivateKeySize is private key length in bytes
const PrivateKeySize = 64

// PrivateKey bytes
type PrivateKey [PrivateKeySize]byte

// NewPrivateKey generates a new random private key
func NewPrivateKey() (p PrivateKey, err error) {
	_, epk, err := ed25519.GenerateKey(nil)
	if err != nil {
		return
	}

	// pk contains seed+public, prehash it
	b := epk.Prehash()
	copy(p[:], b[:64])
	return
}

// MustNewPrivateKey generates a new random private key or panics on error
func MustNewPrivateKey() PrivateKey {
	p, err := NewPrivateKey()
	if err != nil {
		panic(err)
	}
	return p
}

// PublicKey of the private key
func (p PrivateKey) PublicKey() PublicKey {
	pub, err := BytesToPublicKey(ed25519.PublicKeyFromPrehashedPK(p[:]))
	if err != nil {
		panic(err)
	}
	return pub
}

// Bytes of the instance
func (p PrivateKey) Bytes() []byte {
	b := make([]byte, len(p[:]))
	copy(b, p[:])
	return b
}

// String packs the instance into a Base58 string
func (p PrivateKey) String() string {
	return Pack58(p[:])
}

// StringMask packs the instance into 6+4 a masked Base58 string
func (p PrivateKey) StringMask() string {
	return MaskString6P4(p.String())
}

// MarshalJSON impl
func (p PrivateKey) MarshalJSON() ([]byte, error) {
	return json.Marshal(p.String())
}

// UnmarshalJSON impl
func (p *PrivateKey) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	x, err := ParsePrivateKey(s)
	if err != nil {
		return err
	}
	copy(p[:], x[:])
	return nil
}

// ParsePrivateKey parses an instance from Base58 string
func ParsePrivateKey(s string) (PrivateKey, error) {
	var v PrivateKey
	b, err := Unpack58(s)
	if err != nil {
		return v, err
	}
	return BytesToPrivateKey(b)
}

// MustParsePrivateKey parses an instance from Base58 string or panics
func MustParsePrivateKey(s string) PrivateKey {
	v, err := ParsePrivateKey(s)
	if err != nil {
		panic(err)
	}
	return v
}

// BytesToPrivateKey creates an instance from a bytes slice
func BytesToPrivateKey(b []byte) (PrivateKey, error) {
	var v PrivateKey
	if len(b) != PrivateKeySize {
		return v, fmt.Errorf("invalid length, got %v expected %v", len(b), PrivateKeySize)
	}
	copy(v[:], b)
	return v, nil
}

// MustBytesToPrivateKey creates an instance from bytes slice or panics
func MustBytesToPrivateKey(b []byte) PrivateKey {
	v, err := BytesToPrivateKey(b)
	if err != nil {
		panic(err)
	}
	return v
}
