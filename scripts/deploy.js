const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting FaceMediaRegistry deployment to Base network...");
  console.log(`📡 Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId || "unknown"})`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer Account: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${hre.ethers.formatEther(balance)} ETH`);

  const FaceMediaRegistry = await hre.ethers.getContractFactory("FaceMediaRegistry");
  const registry = await FaceMediaRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("--------------------------------------------------");
  console.log(`✅ FaceMediaRegistry successfully deployed to Base!`);
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log("--------------------------------------------------");

  // Export contract address & ABI to frontend config
  const contractsDir = path.join(__dirname, "..", "src", "config");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("FaceMediaRegistry");

  const contractConfig = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 84532,
    deployedAt: new Date().toISOString(),
    abi: contractArtifact.abi
  };

  fs.writeFileSync(
    path.join(contractsDir, "contractConfig.json"),
    JSON.stringify(contractConfig, null, 2)
  );

  console.log(`📄 Saved contract deployment config to src/config/contractConfig.json`);

  if (hre.network.name === "baseSepolia") {
    console.log(`🔍 View on BaseScan: https://sepolia.basescan.org/address/${contractAddress}`);
  } else if (hre.network.name === "baseMainnet") {
    console.log(`🔍 View on BaseScan: https://basescan.org/address/${contractAddress}`);
  }
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
