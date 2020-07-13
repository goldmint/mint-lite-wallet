package mint

import (
	"fmt"
)

// WalletTag in Sumus blockchain
type WalletTag uint8

const (
	// WalletTagNode is a registered node (by "supervisor")
	WalletTagNode WalletTag = 1
	// WalletTagGenesisNode is registered node (in genesis block)
	WalletTagGenesisNode WalletTag = 2
	// WalletTagSupervisor can set/unset tags, fee-free (system, singleton)
	WalletTagSupervisor WalletTag = 3
	// WalletTagOwner is a fee collector, fee-free (system, singleton)
	WalletTagOwner WalletTag = 4
	// WalletTagEmission can emit/burn tokens, fee-free (system)
	WalletTagEmission WalletTag = 5
	// WalletTagNoFee sends transactions without a fee (system)
	WalletTagNoFee WalletTag = 6
	// WalletTagApproved grants ability to a KYC-proved user to send/receive GOLD
	WalletTagApproved WalletTag = 7
	// WalletTagAuthority can set/unset "approved" tag
	WalletTagAuthority WalletTag = 8
	// WalletTagDeposital grants ability to an exchange to send/received GOLD
	WalletTagDeposital WalletTag = 9
	// WalletTagExchange can set/unset "deposital" tag
	WalletTagExchange WalletTag = 10
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
	WalletTagDeposital:   "deposital",
	WalletTagExchange:    "exchange",
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
