Mint (Sumus) blockchain lowlevel methods, transaction types, transactions signing, block data etc.

## Structure
| Folder | Contains |
| ------ | -------- |
| `.` | Primitives and basic functions like parsers, Base58 packer |
| `amount` | A structure that holds tokens amount |
| `block` | Block data and parser |
| `fee` | Fee calculator |
| `serializer` | Primary data serializer. For instance, block parser untilizes it |
| `signer` | ED25519 functions wrapped into a single structure |
| `transaction` | Transaction parser and constructor |
