package transaction

import (
	"fmt"
)

// Code is a transaction name/code
type Code uint16

const (
	// RegisterNodeTx ...
	RegisterNodeTx Code = 1
	// UnregisterNodeTx ...
	UnregisterNodeTx Code = 2
	// SetWalletTagTx ...
	SetWalletTagTx Code = 3
	// UnsetWalletTagTx ...
	UnsetWalletTagTx Code = 4
	// UserDataTx ...
	UserDataTx Code = 7
	// TransferAssetTx ...
	TransferAssetTx Code = 10
	// DistributionFeeTx ...
	DistributionFeeTx Code = 11
)

var codeToString = map[Code]string{
	RegisterNodeTx:    "register_node",
	UnregisterNodeTx:  "unregister_node",
	SetWalletTagTx:    "set_wallet_tag",
	UnsetWalletTagTx:  "unset_wallet_tag",
	UserDataTx:        "user_data",
	TransferAssetTx:   "transfer_asset",
	DistributionFeeTx: "distribution_fee",
}

// String representation
func (t Code) String() string {
	ret, ok := codeToString[t]
	if !ok {
		return ""
	}
	return ret
}

// ParseCode from string
func ParseCode(s string) (Code, error) {
	for i, v := range codeToString {
		if s == v {
			return i, nil
		}
	}
	return 0, fmt.Errorf("unknown transaction code '%v'", s)
}

// ValidCode validates as uint16
func ValidCode(u uint16) bool {
	_, ok := codeToString[Code(u)]
	return ok
}
