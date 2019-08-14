package transaction

// Result contains a result of transaction signing
type Result struct {
	mData   string
	mName   string
	mDigest string
}

// Data contains hex string of the transaction's data
func (t *Result) Data() string {
	return t.mData
}

// Name contains transaction's full name
func (t *Result) Name() string {
	return t.mName
}

// Digest contains Base58 string of transaction's digest
func (t *Result) Digest() string {
	return t.mDigest
}
