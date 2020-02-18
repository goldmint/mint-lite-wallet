package serializer

import (
	"bytes"
	"encoding/hex"
	"fmt"

	mint "github.com/void616/gm.mint"
	"github.com/void616/gm.mint/amount"
)

// NewSerializer instance
func NewSerializer() *Serializer {
	return &Serializer{
		buf: &bytes.Buffer{},
		err: nil,
	}
}

// Serializer data
type Serializer struct {
	buf *bytes.Buffer
	err error
}

// ---

// Data is the current buffer bytes
func (s *Serializer) Data() ([]byte, error) {
	if s.err != nil {
		return nil, s.err
	}
	ret := make([]byte, s.buf.Len())
	copy(ret, s.buf.Bytes())
	return ret, nil
}

// Hex representation
func (s *Serializer) Hex() (string, error) {
	dat, err := s.Data()
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(dat), nil
}

// ---

// PutByte ...
func (s *Serializer) PutByte(v byte) *Serializer {
	if s.err == nil {
		s.err = s.buf.WriteByte(v)
	}
	return s
}

// PutBytes ...
func (s *Serializer) PutBytes(v []byte) *Serializer {
	if s.err == nil {
		n, err := s.buf.Write(v)
		if err != nil {
			s.err = err
		} else if n != len(v) {
			s.err = fmt.Errorf("failed to write bytes, written %v, expected %v", n, len(v))
		}
	}
	return s
}

// PutUint16 ...
func (s *Serializer) PutUint16(v uint16) *Serializer {
	if s.err == nil {
		s.err = s.buf.WriteByte(byte(v & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 8) & 0xFF))
	}
	return s
}

// PutUint32 ...
func (s *Serializer) PutUint32(v uint32) *Serializer {
	if s.err == nil {
		s.err = s.buf.WriteByte(byte(v & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 8) & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 16) & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 24) & 0xFF))
	}
	return s
}

// PutUint64 ...
func (s *Serializer) PutUint64(v uint64) *Serializer {
	if s.err == nil {
		s.err = s.buf.WriteByte(byte(v & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 8) & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 16) & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 24) & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 32) & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 40) & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 48) & 0xFF))
	}
	if s.err == nil {
		s.err = s.buf.WriteByte(byte((v >> 56) & 0xFF))
	}
	return s
}

// PutString64 ...
func (s *Serializer) PutString64(v string) *Serializer {
	const max = 64
	if len(v) > max {
		s.err = fmt.Errorf("string is too long, got %v, expected %v", len(v), max)
	}
	if s.err == nil {
		b := make([]byte, max)
		copy(b, []byte(v))
		return s.PutBytes(b)
	}
	return s
}

// PutPublicKey ...
func (s *Serializer) PutPublicKey(v mint.PublicKey) *Serializer {
	if s.err == nil {
		n, err := s.buf.Write(v[:])
		if err != nil {
			s.err = err
		} else if n != len(v) {
			s.err = fmt.Errorf("failed to write bytes, written %v, expected %v", n, len(v))
		}
	}
	return s
}

// PutAmount ...
func (s *Serializer) PutAmount(v *amount.Amount) *Serializer {

	// must be even
	const imax = 12
	const fmax = 18

	// limit for integer part
	if len(v.Integer(imax)) > imax {
		s.err = fmt.Errorf("amount has too big integer part, got %v, max %v", len(v.Integer(imax)), imax)
	}

	// sign
	if s.err == nil {
		if v.IsNeg() {
			s.err = s.buf.WriteByte(1)
		} else {
			s.err = s.buf.WriteByte(0)
		}
	}

	// fract: get it with padding zeros
	if s.err == nil {
		b, err := flipAmountString(v.Fraction(fmax))
		if err != nil {
			s.err = err
		} else {
			s.PutBytes(b)
		}
	}

	// integer: get it with padding zeros
	if s.err == nil {
		b, err := flipAmountString(v.Integer(imax))
		if err != nil {
			s.err = err
		} else {
			s.PutBytes(b)
		}
	}

	return s
}

// Convert string into some kind of shit: "1234...5678" => [0x78 0x56 .. 0x34 0x12]
func flipAmountString(s string) ([]byte, error) {
	if (len(s) % 2) != 0 {
		return nil, fmt.Errorf("passed string length must be even, got %v", len(s))
	}
	// to the bytes
	b, err := hex.DecodeString(s)
	if err != nil {
		return nil, err
	}
	// reverse array
	ret := make([]byte, len(b))
	for i := 0; i < len(b); i++ {
		ret[i] = b[len(b)-i-1]
	}
	return ret, nil
}
