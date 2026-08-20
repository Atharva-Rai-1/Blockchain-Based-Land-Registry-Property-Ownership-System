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

> **Educational disclaimer:** All property records, documents, names, survey numbers, and wallet addresses are synthetic/demo data. This system does **not** create, prove, or replace legally valid property ownership. A production system would require government registries, identity verification, cadastral systems, legal procedures, and applicable property laws.

## Problem Statement

Traditional property records can involve fragmented databases, paper documents, manual verification, duplicate records, inconsistent updates, and difficult audit trails. These issues can contribute to disputes when multiple records appear to describe the same property.

Blockchain can provide a shared, append-only, tamper-evident transaction history. Smart contracts can enforce predefined registration, verification, and transfer rules.

However, blockchain cannot determine whether information entered into it is legally true. This project therefore demonstrates the **technical registry workflow**, not a legal title system.

## Objectives

1. Build a Solidity property registry.
2. Restrict registration and verification to authorized authority wallets.
3. Link a property record to a wallet address.
4. Require verification before transfer.
5. Allow only the current owner to transfer.
6. Preserve ownership history through events and an on-chain history array.
7. Store a document hash instead of a full document.
8. Test security and expected failure cases automatically.

## Industry Relevance

The architecture is conceptually relevant to:

- government land registries
- property management platforms
- real-estate technology
- housing societies
- mortgage and loan verification
- title due diligence
- document authentication
- audit and compliance systems

Potential business value includes transparent workflows, tamper-evident history, faster lookup, fewer duplicate registry entries, easier ownership tracking, and improved auditability.

Blockchain itself does not make a transfer legally valid. A real deployment would need integration with government authorities, legal identity, cadastral/survey databases, courts, registrars, and dispute-resolution processes.

## Blockchain Concepts Used

| Concept | Project use |
|---|---|
| Blockchain | Shared append-only transaction history |
| Ethereum-compatible network | Execution environment |
| Smart contract | Registry rules and state |
| Solidity | Contract programming language |
| Wallet address | Technical owner/actor identifier |
| `msg.sender` | Identifies caller |
| `struct` | Models a property |
| `mapping` | Fast property/owner lookup |
| `array` | Active owner lists and ownership history |
| `enum` | Property status |
| `modifier` | Access/existence checks |
| events | Auditable history for frontend indexing |
| `require()` | Input and authorization validation |
| access control | Restricts authority functions |
| document hash | Detects document changes |
| transaction hash | Identifies blockchain transactions |
| immutability | Past blockchain state is difficult to alter |
| testnet/local chain | Safe development environment |
| dApp | Frontend connected to the contract |
| gas | Cost of state-changing operations |
| off-chain metadata | Keeps large/private documents outside chain |

## Actors

| Actor | Permissions |
|---|---|
| Admin | Deploys contract, adds/removes authorities |
| Authority | Registers, verifies, and manages property status |
| Property Owner | Views property and transfers only their current property |
| Buyer/New Owner | Receives ownership and can later transfer it |
| Optional Verifier | In a future version, can receive a separate verification role |

## Technology Stack

### Recommended student stack

- Solidity `0.8.20`
- Hardhat 2 teaching-compatible setup
- ethers.js 6
- MetaMask
- Remix IDE + Remix VM
- optional React + Vite frontend
- local Hardhat Network

The repository pins a Hardhat 2-compatible toolbox version so the CommonJS JavaScript test files in this educational project remain simple. Hardhat 3 is now the current Hardhat generation, so do not mix its project configuration with this pinned Hardhat 2 setup without deliberately migrating the project.

## System Architecture

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

## Property Data Model

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

### Field meanings

- `propertyId`: unique numeric identifier.
- `propertyNumber`: human-readable registry reference.
- `location`: synthetic location string.
- `area`: numeric area value.
- `propertyType`: e.g. Residential.
- `currentOwner`: current wallet address in this prototype.
- `previousOwner`: immediately previous wallet.
- `documentHash`: SHA-256-style document fingerprint represented as `bytes32`.
- `verified`: whether an authority verified the record.
- `status`: lifecycle state.
- `registeredAt`: registration block timestamp.
- `lastTransferredAt`: last transfer block timestamp.

## Workflow

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
Contract Checks:
- caller == currentOwner
- property exists
- verified
- new owner != zero
- not disputed/blocked
   |
   v
New Owner Assigned
   |
   v
OwnershipTransferred Event
   |
   v
