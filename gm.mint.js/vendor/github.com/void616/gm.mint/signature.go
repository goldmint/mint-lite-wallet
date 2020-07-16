package mint

import (
	"encoding/json"
	"fmt"
)

// SignatureSize is signature length in bytes
const SignatureSize = 64

// Signature bytes
type Signature [SignatureSize]byte

// Bytes of the instance
func (s Signature) Bytes() []byte {
	b := make([]byte, len(s[:]))
	copy(b, s[:])
	return b
}

// String packs the instance into a Base58 string
func (s Signature) String() string {
	return Pack58(s[:])
}

// StringMask packs the instance into 6+4 a masked Base58 string
func (s Signature) StringMask() string {
	return MaskString6P4(s.String())
}

// MarshalJSON impl
func (s Signature) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}

// UnmarshalJSON impl
func (s *Signature) UnmarshalJSON(b []byte) error {
	var str string
	if err := json.Unmarshal(b, &str); err != nil {
		return err
	}
	x, err := ParseSignature(str)
	if err != nil {
		return err
	}
	copy(s[:], x[:])
	return nil
}

// ParseSignature parses an instance from Base58 string
func ParseSignature(s string) (Signature, error) {
	var v Signature
	b, err := Unpack58(s)
	if err != nil {
		return v, err
	}
	return BytesToSignature(b)
}

// MustParseSignature parses an instance from Base58 string or panics
func MustParseSignature(s string) Signature {
	v, err := ParseSignature(s)
	if err != nil {
		panic(err)
	}
	return v
}

// BytesToSignature creates an instance from a bytes slice
func BytesToSignature(b []byte) (Signature, error) {
	var v Signature
	if len(b) != SignatureSize {
		return v, fmt.Errorf("invalid length, got %v expected %v", len(b), SignatureSize)
	}
	copy(v[:], b)
	return v, nil
}

// MustBytesToSignature creates an instance from bytes slice or panics
func MustBytesToSignature(b []byte) Signature {
	v, err := BytesToSignature(b)
	if err != nil {
		panic(err)
	}
	return v
}
