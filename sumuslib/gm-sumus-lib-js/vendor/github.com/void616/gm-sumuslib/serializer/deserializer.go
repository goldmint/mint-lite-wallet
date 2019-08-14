package serializer

import (
	"bytes"
	"encoding/hex"
	"fmt"
	"io"
	"math/big"

	sumuslib "github.com/void616/gm-sumuslib"
	"github.com/void616/gm-sumuslib/amount"
)

// NewDeserializer instance
func NewDeserializer(data []byte) *Deserializer {
	return &Deserializer{
		src: bytes.NewBuffer(data),
		err: nil,
	}
}

// NewStreamDeserializer instance
func NewStreamDeserializer(r io.Reader) *Deserializer {
	return &Deserializer{
		src: r,
		err: nil,
	}
}

// Deserializer data
type Deserializer struct {
	src io.Reader
	err error
}

// ---

// Error if any occured
func (s *Deserializer) Error() error {
	return s.err
}

// Source stream
func (s *Deserializer) Source() io.Reader {
	return s.src
}

// ---

// GetBytes ...
func (s *Deserializer) GetBytes(n uint32) []byte {
	if s.err == nil {
		v := make([]byte, n)
		cnt, err := s.src.Read(v)
		if err == nil {
			if uint32(cnt) == n {
				return v
			}
			s.err = fmt.Errorf("Didn't read specified amount of bytes. Got %v, expected %v", cnt, n)
		} else {
			s.err = err
		}
	}
	return nil
}

// GetByte ...
func (s *Deserializer) GetByte() byte {
	if s.err == nil {
		b := s.GetBytes(1)
		if b != nil {
			return b[0]
		}
	}
	return byte(0)
}

// GetUint16 ...
func (s *Deserializer) GetUint16() uint16 {
	if s.err == nil {
		b := s.GetBytes(2)
		if b != nil {
			return uint16(s.shiftInt(b).Uint64() & 0xFFFF)
		}
	}
	return uint16(0)
}

// GetUint32 ...
func (s *Deserializer) GetUint32() uint32 {
	if s.err == nil {
		b := s.GetBytes(4)
		if b != nil {
			return uint32(s.shiftInt(b).Uint64() & 0xFFFFFFFF)
		}
	}
	return uint32(0)
}

// GetUint64 ...
func (s *Deserializer) GetUint64() uint64 {
	if s.err == nil {
		b := s.GetBytes(8)
		if b != nil {
			return s.shiftInt(b).Uint64()
		}
	}
	return uint64(0)
}

// GetUint256 ...
func (s *Deserializer) GetUint256() *big.Int {
	if s.err == nil {
		b := s.GetBytes(32)
		if b != nil {
			return s.shiftInt(b)
		}
	}
	return big.NewInt(0)
}

// GetString64 ...
func (s *Deserializer) GetString64() string {
	const max = 64

	if s.err == nil {
		b := s.GetBytes(max)
		if b != nil {
			to := max
			for i, v := range b {
				if v == 0 {
					to = i
					break
				}
			}
			return string(b[:to])
		}
	}
	return ""
}

// GetPublicKey ...
func (s *Deserializer) GetPublicKey() sumuslib.PublicKey {
	var pub sumuslib.PublicKey

	if s.err == nil {
		b := s.GetBytes(uint32(cap(pub)))
		if b != nil {
			copy(pub[:], b)
		}
	}
	return pub
}

// GetDigest ...
func (s *Deserializer) GetDigest() sumuslib.Digest {
	var d sumuslib.Digest

	if s.err == nil {
		b := s.GetBytes(uint32(cap(d)))
		if b != nil {
			copy(d[:], b)
		}
	}
	return d
}

// GetSignature ...
func (s *Deserializer) GetSignature() sumuslib.Signature {
	var sig sumuslib.Signature

	if s.err == nil {
		b := s.GetBytes(uint32(cap(sig)))
		if b != nil {
			copy(sig[:], b)
		}
	}
	return sig
}

// GetAmount ...
func (s *Deserializer) GetAmount() *amount.Amount {

	// must be even
	const imax = 12
	const fmax = 18

	if s.err == nil {

		var err error

		var sign = s.GetByte()
		var fragPart = s.GetBytes(fmax / 2)
		var intPart = s.GetBytes(imax / 2)

		// check sign
		strSign := ""
		if sign > 0 {
			if sign > 1 {
				s.err = fmt.Errorf("Amount sign byte has invalid value: %v", sign)
			}
			strSign = "-"
		}

		// unflip frag part
		strFrag := ""
		if s.err == nil {
			strFrag, err = unflipAmountString(fragPart)
			if err != nil {
				s.err = err
			}
		}

		// unflip int part
		strInt := ""
		if s.err == nil {
			strInt, err = unflipAmountString(intPart)
			if err != nil {
				s.err = err
			}
		}

		// try parse amount
		if s.err == nil {
			together := fmt.Sprintf("%v%v.%v", strSign, strInt, strFrag)
			ret := amount.NewFloatString(together)
			if ret != nil {
				return ret
			}
			s.err = fmt.Errorf("Failed to parse amount from: %v", together)
		}
	}

	return nil
}

func (s *Deserializer) shiftInt(b []byte) *big.Int {
	x := big.NewInt(0)
	ret := big.NewInt(0)
	for i, v := range b {
		x = x.SetUint64(uint64(v) & 0xFF)
		x = x.Lsh(x, uint(i)*8)
		ret = ret.Or(ret, x)
	}
	return ret
}

// Convert some kind of a shit into string: [0x78 0x56 .. 0x34 0x12] => "1234...5678"
func unflipAmountString(b []byte) (string, error) {
	if b == nil || len(b) == 0 {
		return "", fmt.Errorf("Buffer is null or empty")
	}

	// reverse array
	tmp := make([]byte, len(b))
	for i := 0; i < len(b); i++ {
		tmp[i] = b[len(b)-i-1]
	}

	// to the hex
	return hex.EncodeToString(tmp), nil
}
