package signer

import (
	sumuslib "github.com/void616/gm-sumuslib"
	sumsigner "github.com/void616/gm-sumuslib/signer"
)

// Sign signs a byte array passed as hex-string, returning signature as Base58 string
func Sign(data []byte, privateKey58 string) string {
	b, err := sumuslib.Unpack58(privateKey58)
	if err != nil {
		panic("Invalid private key")
	}
	sig, err := sumsigner.FromPK(b)
	if err != nil {
		panic("Failed to make signer")
	}

	if len(data) == 0 {
		panic("Invalid data")
	}

	sign := sig.Sign(data)
	return sumuslib.Pack58(sign[:])
}

// Verify verifies a signature of a byte array, returning boolean as the result
func Verify(data []byte, signature58, publicKey58 string) bool {
	if len(data) == 0 {
		panic("Invalid data")
	}

	pub, err := sumuslib.UnpackAddress58(publicKey58)
	if err != nil {
		panic("Invalid public key")
	}

	signBytes, err := sumuslib.Unpack58(signature58)
	if err != nil {
		panic("Invalid signature")
	}
	var sign sumuslib.Signature
	if len(signBytes) != len(sign[:]) {
		panic("Invalid signature")
	}
	copy(sign[:], signBytes)

	return sumsigner.Verify(pub, data, sign) == nil
}
