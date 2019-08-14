package base58

import (
	"github.com/gopherjs/gopherjs/js"
	sumuslib "github.com/void616/gm-sumuslib"
)

// Pack packs bytes into Base58 (plus checksum) string
func Pack(data []byte) string {
	return sumuslib.Pack58(data)
}

// ---

// Unpack tries to unpack Base58 string into a byte array, returning `Base58UnpackResult`
func Unpack(data string) *js.Object {
	b, err := sumuslib.Unpack58(data)
	return js.MakeWrapper(
		&UnpackResult{
			mValid: err == nil,
			mData:  b,
		},
	)
}

// UnpackResult contains unpacked bytes
type UnpackResult struct {
	mValid bool
	mData  []byte
}

// Valid is false in case of an error
func (b *UnpackResult) Valid() bool {
	return b.mValid
}

// Data isn't empty in case of success
func (b *UnpackResult) Data() []byte {
	return b.mData
}
