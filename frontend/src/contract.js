// Replace this with the address printed by `npm run deploy:local`.
export const CONTRACT_ADDRESS = "PASTE_DEPLOYED_CONTRACT_ADDRESS_HERE";

export const ABI = [
  "function registerProperty(uint256,string,string,uint256,string,address,bytes32)",
  "function verifyProperty(uint256)",
  "function transferOwnership(uint256,address)",
  "function getProperty(uint256) view returns (tuple(uint256 propertyId,string propertyNumber,string location,uint256 area,string propertyType,address currentOwner,address previousOwner,bytes32 documentHash,bool verified,uint8 status,uint256 registeredAt,uint256 lastTransferredAt))",
  "function getPropertiesByOwner(address) view returns (uint256[])",
  "function getOwnershipHistory(uint256) view returns (address[])",
  "function authorities(address) view returns (bool)",
  "function admin() view returns (address)"
];

export const STATUS = [
  "REGISTERED",
  "VERIFIED",
  "TRANSFER_PENDING",
  "TRANSFERRED",
  "DISPUTED",
  "BLOCKED"
];
