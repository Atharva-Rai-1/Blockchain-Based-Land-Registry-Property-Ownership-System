# Blockchain-Based Land Registry & Property Ownership System

## Overview

This repository contains an educational blockchain prototype that simulates a land/property registry using Solidity, Ethereum-compatible smart contracts, Hardhat, ethers.js, and optional React/MetaMask integration.

The prototype demonstrates:

- property registration
- authority-based verification
- wallet-linked ownership
- ownership transfer
- ownership history
- property status management
- document hash verification
- event-based audit trails
- automated smart-contract testing

> **Educational Disclaimer:** All property records, documents, names, survey numbers, locations, and wallet addresses used in this project are synthetic/demo data. This system does **not** create, prove, transfer, or replace legally valid property ownership. It is an educational blockchain prototype and is not a government land registry or legal title system.

## Problem Statement

Traditional property records can involve fragmented databases, paper documents, manual verification, duplicate records, inconsistent updates, and difficult audit trails. These issues can contribute to disputes when multiple records appear to describe the same property.

Blockchain can provide a shared, append-only, tamper-evident transaction history. Smart contracts can enforce predefined registration, verification, and ownership-transfer rules.

However, blockchain cannot determine whether information entered into it is legally true.

This project therefore demonstrates the **technical registry workflow**, not a legally valid property title system.

## Objectives

1. Build a Solidity-based property registry.
2. Restrict registration and verification to authorized authority wallets.
3. Link property records to blockchain wallet addresses.
4. Require property verification before ownership transfer.
5. Allow only the current owner to transfer ownership.
6. Preserve ownership history through blockchain events and on-chain history.
7. Store document hashes instead of complete documents on-chain.
8. Implement property status management.
9. Test authorization and security rules automatically.
10. Demonstrate the complete workflow using dummy data and test wallets.
11. Provide GitHub-ready proof of implementation through source code, tests, screenshots, and documentation.

## Industry Relevance

The concepts demonstrated by this prototype are conceptually relevant to:

- government land registries
- property management platforms
- real-estate technology
- housing societies
- mortgage and loan verification
- title due diligence
- document authentication
- property transaction systems
- audit and compliance systems

### Potential Business Value

A blockchain-based registry architecture could provide:

- transparent ownership workflows
- tamper-evident transaction history
- faster property verification
- reduced duplicate registry entries
- easier ownership tracking
- improved auditability
- digital transfer workflows
- easier verification of document integrity

However, blockchain itself does **not** make a property transfer legally valid.

A real deployment would require integration with:

- government authorities
- legal identity systems
- cadastral/survey databases
- property registrars
- courts
- dispute-resolution procedures
- applicable property laws

## Blockchain Concepts Used

| Concept | Project Use |
|---|---|
| Blockchain | Shared append-only transaction history |
| Ethereum-compatible network | Execution environment for the smart contract |
| Smart Contract | Property registry rules and state management |
| Solidity | Smart contract programming language |
| Wallet Address | Technical owner/actor identifier |
| `msg.sender` | Identifies the account calling a function |
| `struct` | Models a property record |
| `mapping` | Provides efficient property and owner lookup |
| `array` | Stores property lists and ownership history |
| `enum` | Represents property lifecycle status |
| `modifier` | Performs access-control and validation checks |
| Events | Provide an application-readable audit trail |
| `require()` | Validates inputs and permissions |
| Access Control | Restricts authority-only operations |
| Document Hash | Detects changes to documents |
| Transaction Hash | Identifies blockchain transactions |
| Immutability | Makes historical blockchain records tamper-evident |
| Testnet/Local Chain | Safe environment for development and testing |
| dApp | Frontend application connected to the smart contract |
| Gas | Computational cost of blockchain operations |
| Off-chain Metadata | Keeps large or sensitive documents outside blockchain state |

## Actors

| Actor | Responsibilities / Permissions |
|---|---|
| **Admin** | Deploys the contract and manages authority accounts |
| **Authority** | Registers properties, verifies properties, and manages property status |
| **Property Owner** | Views owned property and transfers only their current property |
| **Buyer / New Owner** | Receives property ownership and can later transfer it |
| **Optional Verifier** | Future role for independent document/property verification |

