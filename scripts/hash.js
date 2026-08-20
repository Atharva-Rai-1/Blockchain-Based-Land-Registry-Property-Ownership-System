const fs = require("fs");
const crypto = require("crypto");

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node scripts/hash.js sample_documents/property_001.json");
  process.exit(1);
}

const file = fs.readFileSync(filePath);
const hash = crypto.createHash("sha256").update(file).digest("hex");

console.log(`SHA-256: ${hash}`);
console.log(`bytes32 for Solidity: 0x${hash}`);
