package mint

import (
	"fmt"
)

// WalletTag in Sumus blockchain
type WalletTag uint8

const (
	// WalletTagNode is node wallet
	WalletTagNode WalletTag = iota + 1
	// WalletTagGenesisNode is node wallet from genesis block
	WalletTagGenesisNode
	// WalletTagSupervisor is controller wallet who can tag other wallets
	WalletTagSupervisor
	// WalletTagOwner is a fee accumulator
	WalletTagOwner
	// WalletTagEmission emits token without a fee
	WalletTagEmission
	// WalletTagNoFee can send transactions without a fee
	WalletTagNoFee
	// WalletTagApproved is approved user's wallet that is able to send or receive tokens
	WalletTagApproved
	// WalletTagAuthority is certification authority wallet that is able to approve users' wallets
	WalletTagAuthority
)

// WalletTagToString definition
var WalletTagToString = map[WalletTag]string{
	WalletTagNode:        "node",
	WalletTagGenesisNode: "gnode",
	WalletTagSupervisor:  "supervisor",
	WalletTagOwner:       "owner",
	WalletTagEmission:    "emission",
	WalletTagNoFee:       "nofee",
	WalletTagApproved:    "approved",
	WalletTagAuthority:   "authority",
}

// String representation
func (t WalletTag) String() string {
	ret, ok := WalletTagToString[t]
	if !ok {
		return ""
	}
	return ret
}

// ParseWalletTag from string
func ParseWalletTag(s string) (WalletTag, error) {
	for i, v := range WalletTagToString {
		if s == v {
			return i, nil
		}
	}
	return 0, fmt.Errorf("unknown wallet tag name `%v`", s)
}

// ValidWalletTag as uint8
func ValidWalletTag(u uint8) bool {
	_, ok := WalletTagToString[WalletTag(u)]
	return ok
}
