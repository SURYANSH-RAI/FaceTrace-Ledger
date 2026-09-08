require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    baseSepolia: {
      url: BASE_SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
      gasPrice: 1000000000, // 1 gwei
    },
    baseMainnet: {
      url: process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: BASESCAN_API_KEY,
      base: BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};
