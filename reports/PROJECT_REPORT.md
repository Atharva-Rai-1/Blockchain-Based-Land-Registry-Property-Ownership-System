# Project Report
# Blockchain-Based Land Registry & Property Ownership System

## Abstract

This project presents an educational prototype of a blockchain-based land/property registry. The system uses a Solidity smart contract to simulate property registration, authority verification, wallet-linked ownership, ownership transfer, property status management, document-hash verification, and ownership history.

The project uses only synthetic property data and test wallets. Its purpose is to demonstrate blockchain engineering concepts rather than to create legally valid property ownership.

## 1. Introduction

Property records are important because ownership, location, area, title documents, transfers, and disputes must be tracked consistently. Traditional workflows can involve multiple databases, paper records, manual verification, and institutional processes.

A blockchain-based registry can provide a shared, tamper-evident transaction history and programmable rules for selected registry operations.

## 2. Problem Statement

A property ecosystem can suffer from duplicate records, inconsistent updates, document manipulation, fragmented databases, and slow verification. These problems can increase the difficulty of proving what record was created or changed and when.

The proposed prototype demonstrates how a smart contract can enforce a consistent digital workflow.

## 3. Traditional Land Registry

Traditional land registration generally depends on government registrars, cadastral/survey information, identity systems, legal documents, courts, and administrative procedures.

Digitization can improve access and searchability, but the system still needs trusted authorities and legal processes.

## 4. Challenges

- duplicate records
- inconsistent data
- document forgery
- manual verification
- fragmented databases
- difficult audit trails
- identity verification
- disputes and court orders
- inheritance
- mortgages and liens
- privacy requirements

## 5. Proposed Blockchain System

The prototype contains:

- an authority-controlled registration process
- property records
- explicit verification
- wallet-linked ownership
- secure ownership transfer
- property status controls
- document hashes
- events
- ownership history

## 6. Objectives

- demonstrate Solidity development
- demonstrate smart-contract access control
- demonstrate property data modeling
- demonstrate ownership transfer
- demonstrate event-based auditability
- demonstrate document integrity checks
- demonstrate automated testing
- produce a GitHub-ready proof of work

## 7. Architecture

```text
Authority / Owner / Buyer
          |
      MetaMask
          |
       ethers.js
          |
   React optional UI
          |
  LandRegistry.sol
          |
 Local Ethereum-compatible network
          |
 Blockchain state + events

Documents remain off-chain.
Their cryptographic hashes are stored on-chain.
```

## 8. Actors

### Admin

The deployer controls authority management.

### Authority

Authorities can register and verify property records and manage status.

### Property Owner

The current owner can initiate a transfer.

### Buyer/New Owner

The new owner receives the wallet-linked property record.

### Optional Verifier

A future version could separate verification into an independent role.

## 9. Property Data Model

The `Property` struct stores:

- property ID
- property number
- location
- area
- property type
- current owner
- previous owner
- document hash
- verification flag
- status
- registration timestamp
- last transfer timestamp

## 10. Smart Contract Design

The contract uses mappings for fast lookup, arrays for owner lists and history, structs for property records, enums for lifecycle status, modifiers for access control, and events for auditability.

## 11. Registration Workflow

1. Authority calls `registerProperty`.
2. Contract checks authorization.
3. Contract checks property ID uniqueness.
4. Contract validates owner and data.
5. Property record is created.
6. Initial owner is recorded.
7. `PropertyRegistered` is emitted.

## 12. Verification Workflow

1. Authority selects a registered property.
2. Contract confirms it exists.
3. Contract confirms it is not already verified.
4. Contract sets `verified = true`.
5. Status changes to `VERIFIED`.
6. `PropertyVerified` is emitted.

## 13. Ownership Transfer

1. Current owner calls `transferOwnership`.
2. Contract verifies the property exists.
3. Contract checks `msg.sender == currentOwner`.
4. Contract requires a non-zero new owner.
5. Contract requires verification.
6. Contract rejects disputed/blocked properties.
7. Current owner is moved out of the active owner list.
8. New owner is added.
9. History is appended.
10. `OwnershipTransferred` is emitted.

## 14. Document Hashing

The sample JSON file is hashed using SHA-256. The hash is stored as a `bytes32` value in the contract.

If the file is modified, its hash changes.

This demonstrates integrity checking but not legal authenticity.

## 15. Security

Security controls include:

- authority-only registration
- authority-only verification
- admin authority management
- duplicate prevention
- zero-address checks
- owner-only transfer
- verified-only transfer
- blocked/disputed transfer prevention
- property existence validation
- event logging
- ownership history

## 16. Implementation

Primary implementation files:

```text
contracts/LandRegistry.sol
scripts/deploy.js
scripts/hash.js
test/LandRegistry.test.js
frontend/src/App.jsx
```

## 17. Testing

The automated test suite covers:

- deployment
- admin/authority initialization
- authority registration
- duplicate property rejection
- zero owner rejection
- unauthorized registration
- verification
- unauthorized verification
- unverified transfer rejection
- valid transfer
- non-owner rejection
- zero new owner rejection
- old-owner rejection after transfer
- repeated transfer by new owner
- invalid property
- owner property lists
- document hash
- complete history
- disputed status
- status restoration
- emitted events

## 18. Simulation

The project can be demonstrated using Remix VM with four test accounts:

- Account 1: Admin/Authority
- Account 2: Owner A
- Account 3: Buyer B
- Account 4: Unauthorized user

The expected sequence is registration, failed unauthorized verification, successful verification, ownership transfer, failed old-owner transfer, and event/history inspection.

## 19. Results

The prototype successfully demonstrates a programmable registry workflow where permissions and state transitions are enforced by smart-contract code.

It also demonstrates how cryptographic hashes can detect document modification.

## 20. Applications

The architecture is conceptually useful for:

- government registry modernization
- property management
- title verification
- real-estate platforms
- mortgage verification
- housing societies
- document authentication
- audit systems

## 21. Advantages

- tamper-evident history
- programmable rules
- transparent state transitions
- wallet-based technical identity
- event-based audit trail
- fast machine-readable lookup
- reduced dependence on a single editable database for the transaction history

## 22. Limitations

Blockchain cannot automatically determine whether the source property data is true.

A compromised authority, incorrect source data, stolen private key, legal dispute, or incorrect identity mapping can still create serious problems.

## 23. Legal Considerations

This prototype does not create legally valid ownership.

A real system would need government authority, legal identity, cadastral records, registrars, courts, inheritance processes, mortgage/lien records, dispute resolution, privacy controls, and applicable law.

The key principle is:

> Blockchain can preserve a record very strongly, but it cannot guarantee that the input record was truthful or legally valid.

## 24. Future Scope

- role-based access control
- multisig administration
- buyer acceptance
- multi-party approval
- IPFS or document management
- decentralized identity
- cadastral/GIS integration
- mortgage/lien workflows
- court-order workflows
- privacy-preserving architecture
- formal verification
- professional audit

## 25. Conclusion

The Blockchain-Based Land Registry & Property Ownership System demonstrates how Solidity smart contracts can model a property registry with controlled registration, verification, transfer, status management, document integrity checks, and ownership history.

The project is intentionally limited to synthetic data and local/test environments. It should be evaluated as a blockchain engineering proof of work, not as a replacement for a government land registry or legal title process.
