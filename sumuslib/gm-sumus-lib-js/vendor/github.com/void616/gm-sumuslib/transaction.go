package sumuslib

import (
	"fmt"
)

// Transaction in Sumus blockchain
type Transaction uint16

const (
	// TransactionRegisterNode registers a new node
	TransactionRegisterNode Transaction = 1
	// TransactionUnregisterNode unregisters existing node
	TransactionUnregisterNode Transaction = 2
	// TransactionTransferAssets sends token between wallets
	TransactionTransferAssets Transaction = 10
	// TransactionRegisterSystemWallet registers system wallet
	TransactionRegisterSystemWallet Transaction = 3
	// TransactionUnregisterSystemWallet unregisters system wallet
	TransactionUnregisterSystemWallet Transaction = 4
	// TransactionUserData contains custom payload
	TransactionUserData Transaction = 7
	// TransactionDistributionFee sends block fee to owner
	TransactionDistributionFee Transaction = 11
)

// TransactionToString definition
var TransactionToString = map[Transaction]string{
	TransactionRegisterNode:           "RegisterNodeTransaction",
	TransactionUnregisterNode:         "UnregisterNodeTransaction",
	TransactionTransferAssets:         "TransferAssetsTransaction",
	TransactionRegisterSystemWallet:   "RegisterSystemWalletTransaction",
	TransactionUnregisterSystemWallet: "UnregisterSystemWalletTransaction",
	TransactionUserData:               "UserDataTransaction",
	TransactionDistributionFee:        "DistributionFeeTransaction",
}

// String representation
func (t Transaction) String() string {
	ret, ok := TransactionToString[t]
	if !ok {
		return ""
	}
	return ret
}

// ParseTransaction from string
func ParseTransaction(s string) (Transaction, error) {
	for i, v := range TransactionToString {
		if s == v {
			return i, nil
		}
	}
	return 0, fmt.Errorf("Unknown transaction name `%v`", s)
}

// ValidTransaction as uint16
func ValidTransaction(u uint16) bool {
	_, ok := TransactionToString[Transaction(u)]
	return ok
}