History Preserved
```

## Smart Contract Functions

### Authority administration

- `addAuthority(address)`
- `removeAuthority(address)`

### Property lifecycle

- `registerProperty(...)`
- `verifyProperty(propertyId)`
- `updatePropertyStatus(propertyId, status)`
- `propertyExists(propertyId)`

### Read functions

- `getProperty(propertyId)`
- `getPropertiesByOwner(address)`
- `getOwnershipHistory(propertyId)`

### Ownership

- `transferOwnership(propertyId, newOwner)`

## Registration Rules

`registerProperty()` requires:

1. caller is an authority
2. property ID is non-zero
3. property ID is unique
4. property number is present
5. location is present
6. area is greater than zero
7. property type is present
8. owner is not zero address
9. document hash is non-zero

## Verification Rules

Verification is deliberately separate from registration. Registration means an authorized account created the record; verification means the authority has completed the project's simulated verification step.

## Ownership Transfer

The simple workflow uses one transaction:

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
Update active owner index
Append ownership history
Emit event
```

A production-grade workflow could instead use:

```text
requestTransfer()
        |
        v
authority / buyer approval
        |
        v
completeTransfer()
```

That multi-step design can reduce accidental transfers and support additional checks.

## Ownership History

The contract stores the active property list for each current owner and also stores a complete address sequence in `ownershipHistory[propertyId]`.

For example:

```text
P001
  0: Owner A
  1: Buyer B
  2: Buyer C
```

Events provide an additional audit trail:

- `PropertyRegistered`
- `PropertyVerified`
- `OwnershipTransferred`
- `PropertyStatusUpdated`

A frontend can query event logs to construct a transaction timeline.

On-chain history costs gas and storage. A production system may keep the detailed event timeline off-chain while using the blockchain as the source of truth for key state.

## Document Hash Verification

The sample document is:

`sample_documents/property_001.json`

Generate its SHA-256 hash:

```bash
node scripts/hash.js sample_documents/property_001.json
```

Expected hash for the repository version:

```text
3534bff604d7c11df45184919983d5f31dd2bbd89e3389b619ced777d5da1945
```

Workflow:

```text
Document
   |
SHA-256
   |
Hash
   |
bytes32 stored in contract
```

If the document is modified, the hash changes:

```text
Original document hash != Modified document hash
```

This provides integrity evidence, not proof that the document itself was legally authentic.

## Why Documents Stay Off-Chain

Large documents and personal identity records should generally not be stored directly in a public blockchain state.

Store only a cryptographic fingerprint/reference on-chain and keep the actual file in an appropriate off-chain system such as controlled cloud storage, a document management system, or IPFS where appropriate.

Do not put unnecessary identity documents, Aadhaar/passport scans, private legal files, or other sensitive personal information directly on-chain.

## Security Controls

The prototype demonstrates:

- authority-only registration
- authority-only verification
- admin-controlled authority management
- unique property IDs
- zero-address rejection
- verified-property requirement for transfers
- current-owner authorization
- disputed/blocked transfer protection
- property existence checks
- event emission
- active owner-list maintenance
- complete ownership history
- document hash preservation

## Folder Structure

```text
Blockchain-Land-Registry-Property-Ownership/
├── contracts/
│   └── LandRegistry.sol
├── scripts/
│   ├── deploy.js
│   └── hash.js
├── test/
│   └── LandRegistry.test.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── contract.js
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── sample_documents/
│   └── property_001.json
├── hashes/
│   └── property_001.sha256
├── screenshots/
├── reports/
├── docs/
├── README.md
├── hardhat.config.js
├── package.json
└── .gitignore
```

## Installation

Use a current LTS Node.js release.

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd Blockchain-Land-Registry-Property-Ownership

npm install
npm run compile
npm test
```

The tests run against Hardhat's local in-process development network. No real cryptocurrency is required.

## Local Deployment

Terminal 1:

```bash
npm run node
```

Terminal 2:

```bash
npm run deploy:local
```

Copy the printed contract address into:

```text
frontend/src/contract.js
```

## Remix Simulation

1. Open Remix IDE.
2. Create `LandRegistry.sol`.
3. Paste `contracts/LandRegistry.sol`.
4. Compile with Solidity `0.8.20`.
5. Open Deploy & Run Transactions.
6. Select Remix VM.
7. Deploy from Account 1.
8. Use Account 1 as Admin/Authority.
9. Use Account 2 as Owner A.
10. Use Account 3 as Buyer B.
11. Use Account 4 as unauthorized user.

Example registration:

```text
propertyId: 1
propertyNumber: P001
location: Agwar Demo Zone, Uttar Pradesh, India
area: 1500
propertyType: Residential
initialOwner: Account 2 address
documentHash: 0x...32-byte hash...
```

Expected sequence:

```text
REGISTERED
   |
