package sumuslib

import (
	"fmt"
	"hash/crc32"

	"github.com/mr-tron/base58/base58"
)

// Unpack58 from string
func Unpack58(data string) ([]byte, error) {
	b, err := base58.Decode(data)
	if err == nil && len(b) > 4 {
		dat := b[:len(b)-4]
		crc := b[len(b)-4:]
		ok := crc32.ChecksumIEEE(dat) == (uint32(crc[0]) | uint32(crc[1])<<8 | uint32(crc[2])<<16 | uint32(crc[3])<<24)
		if ok {
			return dat, nil
		}
		return nil, fmt.Errorf("Invalid checksum")
	}
	return nil, fmt.Errorf("Invalid length")
}

// UnpackAddress58 from string
func UnpackAddress58(data string) (PublicKey, error) {
	var pub PublicKey
	b, err := base58.Decode(data)
	if err == nil && len(b) == 36 {
		dat := b[:len(b)-4]
		crc := b[len(b)-4:]
		ok := crc32.ChecksumIEEE(dat) == (uint32(crc[0]) | uint32(crc[1])<<8 | uint32(crc[2])<<16 | uint32(crc[3])<<24)
		if ok {
			copy(pub[:], dat)
			return pub, nil
		}
		return pub, fmt.Errorf("Invalid checksum")
	}
	return pub, fmt.Errorf("Invalid address")
}

// Pack58 packs bytes into base58 with crc
func Pack58(data []byte) string {
	if data == nil || len(data) == 0 {
		panic("Data is nil or empty")
	}

	buf := make([]byte, len(data)+4)
	copy(buf, data)

	crc := crc32.ChecksumIEEE(data)
	buf[len(data)] = byte((crc) & 0xFF)
	buf[len(data)+1] = byte((crc >> 8) & 0xFF)
	buf[len(data)+2] = byte((crc >> 16) & 0xFF)
	buf[len(data)+3] = byte((crc >> 24) & 0xFF)

	return base58.Encode(buf)
}