> Wallet addresses in this prototype represent **technical blockchain accounts**, not legally verified identities.

## Technology Stack

- Solidity `0.8.20`
- Hardhat 2 compatible setup
- ethers.js 6
- MetaMask
- Remix IDE
- Remix VM
- Local Hardhat Network
- React + Vite (optional frontend)
- Node.js LTS

The project uses a Hardhat 2-compatible setup so the educational CommonJS JavaScript test files remain simple.

> **Note:** Do not mix Hardhat 3 configuration with this Hardhat 2 setup unless deliberately migrating the project.

# System Architecture

```text
                  +---------------------------+
                  |       React dApp           |
                  | Authority / Owner / Buyer |
                  +-------------+-------------+
                                |
                          ethers.js
                                |
                           MetaMask
                                |
                  +-------------v-------------+
                  |    LandRegistry.sol       |
                  |----------------------------|
                  | Property Registry          |
                  | Authority Access Control   |
                  | Verification Logic         |
                  | Transfer Logic             |
                  | Status Management          |
                  | Ownership History          |
                  | Event Log                  |
                  +-------------+-------------+
                                |
                     Ethereum-compatible
                     local/test network
                                |
              +-----------------+----------------+
              |                                  |
      Off-chain documents                 Blockchain state
      JSON/PDF/images                     IDs, owners,
                                          status, hashes,
                                          timestamps
```

# Property Data Model

```text
Property
├── propertyId
├── propertyNumber
├── location
├── area
├── propertyType
├── currentOwner
├── previousOwner
├── documentHash
├── verified
├── status
├── registeredAt
└── lastTransferredAt
```

## Field Meanings

### `propertyId`
Unique numeric identifier for the property.

Example:

```text
1
```

### `propertyNumber`
Human-readable registry reference.

Example:

```text
P001
```

### `location`
Synthetic location associated with the property.

Example:

```text
Demo Zone A, Synthetic District, India
```

### `area`
Numeric property area used by the prototype.

Example:

```text
1500
```

### `propertyType`
Type of property.

Example:

```text
Residential
```

### `currentOwner`
Blockchain wallet address of the current owner.

### `previousOwner`
Wallet address of the immediately previous owner.

### `documentHash`
Cryptographic fingerprint of the associated document. The prototype represents the hash as `bytes32`.

### `verified`
Boolean value indicating whether an authorized authority has verified the property record.

### `status`
Represents the current lifecycle state of the property.

Possible states include:

```text
REGISTERED
VERIFIED
TRANSFER_PENDING
TRANSFERRED
DISPUTED
BLOCKED
```

### `registeredAt`
Blockchain timestamp when the property was registered.

### `lastTransferredAt`
Blockchain timestamp of the most recent ownership transfer.

# System Workflow

```text
Authority
   |
   v
Register Property
   |
   v
Property Record Created
   |
   v
Authority Verification
   |
   v
Verified
   |
   v
Current Owner Requests Transfer
   |
   v
Smart Contract Checks:
- property exists
- caller is current owner
- property is verified
- new owner is not zero address
- property is not disputed/blocked
   |
   v
New Owner Assigned
   |
   v
OwnershipTransferred Event
   |
   v
Ownership History Preserved
```

# Property Registration

The authority uses:

```solidity
registerProperty()
```

to create a new property record.

## Registration Inputs

- property ID
- property number
- location
- area
- property type
- initial owner
- document hash

## Registration Rules

`registerProperty()` requires:

1. Caller must be an authorized authority.
2. Property ID must not already exist.
3. Property ID must be valid.
4. Property number must be provided.
5. Location must be provided.
6. Area must be greater than zero.
7. Property type must be provided.
8. Initial owner cannot be the zero address.
9. Document hash must be present.

A successful registration emits:

```text
PropertyRegistered
```

# Property Verification

The authority uses:

```solidity
verifyProperty(propertyId)
```

to verify a property.

Verification is intentionally separate from registration.

### Registration means:

> An authorized authority created the property record.

### Verification means:

> The authority completed the project's simulated verification step.

This separation is useful because a real-world registry may have a registration workflow followed by independent verification or approval.

A successful verification emits:

```text
PropertyVerified
```

# Ownership Transfer

The simple prototype uses:

```solidity
transferOwnership(propertyId, newOwner)
```

## Transfer Workflow

```text
Current Owner
      |
      v
transferOwnership()
      |
      +--> property exists?
      +--> caller is current owner?
      +--> new owner valid?
      +--> property verified?
      +--> property not disputed/blocked?
      |
      v
Update currentOwner
Update previousOwner
Update timestamp
Update owner property list
Append ownership history
Emit OwnershipTransferred
```

## Transfer Rules

The contract checks:

- property exists
- caller is current owner
- new owner is not zero address
- property is verified
- property is not disputed
- property is not blocked

After a successful transfer:

```text
currentOwner = new owner
previousOwner = old owner
lastTransferredAt = current blockchain timestamp
```

# Advanced Multi-Step Transfer

A production-oriented version could use a multi-step workflow:

```text
requestTransfer()
        |
        v
Buyer / Authority Approval
        |
        v
completeTransfer()
```

This could provide additional checks such as:

- buyer acceptance
- authority approval
- document validation
- compliance checks
- mortgage/lien checks
- dispute checks

The current project intentionally uses the simpler workflow so the smart-contract logic remains beginner-friendly.

# Ownership History

The contract maintains an ownership history for each property.

Example:

```text
P001

0: Owner A
1: Buyer B
2: Buyer C
```

Events provide an additional audit trail.

### Events

```text
PropertyRegistered
PropertyVerified
OwnershipTransferred
PropertyStatusUpdated
```

A frontend or blockchain indexing application can query these events to construct a transaction timeline.

### Gas Consideration

Storing complete ownership history directly on-chain consumes blockchain storage and therefore increases gas costs.

A production system may use blockchain events and an off-chain indexer to build detailed history while keeping only important current state on-chain.

# Document Hash Verification

The project uses a dummy document:

```text
sample_documents/property_001.json
```

The document contains synthetic information such as:

- Property ID
- Survey Number
- Dummy Owner
- Location
- Area
- Property Type

## Hash Workflow

```text
Dummy Document
      |
      v
SHA-256
      |
      v
Document Hash
      |
      v
Hash Stored in Smart Contract
```

If the document changes:

```text
Original Document Hash
        !=
Modified Document Hash
```

This demonstrates document integrity verification.

## Generate Hash

Using the project's Node.js hash script:

```bash
node scripts/hash.js sample_documents/property_001.json
```

### Windows PowerShell

```powershell
Get-FileHash .\sample_documents\property_001.json -Algorithm SHA256
```

### Linux/macOS

```bash
sha256sum sample_documents/property_001.json
```

> **Important:** A matching hash proves that the file content matches the previously recorded fingerprint. It does **not** prove that the document itself was legally authentic.

# Why Documents Stay Off-Chain

Large documents and sensitive identity information should generally not be stored directly in public blockchain state.

The prototype stores a cryptographic fingerprint rather than the complete document.

Possible off-chain storage options include:

- controlled cloud storage
- document management systems
- IPFS where appropriate
- secure institutional storage

Do **not** place unnecessary sensitive identity documents such as:

- Aadhaar scans
- passport scans
- private legal documents
- personal identity records

directly on a public blockchain.

# Security Controls

The prototype demonstrates:

- authority-only registration
- authority-only verification
- admin-controlled authority management
- unique property IDs
- zero-address rejection
- verified-property requirement for transfers
- current-owner authorization
- disputed/blocked property protection
- property existence checks
- event emission
- active owner-list maintenance
- ownership history
- document hash preservation

# Folder Structure

```text
Blockchain-Land-Registry-Property-Ownership/
│
├── contracts/
│   └── LandRegistry.sol
│
├── scripts/
│   ├── deploy.js
│   └── hash.js
│
├── test/
│   └── LandRegistry.test.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── contract.js
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── sample_documents/
│   └── property_001.json
│
├── hashes/
│   └── property_001.sha256
│
├── screenshots/
│   └── .gitkeep
│
├── reports/
│   └── .gitkeep
│
├── docs/
│
├── README.md
├── LICENSE
├── hardhat.config.js
├── package.json
└── .gitignore
```

