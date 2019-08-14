package transaction

import (
	"bytes"
	"errors"
	"fmt"
	"io"

	sumuslib "github.com/void616/gm-sumuslib"
	"github.com/void616/gm-sumuslib/amount"
	"github.com/void616/gm-sumuslib/serializer"
	"github.com/void616/gm-sumuslib/signer"
	"golang.org/x/crypto/sha3"
)

// SignedTransaction data
type SignedTransaction struct {
	// Digest, 32b
	Digest sumuslib.Digest
	// Data of the transaction
	Data []byte
	// Signature, 64b
	Signature sumuslib.Signature
}

// ParsedTransaction data
type ParsedTransaction struct {
	// From address, 32b
	From sumuslib.PublicKey
	// Nonce
	Nonce uint64
	// Digest, 32b
	Digest sumuslib.Digest
	// Signature, 64b
	Signature sumuslib.Signature
}

// ---

// Callback to get transaction payload
type payloadWriter func(s *serializer.Serializer)

// Write nonce and payload, calc a digest and sign it
func construct(signer *signer.Signer, nonce uint64, write payloadWriter) (*SignedTransaction, error) {

	ser := serializer.NewSerializer()

	// write nonce
	ser.PutUint64(nonce)

	// write payload
	write(ser)

	// get payload
	payload, err := ser.Data()
	if err != nil {
		return nil, err
	}

	// make payload digest
	var txdigest sumuslib.Digest
	{
		hasher := sha3.New256()
		_, err = hasher.Write(payload)
		if err != nil {
			return nil, err
		}
		digest := hasher.Sum(nil)
		copy(txdigest[:], digest)
	}

	// sign digest
	txsignature := signer.Sign(txdigest[:])

	// signature
	ser.PutByte(1)               // append a byte - "signed bit"
	ser.PutBytes(txsignature[:]) // signature

	// data
	txdata, err := ser.Data()
	if err != nil {
		return nil, err
	}

	return &SignedTransaction{
		Data:      txdata,
		Digest:    txdigest,
		Signature: txsignature,
	}, nil
}

// Callback to parse transaction payload. Wants a signer public key or an error
type payloadReader func(d *serializer.Deserializer) (sumuslib.PublicKey, error)

// Parse transaction data from bytes
func parse(r io.Reader, read payloadReader) (*ParsedTransaction, error) {

	digestWriter := bytes.NewBuffer(make([]byte, 256))
	digestWriter.Reset()
	des := serializer.NewStreamDeserializer(io.TeeReader(r, digestWriter))

	// read nonce
	txnonce := des.GetUint64()
	if err := des.Error(); err != nil {
		return nil, err
	}

	// read payload, get signer pub key
	var txsigner sumuslib.PublicKey
	{
		pub, rerr := read(des)
		if err := des.Error(); err != nil {
			return nil, err
		}
		if rerr != nil {
			return nil, rerr
		}
		txsigner = pub
	}

	// calc the digest
	var txdigest sumuslib.Digest
	{
		hasher := sha3.New256()
		_, err := hasher.Write(digestWriter.Bytes())
		if err != nil {
			return nil, err
		}
		b := hasher.Sum(nil)
		copy(txdigest[:], b)
	}

	// "signed" byte
	txsigned := des.GetByte()
	if err := des.Error(); err != nil {
		return nil, err
	}

	var txsignature sumuslib.Signature
	{
		if txsigned != 0 {
			// signature
			b := des.GetBytes(64)
			if err := des.Error(); err != nil {
				return nil, err
			}
			copy(txsignature[:], b)
		} else {
			// digest
			_ = des.GetBytes(32)
			if err := des.Error(); err != nil {
				return nil, err
			}
		}
	}

	// TODO: verify optionally

	return &ParsedTransaction{
		From:      txsigner,
		Nonce:     txnonce,
		Digest:    txdigest,
		Signature: txsignature,
	}, nil
}

// ITransaction is generic interface
type ITransaction interface {
	Construct(signer *signer.Signer, nonce uint64) (*SignedTransaction, error)
	Parse(r io.Reader) (*ParsedTransaction, error)
}

// ---

// RegisterNode transaction
type RegisterNode struct {
	NodeAddress string
}

