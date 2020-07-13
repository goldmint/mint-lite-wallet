package mint

import (
	"encoding/json"
	"fmt"
)

// DigestSize is digest length in bytes
const DigestSize = 32

// Digest bytes
type Digest [DigestSize]byte

// Bytes of the instance
func (d Digest) Bytes() []byte {
	b := make([]byte, len(d[:]))
	copy(b, d[:])
	return b
}

// String packs the instance into a Base58 string
func (d Digest) String() string {
	return Pack58(d[:])
}

// StringMask packs the instance into 6+4 a masked Base58 string
func (d Digest) StringMask() string {
	return MaskString6P4(d.String())
}

// MarshalJSON impl
func (d Digest) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.String())
}

// UnmarshalJSON impl
func (d *Digest) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	x, err := ParseDigest(s)
	if err != nil {
		return err
	}
	copy(d[:], x[:])
	return nil
}

// ParseDigest parses an instance from Base58 string
func ParseDigest(s string) (Digest, error) {
	var v Digest
	b, err := Unpack58(s)
	if err != nil {
		return v, err
	}
	return BytesToDigest(b)
}

// MustParseDigest parses an instance from Base58 string or panics
func MustParseDigest(s string) Digest {
	v, err := ParseDigest(s)
	if err != nil {
		panic(err)
	}
	return v
}

// BytesToDigest creates an instance from a bytes slice
func BytesToDigest(b []byte) (Digest, error) {
	var v Digest
	if len(b) != DigestSize {
		return v, fmt.Errorf("invalid length, got %v expected %v", len(b), DigestSize)
	}
	copy(v[:], b)
	return v, nil
}

// MustBytesToDigest creates an instance from bytes slice or panics
func MustBytesToDigest(b []byte) Digest {
	v, err := BytesToDigest(b)
	if err != nil {
		panic(err)
	}
	return v
}