# Installation

Use a current LTS version of Node.js.

Clone the repository:

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
```

Move into the project:

```bash
cd Blockchain-Land-Registry-Property-Ownership
```

Install dependencies:

```bash
npm install
```

Compile:

```bash
npm run compile
```

Run tests:

```bash
npm test
```

The tests run against a local development blockchain.

**No real cryptocurrency is required.**

# Local Deployment

## Terminal 1

Start the local Hardhat blockchain:

```bash
npm run node
```

## Terminal 2

Deploy the contract:

```bash
npm run deploy:local
```

The deployment script will print the deployed contract address.

Copy the contract address into:

```text
frontend/src/contract.js
```

when using the optional frontend.

# Remix Simulation

The project can also be demonstrated completely through Remix.

## Test Accounts

Use the Remix VM accounts as:

```text
Account 1 → Admin / Authority
Account 2 → Owner A
Account 3 → Buyer B
Account 4 → Unauthorized User
```

## Steps

### Step 1
Open Remix IDE.

### Step 2
Create:

```text
LandRegistry.sol
```

### Step 3
Copy:

```text
contracts/LandRegistry.sol
```

into Remix.

### Step 4
Compile using Solidity:

```text
0.8.20
```

### Step 5
Open:

```text
Deploy & Run Transactions
```

### Step 6
Select:

```text
Remix VM
```

### Step 7
Deploy using Account 1.

Account 1 acts as Admin/Authority.

# Example Synthetic Property

```text
propertyId: 1

propertyNumber:
P001

location:
Demo Zone A, Synthetic District, India

area:
1500

propertyType:
Residential

initialOwner:
Account 2 address