// Construct ...
func (t *RegisterNode) Construct(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {

	return construct(signer, nonce, func(ser *serializer.Serializer) {
		ser.PutPublicKey(signer.PublicKey()) // signer public key
		ser.PutString64(t.NodeAddress)       // node address
	})
}

// Parse ...
func (t *RegisterNode) Parse(r io.Reader) (*ParsedTransaction, error) {

	return parse(r, func(des *serializer.Deserializer) (sumuslib.PublicKey, error) {
		ret := des.GetPublicKey()         // signer public key
		t.NodeAddress = des.GetString64() // node address
		return ret, nil
	})
}

// ---

// UnregisterNode transaction
type UnregisterNode struct {
}

// Construct ...
func (t *UnregisterNode) Construct(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {

	return construct(signer, nonce, func(ser *serializer.Serializer) {
		ser.PutPublicKey(signer.PublicKey()) // signer public key
	})
}

// Parse ...
func (t *UnregisterNode) Parse(r io.Reader) (*ParsedTransaction, error) {

	return parse(r, func(des *serializer.Deserializer) (sumuslib.PublicKey, error) {
		ret := des.GetPublicKey() // signer public key
		return ret, nil
	})
}

// ---

// TransferAsset transaction
type TransferAsset struct {
	Address sumuslib.PublicKey
	Token   sumuslib.Token
	Amount  *amount.Amount
}

// Construct ...
func (t *TransferAsset) Construct(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	return construct(signer, nonce, func(ser *serializer.Serializer) {
		ser.PutUint16(uint16(t.Token))       // token
		ser.PutPublicKey(signer.PublicKey()) // signer public key
		ser.PutPublicKey(t.Address)          // address / public key
		ser.PutAmount(t.Amount)              // amount
	})
}

// Parse ...
func (t *TransferAsset) Parse(r io.Reader) (*ParsedTransaction, error) {

	return parse(r, func(des *serializer.Deserializer) (sumuslib.PublicKey, error) {
		tokenCode := des.GetUint16()   // token
		ret := des.GetPublicKey()      // signer public key
		t.Address = des.GetPublicKey() // address / public key
		t.Amount = des.GetAmount()     // amount

		// ensure token is valid
		if !sumuslib.ValidToken(tokenCode) {
			return ret, fmt.Errorf("Unknown token with code `%v`", tokenCode)
		}
		t.Token = sumuslib.Token(tokenCode)

		return ret, nil
	})
}

// ---

// UserData transaction
type UserData struct {
	Data []byte
}

// Construct ...
func (t *UserData) Construct(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {

	if t.Data == nil {
		return nil, errors.New("Data is empty")
	}

	return construct(signer, nonce, func(ser *serializer.Serializer) {
		ser.PutPublicKey(signer.PublicKey()) // signer public key
		ser.PutUint32(uint32(len(t.Data)))   // data size
		ser.PutBytes(t.Data)                 // data bytes
	})
}

// Parse ...
func (t *UserData) Parse(r io.Reader) (*ParsedTransaction, error) {

	return parse(r, func(des *serializer.Deserializer) (sumuslib.PublicKey, error) {
		ret := des.GetPublicKey()   // signer public key
		size := des.GetUint32()     // data size
		t.Data = des.GetBytes(size) // data bytes
		return ret, nil
	})
}

// ---

// RegisterSysWallet transaction
type RegisterSysWallet struct {
	Address sumuslib.PublicKey
	Tag     sumuslib.WalletTag
}

// Construct ...
func (t *RegisterSysWallet) Construct(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	return construct(signer, nonce, func(ser *serializer.Serializer) {
		ser.PutPublicKey(signer.PublicKey()) // signer public key
		ser.PutPublicKey(t.Address)          // address / public key
		ser.PutByte(uint8(t.Tag))            // tag
	})
}

// Parse ...
func (t *RegisterSysWallet) Parse(r io.Reader) (*ParsedTransaction, error) {

	return parse(r, func(des *serializer.Deserializer) (sumuslib.PublicKey, error) {
		ret := des.GetPublicKey()      // signer public key
		t.Address = des.GetPublicKey() // address / public key
		tagCode := des.GetByte()       // tag

		// ensure tag is valid
		if !sumuslib.ValidWalletTag(tagCode) {
			return ret, fmt.Errorf("Unknown wallet tag with code `%v`", tagCode)
		}
		t.Tag = sumuslib.WalletTag(tagCode)

		return ret, nil
	})
}

// ---

// UnregisterSysWallet transaction
type UnregisterSysWallet struct {
	Address sumuslib.PublicKey
	Tag     sumuslib.WalletTag
}

// Construct ...
func (t *UnregisterSysWallet) Construct(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	return construct(signer, nonce, func(ser *serializer.Serializer) {
		ser.PutPublicKey(signer.PublicKey()) // signer public key
		ser.PutPublicKey(t.Address)          // address / public key
		ser.PutByte(uint8(t.Tag))            // tag
	})
}

// Parse ...
func (t *UnregisterSysWallet) Parse(r io.Reader) (*ParsedTransaction, error) {

	return parse(r, func(des *serializer.Deserializer) (sumuslib.PublicKey, error) {
		ret := des.GetPublicKey()      // signer public key
		t.Address = des.GetPublicKey() // address / public key
		tagCode := des.GetByte()       // tag

		// ensure tag is valid
		if !sumuslib.ValidWalletTag(tagCode) {
			return ret, fmt.Errorf("Unknown wallet tag with code `%v`", tagCode)
		}
		t.Tag = sumuslib.WalletTag(tagCode)

		return ret, nil
	})
}

// ---

// DistributionFee transaction
type DistributionFee struct {
	OwnerAddress sumuslib.PublicKey
	AmountMNT    *amount.Amount
	AmountGOLD   *amount.Amount
}

// Construct ...
func (t *DistributionFee) Construct(signer *signer.Signer, nonce uint64) (*SignedTransaction, error) {
	return construct(signer, nonce, func(ser *serializer.Serializer) {
		ser.PutPublicKey(signer.PublicKey()) // signer public key
		ser.PutPublicKey(t.OwnerAddress)     // owner address / public key
		ser.PutAmount(t.AmountMNT)           // mnt amount
		ser.PutAmount(t.AmountGOLD)          // gold amount
	})
}

// Parse ...
func (t *DistributionFee) Parse(r io.Reader) (*ParsedTransaction, error) {

	return parse(r, func(des *serializer.Deserializer) (sumuslib.PublicKey, error) {
		ret := des.GetPublicKey()           // signer public key
		t.OwnerAddress = des.GetPublicKey() // owner address / public key
		t.AmountMNT = des.GetAmount()       // mnt amount
		t.AmountGOLD = des.GetAmount()      // gold amount
		return ret, nil
	})
}
