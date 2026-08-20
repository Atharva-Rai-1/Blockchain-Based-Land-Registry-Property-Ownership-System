# Interview Preparation — 10 Questions and Strong Answers

## 1. Explain your project.

I built an educational blockchain-based land registry prototype using Solidity and Hardhat. The system simulates property registration, authority verification, wallet-linked ownership, ownership transfer, document-hash verification, property status management, and ownership history. I used only dummy property data and test wallets. The main smart contract enforces who can register and verify records and ensures that only the current owner can transfer a verified property.

## 2. Why did you use blockchain for this project?

The main reason is auditability. A blockchain can provide a tamper-evident history of state-changing transactions. Instead of only relying on an editable database record, the application can use blockchain transactions and events to reconstruct what happened and when. It does not solve the legal validity of the original data, so I treat this as a technical registry prototype.

## 3. How does your smart contract prevent unauthorized registration?

I maintain an authority mapping and use an `onlyAuthority` modifier. `registerProperty()` can execute only when `authorities[msg.sender]` is true. The admin can add or remove authority accounts. I also tested that an unauthorized account receives a revert.

## 4. Why did you use a struct and mappings?

The `Property` struct groups related fields such as ID, location, area, owner, document hash, status, and timestamps. A mapping from property ID to `Property` provides efficient direct lookup. I also use mappings for owner-to-property lists and ownership indexes.

## 5. What is `msg.sender` and why is it important here?

`msg.sender` is the address that called the current contract function. I use it for access control and ownership checks. For example, an ownership transfer succeeds only when `msg.sender` equals the property's `currentOwner`.

## 6. How does document hashing work?

The actual dummy document stays off-chain. I calculate a SHA-256 hash and store the resulting 32-byte value in the contract. If the document changes, the hash changes, so I can detect that the file no longer matches the registered fingerprint. A matching hash does not prove that the original document was legally authentic.

## 7. How is ownership history preserved?

I use the `OwnershipTransferred` event and an on-chain `ownershipHistory` array. For example, if Owner A transfers to Buyer B and Buyer B transfers to Buyer C, the history becomes A, B, C. Events are especially useful because a frontend can index them to build a transaction timeline.

## 8. What security checks did you implement?

I implemented authority-only registration and verification, unique property IDs, zero-address validation, property existence checks, verified-only transfers, current-owner authorization, and transfer blocking for disputed or blocked records. I also tested unauthorized calls and invalid inputs.

## 9. Does the blockchain make the buyer the legal owner?

No. This is one of the most important limitations. The smart contract only records a blockchain state associated with a wallet address. Legal ownership depends on government registries, identity, contracts, courts, registrars, and applicable property law. The project demonstrates technical ownership state, not legal title.

## 10. What would you change for production?

I would use stronger role-based access control, multisig administration, identity verification, buyer acceptance, multi-party approval, document-management integration, cadastral/GIS integration, privacy controls, dispute and court-order workflows, key recovery, event indexing, and a professional smart-contract/security audit.
