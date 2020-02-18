package ed25519

import (
	"crypto/sha512"

	"github.com/void616/gm.mint/signer/ed25519/internal/edwards25519"
)

// Prehash returns pre-hashed version of the private key.
func (priv PrivateKey) Prehash() []byte {
	var ret [64]byte
	copy(ret[:], priv)

	digest := sha512.Sum512(priv)
	digest[0] &= 248
	digest[31] &= 127
	digest[31] |= 64

	copy(ret[:], digest[:32])

	return ret[:]
}

// PublicKeyFromPrehashedPK gets the public key corresponding to the already pre-hashed private key.
func PublicKeyFromPrehashedPK(hashedPrivateKey []byte) []byte {
	var A edwards25519.ExtendedGroupElement
	var hBytes [32]byte
	copy(hBytes[:], hashedPrivateKey)
	edwards25519.GeScalarMultBase(&A, &hBytes)
	var publicKeyBytes [32]byte
	A.ToBytes(&publicKeyBytes)

	return publicKeyBytes[:]
}

// SignWithPrehashed calculates the signature from the (pre-hashed) private key, public key and message.
func SignWithPrehashed(privateKey, publicKey, message []byte) []byte {

	var privateKeyA [32]byte
	copy(privateKeyA[:], privateKey) // we need this in an array later
	var messageDigest, hramDigest [64]byte

	h := sha512.New()
	h.Write(privateKey[32:])
	h.Write(message)
	h.Sum(messageDigest[:0])

	var messageDigestReduced [32]byte
	edwards25519.ScReduce(&messageDigestReduced, &messageDigest)
	var R edwards25519.ExtendedGroupElement
	edwards25519.GeScalarMultBase(&R, &messageDigestReduced)

	var encodedR [32]byte
	R.ToBytes(&encodedR)

	h.Reset()
	h.Write(encodedR[:])
	h.Write(publicKey)
	h.Write(message)
	h.Sum(hramDigest[:0])
	var hramDigestReduced [32]byte
	edwards25519.ScReduce(&hramDigestReduced, &hramDigest)

	var s [32]byte
	edwards25519.ScMulAdd(&s, &hramDigestReduced, &privateKeyA, &messageDigestReduced)

	signature := make([]byte, 64)
	copy(signature[:], encodedR[:])
	copy(signature[32:], s[:])

	return signature
}
