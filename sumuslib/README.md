New random keypair:
SumusLib.Signer.Generate()

Keypair from private key:
SumusLib.Signer.FromPK("base58-pk")

Sign transaction:
SumusLib.Transaction.TransferAsset("base58-pk", 616-uint64, "base58-addr", "GOLD-or-MNT", "0.010000000000000000")

Base58 utils:
SumusLib.Base58.Pack(...)
SumusLib.Base58.Unpack(...)
