package mint

import (
	"encoding/json"
	"fmt"
)

const (
	// PublicKeySize is public key length in bytes
	PublicKeySize = 32
	// PrivateKeySize is private key length in bytes
	PrivateKeySize = 64
	// DigestSize is digest length in bytes
	DigestSize = 32
	// SignatureSize is signature length in bytes
	SignatureSize = 64
)

// ---

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

// BytesToPublicKey creates an instance from a bytes slice
func BytesToPublicKey(b []byte) (PublicKey, error) {
	var v PublicKey
	if len(b) != PublicKeySize {
		return v, fmt.Errorf("invalid length, got %v expected %v", len(b), PublicKeySize)
	}
	copy(v[:], b)
	return v, nil
}

// ---

// PrivateKey bytes
type PrivateKey [PrivateKeySize]byte

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

// BytesToPrivateKey creates an instance from a bytes slice
func BytesToPrivateKey(b []byte) (PrivateKey, error) {
	var v PrivateKey
	if len(b) != PrivateKeySize {
		return v, fmt.Errorf("invalid length, got %v expected %v", len(b), PrivateKeySize)
	}
	copy(v[:], b)
	return v, nil
}

// ---

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

// BytesToDigest creates an instance from a bytes slice
func BytesToDigest(b []byte) (Digest, error) {
	var v Digest
	if len(b) != DigestSize {
		return v, fmt.Errorf("invalid length, got %v expected %v", len(b), DigestSize)
	}
	copy(v[:], b)
	return v, nil
}

// ---

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

// BytesToSignature creates an instance from a bytes slice
func BytesToSignature(b []byte) (Signature, error) {
	var v Signature
	if len(b) != SignatureSize {
		return v, fmt.Errorf("invalid length, got %v expected %v", len(b), SignatureSize)
	}
	copy(v[:], b)
	return v, nil
}

// ---

// MaskString6P4 masks a string exposing first 6 and 4 last symbols, like: YeAHCqTJk4aFnHXGV4zaaf3dTqJkdjQzg8TJENmP3zxDMpa97 => YeAHCq***pa97
func MaskString6P4(s string) string {
	charz := []rune(s)
	if len(charz) <= 10 {
		return s
	}
	return fmt.Sprintf("%s***%s", string(charz[0:6]), string(charz[len(charz)-4:]))
}