documentHash:
32-byte SHA-256 hash
```

# Expected Remix Simulation

## Step 1 — Registration

Account 1 registers property P001 with Account 2 as the initial owner.

Expected:

```text
PropertyRegistered
```

## Step 2 — Check Property

Call:

```text
getProperty(1)
```

Expected:

```text
currentOwner = Account 2
```

## Step 3 — Unauthorized Verification

Switch to Account 4.

Call:

```text
verifyProperty(1)
```

Expected:

```text
Transaction reverted
```

because Account 4 is not an authority.

## Step 4 — Authority Verification

Switch back to Account 1.

Call:

```text
verifyProperty(1)
```

Expected:

```text
verified = true
status = VERIFIED
```

## Step 5 — Ownership Transfer

Switch to Account 2.

Call:

```text
transferOwnership(1, Account 3)
```

Expected:

```text
OwnershipTransferred
```

## Step 6 — Check New Owner

Call:

```text
getProperty(1)
```

Expected:

```text
currentOwner = Account 3
previousOwner = Account 2
```

## Step 7 — Old Owner Attempts Transfer

Switch back to Account 2.

Attempt another transfer.

Expected:

```text
Transaction reverted
```

because Account 2 is no longer the current owner.

# Hardhat Testing

Compile:

```bash
npm run compile
```

Run tests:

```bash
npm test
```

The test suite should cover:

- contract deployment
- authority access
- property registration
- duplicate property IDs
- zero address validation
- unauthorized registration
- property verification
- unauthorized verification
- ownership transfer
- ownership changes
- old-owner rejection
- non-owner rejection
- invalid property IDs
- unverified property transfer rejection
- document hash preservation
- status transitions
- ownership history
- event emission

Expected output:

```text
All tests passing
```

The exact number of tests may change as the project evolves.

# Optional Frontend

The optional frontend uses:

- React
- Vite
- ethers.js
- MetaMask

## Authority Dashboard

- Connect Wallet
- Register Property
- Verify Property
- Search Property
- Update Property Status

## Owner Dashboard

- Connect Wallet
- View My Properties
- Transfer Property
- View Ownership History

## Property Verification Page

- Property ID
- Property Number
- Location
- Area
- Property Type
- Current Owner
- Verification Status
- Document Hash
- Transaction History

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Connect MetaMask to the local Hardhat network.

Update the contract address in:

```text
frontend/src/contract.js
```

# Remix Proof / Screenshots

Recommended screenshots:

```text
01-folder-structure.png
02-contract-source.png
03-successful-compile.png
04-contract-deployed.png
05-property-registered.png
06-property-details-owner-a.png
07-unauthorized-verification-revert.png
08-property-verified.png
09-owner-a-transfer.png
10-buyer-b-current-owner.png
11-old-owner-transfer-rejected.png
12-ownership-history.png
13-original-document-hash.png
14-modified-document-hash-mismatch.png
15-hardhat-tests-passing.png
16-frontend-dashboard.png
17-github-repository.png
18-readme-preview.png
```

# Results

The prototype demonstrates that:

- only authorized accounts can register properties
- only authorized accounts can verify properties
- duplicate property IDs are rejected
- property records can be queried
- verification is explicit
- only the current wallet owner can transfer ownership
- unverified properties cannot transfer
- disputed/blocked properties cannot transfer
- old owners lose active ownership after transfer
- new owners receive active ownership
- ownership history remains available
- document hashes can be compared
- blockchain events provide an audit trail
- automated tests validate security rules

# Security & Real-World Limitations

## Wallet Identity Is Not Legal Identity

A wallet address is a blockchain account identifier.

It does not automatically prove:

- a person's government identity
- legal ownership
- citizenship
- property title

A real system would require identity verification and legal integration.

## Private Key Compromise

If an owner's private key is compromised, an attacker could potentially perform blockchain actions using that wallet.

Real systems would require stronger key-management mechanisms.

Possible solutions include:

- hardware wallets
- multisignature wallets
- account abstraction
- key recovery
- institutional custody
- role-based governance

## Authority Trust

This prototype trusts authorized authority accounts.

A compromised or fraudulent authority could potentially register incorrect information.

A production system would require stronger governance, auditing, identity verification, and potentially multi-party approval.

## Garbage In, Garbage Out

Blockchain can preserve data reliably, but it cannot automatically determine whether the original data is correct.

```text
Incorrect property data
        |
        v
Authority registers it
        |
        v
