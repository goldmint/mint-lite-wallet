package signer

import (
	"github.com/gopherjs/gopherjs/js"
	sumuslib "github.com/void616/gm-sumuslib"
	sumsigner "github.com/void616/gm-sumuslib/signer"
)

// Generate creates a random private key, returning `Signer`
func Generate() *js.Object {
	sig, err := sumsigner.New()
	if err != nil {
		panic(err)
	}
	pvtKey := sig.PrivateKey()
	pubKey := sig.PublicKey()
	return js.MakeWrapper(
		&Signer{
			mPrivateKey: sumuslib.Pack58(pvtKey[:]),
			mPublicKey:  sumuslib.Pack58(pubKey[:]),
		},
	)
}

// FromPK extracts a private key from Base58 string, returning `Signer`
func FromPK(privateKey58 string) *js.Object {
	b, err := sumuslib.Unpack58(privateKey58)
	if err != nil {
		panic(err)
	}
	sig, err := sumsigner.FromPK(b)
	if err != nil {
		panic(err)
	}
	pvtKey := sig.PrivateKey()
	pubKey := sig.PublicKey()
	return js.MakeWrapper(
		&Signer{
			mPrivateKey: sumuslib.Pack58(pvtKey[:]),
			mPublicKey:  sumuslib.Pack58(pubKey[:]),
		},
	)
}