verifyProperty()
   |
VERIFIED
   |
Owner A transferOwnership(1, Buyer B)
   |
TRANSFERRED
```

Unauthorized verification should revert with:

```text
Only authority
```

After transfer:

```text
currentOwner == Account 3
previousOwner == Account 2
```

Account 2 attempting another transfer should revert:

```text
Caller is not current owner
```

## Hardhat Testing

```bash
npm run compile
npm test
```

Expected result is a passing test suite covering deployment, access control, registration, duplicate IDs, verification, transfer authorization, ownership changes, history, hashes, statuses, and events.

## Optional Frontend

The frontend is intentionally small so the blockchain logic remains easy to understand.

```bash
cd frontend
npm install
npm run dev
```

Connect MetaMask to the local Hardhat network and update the contract address in `frontend/src/contract.js`.

The sample UI supports:

- wallet connection
- property lookup
- property verification
- ownership transfer
- ownership history display

A production UI would separate Authority, Owner, Buyer, and public verification pages.

## Remix Proof

Recommended screenshots:

1. successful compilation
2. deployed contract
3. Account 1/admin
4. registration transaction
5. `getProperty(1)`
6. unauthorized verification revert
7. successful verification
8. Owner A address
9. transfer transaction
10. Buyer B as current owner
11. old owner transfer revert
12. ownership history
13. document hash
14. modified-document hash mismatch
15. Hardhat test output

Suggested filenames:

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

## Results

The prototype demonstrates that:

- only authorized accounts can register/verify
- duplicate property IDs are rejected
- property records can be queried
- verification is explicit
- only the current wallet owner can transfer
- unverified/disputed/blocked properties cannot transfer
- old owners lose active ownership
- new owners receive active ownership
- ownership history remains available
- document hashes can be compared
- automated tests validate security rules

## Limitations

### Wallet identity is not legal identity

A wallet address is only a blockchain account identifier. It does not automatically prove a person's government identity or legal title.

### Garbage in, garbage out

If an authority enters false or incorrect property data, the blockchain can preserve that incorrect record very reliably.

### Private keys

If an owner's private key is compromised, an attacker may be able to perform authorized blockchain actions.

### Authority trust

This prototype trusts the authority accounts. A fraudulent or compromised authority could register incorrect records.

### Legal disputes

Courts, inheritance, mortgages, liens, easements, land acquisition, family claims, and government orders require legal workflows that are outside this prototype.

### Government integration

A real deployment would need integration with cadastral/survey databases, government registrars, identity systems, legal approval, and dispute-resolution processes.

### Privacy

Public blockchains are not suitable for placing sensitive identity documents directly on-chain.

## Legal & Real-World Considerations

This project must be presented as an **educational technical prototype**.

Blockchain provides tamper-evident state/history; it does not independently validate the truth of the initial record and does not replace the legal property-registration process.

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
- key recovery and account governance
- audit and compliance controls

## Future Improvements

1. OpenZeppelin role-based access control.
2. Two-step authority administration.
3. Multi-party transfer approval.
4. Buyer acceptance.
5. Registrar/court integration.
6. Decentralized identity.
7. IPFS/document management.
8. Encrypted off-chain document storage.
9. Property GIS/map integration.
10. Mortgage and lien module.
11. Dispute-resolution module.
12. Multisig authority.
13. Event indexing with The Graph or an application indexer.
14. Role-specific dashboards.
15. Formal verification and professional smart-contract audit.

## Learning Outcomes

After completing this project, a student should be able to explain:

- how smart contracts represent state
- how Solidity mappings and structs work
- why access control matters
- how `msg.sender` identifies the caller
- how events create application-readable audit trails
- how wallet addresses can represent technical ownership
- why document hashes are useful
- why blockchain does not equal legal ownership
- how to write automated contract tests
- how to present a blockchain proof of work on GitHub

## Author

**Student Blockchain Course Project**

Use your own name, college, course, mentor, and academic year here.

## Educational Disclaimer

This repository intentionally uses synthetic data and test wallets. It is not a government registry, legal title system, or production land-registration service.
