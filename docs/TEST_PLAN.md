# Test Plan

| # | Initial condition | Action | Expected result |
|---|---|---|---|
| 1 | Fresh deployment | Check admin | Deployer is admin |
| 2 | Fresh deployment | Check admin authority | `true` |
| 3 | Authority account | Register P001 | Success |
| 4 | P001 exists | Register P001 again | Revert |
| 5 | Authority | Register zero owner | Revert |
| 6 | Unauthorized account | Register property | Revert |
| 7 | Registered property | Authority verifies | Success |
| 8 | Registered property | Unauthorized verifies | Revert |
| 9 | Unverified property | Owner transfers | Revert |
| 10 | Verified property | Current owner transfers | Success |
| 11 | After transfer | Check current owner | Buyer |
| 12 | After transfer | Old owner transfers | Revert |
| 13 | Verified property | Zero new owner | Revert |
| 14 | Unknown ID | Query/verify | Revert |
| 15 | Registered property | Query owner list | Initial owner listed |
| 16 | Transferred property | Query owner lists | Old removed, new added |
| 17 | Registered property | Read hash | Same hash |
| 18 | Two transfers | Read history | All owners present |
| 19 | Verified property | Mark disputed | Success |
| 20 | Disputed property | Transfer | Revert |
| 21 | Disputed verified property | Restore VERIFIED | Success |
| 22 | Registration | Inspect event | PropertyRegistered emitted |
| 23 | Verification | Inspect event | PropertyVerified emitted |
| 24 | Transfer | Inspect event | OwnershipTransferred emitted |
