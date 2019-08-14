package signer

// Signer contains a key pair
type Signer struct {
	mPrivateKey string
	mPublicKey  string
}

// PrivateKey returns a private key
func (s *Signer) PrivateKey() string {
	return s.mPrivateKey
}

// PublicKey returns a public key
func (s *Signer) PublicKey() string {
	return s.mPublicKey
}
