const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const registry = await LandRegistry.deploy();

  await registry.waitForDeployment();

  console.log("LandRegistry deployed to:", await registry.getAddress());
  console.log("Admin:", await registry.admin());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
