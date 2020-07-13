package mint

import (
	"encoding/json"
	"fmt"
)

// PublicKeySize is public key length in bytes
const PublicKeySize = 32

// PublicKey bytes
type PublicKey [PublicKeySize]byte

// Bytes of the instance
func (p PublicKey) Bytes() []byte {
	b := make([]byte, len(p[:]))
	copy(b, p[:])
	return b
}

// String packs the instance into a Base58 string
func (p PublicKey) String() string {
	return Pack58(p[:])
}

// StringMask packs the instance into 6+4 a masked Base58 string
func (p PublicKey) StringMask() string {
	return MaskString6P4(p.String())
}

// MarshalJSON impl
func (p PublicKey) MarshalJSON() ([]byte, error) {
	return json.Marshal(p.String())
}

// UnmarshalJSON impl
func (p *PublicKey) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	x, err := ParsePublicKey(s)
	if err != nil {
		return err
	}
	copy(p[:], x[:])
	return nil
}

// ParsePublicKey parses an instance from Base58 string
func ParsePublicKey(s string) (PublicKey, error) {
	var v PublicKey
	b, err := Unpack58(s)
	if err != nil {
		return v, err
	}
	return BytesToPublicKey(b)
}

// MustParsePublicKey parses an instance from Base58 string or panics
func MustParsePublicKey(s string) PublicKey {
	v, err := ParsePublicKey(s)
	if err != nil {
		panic(err)
	}
	return v
}

// BytesToPublicKey creates an instance from a bytes slice
func BytesToPublicKey(b []byte) (PublicKey, error) {
	var v PublicKey
	if len(b) != PublicKeySize {
		return v, fmt.Errorf("invalid length, got %v expected %v", len(b), PublicKeySize)
	}
	copy(v[:], b)
	return v, nil
}

// MustBytesToPublicKey creates an instance from bytes slice or panics
func MustBytesToPublicKey(b []byte) PublicKey {
	v, err := BytesToPublicKey(b)
	if err != nil {
		panic(err)
	}
	return v
}
