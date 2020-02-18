package mint

import (
	"fmt"
	"strings"
)

// Token (asset) in Sumus blockchain
type Token uint16

const (
	// TokenMNT is MNT
	TokenMNT Token = iota
	// TokenGOLD is GOLD
	TokenGOLD
)

// TokenToString definition
var TokenToString = map[Token]string{
	TokenMNT:  "MNT",
	TokenGOLD: "GOLD",
}

// String representation
func (t Token) String() string {
	ret, ok := TokenToString[t]
	if !ok {
		return ""
	}
	return ret
}

// ParseToken from string
func ParseToken(s string) (Token, error) {
	ls := strings.ToLower(s)
	switch ls {
	case "0", "utility", "mnt", "mint":
		return TokenMNT, nil
	case "1", "commodity", "gold":
		return TokenGOLD, nil
	}
	return 0, fmt.Errorf("unknown token name `%v`", s)
}

// ValidToken as uint16
func ValidToken(u uint16) bool {
	_, ok := TokenToString[Token(u)]
	return ok
}
