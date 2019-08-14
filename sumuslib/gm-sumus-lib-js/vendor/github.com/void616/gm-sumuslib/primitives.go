package sumuslib

import (
	"encoding/json"
)

// PublicKey bytes
type PublicKey [32]byte

// String is a Stringer impl.
func (pk PublicKey) String() string {
	return Pack58(pk[:])
}

// MarshalJSON impl.
func (pk PublicKey) MarshalJSON() ([]byte, error) {
	return json.Marshal(pk.String())
}

// PrivateKey bytes
type PrivateKey [64]byte

// String is a Stringer impl.
func (pk PrivateKey) String() string {
	return Pack58(pk[:])
}

// MarshalJSON impl.
func (pk PrivateKey) MarshalJSON() ([]byte, error) {
	return json.Marshal(pk.String())
}

// Digest bytes
type Digest [32]byte

// String is a Stringer impl.
func (d Digest) String() string {
	return Pack58(d[:])
}

// MarshalJSON impl.
func (d Digest) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.String())
}

// Signature bytes
type Signature [64]byte

// String is a Stringer impl.
func (s Signature) String() string {
	return Pack58(s[:])
}

// MarshalJSON impl.
func (s Signature) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