Blockchain preserves the record
```

The blockchain has now preserved incorrect information.

Therefore:

> **Blockchain can provide tamper-evident records, but it cannot automatically guarantee the truth of the data entered into the system.**

## Document Forgery

A document hash can detect whether a file has changed.

However, a matching hash does not automatically prove that:

- the document was legally issued
- the document is genuine
- the person named in the document is the legal owner
- the underlying property information is correct

## Legal Disputes

Real property systems must handle:

- inheritance
- mortgages
- liens
- easements
- family claims
- court orders
- property disputes
- government acquisition
- ownership restrictions
- title corrections

These workflows are outside this educational prototype.

## Government Integration

A real land-registry blockchain system would require integration with:

- government authorities
- land registrars
- identity systems
- cadastral databases
- survey records
- legal document systems
- courts
- dispute-resolution systems

## Privacy

Public blockchains are generally unsuitable for storing sensitive identity documents directly on-chain.

The prototype therefore stores a document hash instead of the complete document.

# Legal & Real-World Considerations

This project must be presented as an:

> **Educational blockchain-based technical prototype.**

Blockchain provides tamper-evident state and transaction history.

It does not independently validate the truth of the initial property record.

It does not replace:

- government land registries
- legal title records
- property registration offices
- courts
- applicable property laws

A real deployment could require:

- government authority
- identity verification
- registrar integration
- cadastral/survey database integration
- document verification
- court/dispute workflows
- inheritance workflows
- mortgage/lien checks
- privacy controls
- key recovery
- account governance
- audit and compliance controls

# Future Improvements

1. OpenZeppelin role-based access control.
2. Two-step authority administration.
3. Multi-party transfer approval.
4. Buyer acceptance.
5. Government registrar integration.
6. Court-order integration.
7. Decentralized identity.
8. IPFS/document management.
9. Encrypted off-chain document storage.
10. Property GIS/map integration.
11. Mortgage and lien module.
12. Dispute-resolution module.
13. Multisignature authority.
14. Event indexing using The Graph or another indexer.
15. Role-specific dashboards.
16. Formal verification.
17. Professional smart-contract security auditing.
18. Integration with government identity systems.
19. Property document versioning.
20. Advanced access-control governance.

# Learning Outcomes

After completing this project, a student should be able to explain:

- how blockchain networks maintain transaction history
- how smart contracts represent application state
- how Solidity structs work
- how Solidity mappings work
- how arrays can store historical information
- how enums represent state
- why access control matters
- how `msg.sender` identifies the caller
- how modifiers simplify validation
- how events create application-readable audit trails
- how wallet addresses can represent technical ownership
- why document hashes are useful
- how ownership transfer can be enforced by a smart contract
- how blockchain immutability/tamper-evidence works
- why blockchain does not automatically equal legal ownership
- how to write automated smart-contract tests
- how to demonstrate a blockchain proof of work on GitHub

# GitHub Project Information

## Repository Name

```text
Blockchain-Land-Registry-Property-Ownership
```

## Repository Description

```text
Educational blockchain land registry prototype using Solidity smart contracts for property registration, verification, ownership transfer, document-hash verification, and auditable ownership history.
```

## Suggested GitHub Topics

```text
blockchain
solidity
land-registry
real-estate
property
ethereum
smart-contract
web3
proptech
hardhat
ethersjs
dapp
```

# Suggested Commit History

```text
Initialize blockchain land registry project
Add property data model
Implement authority-based property registration
Add property verification workflow
Implement secure ownership transfer
Add property document hash verification
Add ownership history events
Add Hardhat tests
Add Remix simulation proof
Complete README and documentation
```

# Development Roadmap

## Phase 1
Development environment setup.

## Phase 2
Architecture planning.

## Phase 3
Role and permission design.

## Phase 4
Property data model.

## Phase 5
Property registration.

## Phase 6
Verification logic.

## Phase 7
Ownership transfer.

## Phase 8
Ownership history and events.

## Phase 9
Document hash integration.

## Phase 10
Security validation.

## Phase 11
Hardhat automated testing.

## Phase 12
Remix simulation.

## Phase 13
Optional React frontend.

## Phase 14
GitHub documentation and project report.

# Educational Project Scope

This project intentionally uses:

```text
Synthetic Property Data
        +
Test Wallet Addresses
        +
Local Blockchain
        +
Solidity Smart Contract
        +
Optional React dApp
```

No real cryptocurrency is required.

No real property records are required.

No real government documents are required.

No real land ownership is created or transferred.

# Conclusion

The Blockchain-Based Land Registry & Property Ownership System demonstrates how blockchain technology and Solidity smart contracts can be used to create a transparent, auditable, and tamper-evident technical property registry prototype.

The system demonstrates:

```text
Property Registration
        ↓
Authority Verification
        ↓
Wallet-Based Ownership
        ↓
Ownership Transfer
        ↓
Ownership History
        ↓
Document Hash Verification
        ↓
Auditable Blockchain Events
```

The project is designed as a student-level blockchain proof of work while following concepts that are relevant to real-world Web3, PropTech, digital registry, and document-verification systems.

However, the prototype does not establish legal property ownership.

A production implementation would require government integration, verified identities, cadastral records, legal procedures, dispute resolution, privacy controls, and compliance with applicable property laws.

# Author

**Atharva Rai**  
**Institution:** Birla Institute of Applied Sciences  
**Program:** IIT Delhi Diploma Program  
**Branch:** Computer Science and Engineering (CSE)  
**Year:** 3rd Year  
**Academic Year:** 2026  

# Educational Disclaimer

This repository intentionally uses synthetic property data, dummy documents, and test wallet addresses.

It is an educational blockchain prototype and is **not**:

- a government land registry
- a legal title system
- a property registration authority
- a legal ownership verification service
- a production real-estate transaction platform

Blockchain records in this project represent technical blockchain state only and do not automatically establish legally recognized property ownership.
