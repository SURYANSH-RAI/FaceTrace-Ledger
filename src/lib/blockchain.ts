import { ethers } from "ethers";
import contractConfig from "@/config/contractConfig.json";
import { BlockchainAttestationPayload, VerificationRecord } from "./types";

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

export const BASE_SEPOLIA_CONFIG = {
  chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: "Base Sepolia Testnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [
    process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org",
  ],
  blockExplorerUrls: [
    process.env.NEXT_PUBLIC_BASE_EXPLORER_URL || "https://sepolia.basescan.org",
  ],
};

/**
 * Computes canonical Keccak-256 cryptographic proof hash for on-chain integrity
 */
export function computeCanonicalDataHash(
  faceHash: string,
  postUrl: string,
  platform: string,
  timestamp: number
): string {
  const encoded = ethers.solidityPackedKeccak256(
    ["string", "string", "string", "uint256"],
    [faceHash, postUrl, platform, Math.floor(timestamp / 1000)]
  );
  return encoded;
}

/**
 * Get read-only contract instance connected to Base Sepolia RPC
 */
export function getReadOnlyContract(customAddress?: string) {
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const address = customAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractConfig.address;
  return new ethers.Contract(address, contractConfig.abi, provider);
}

/**
 * Switch or add Base Sepolia network to connected browser wallet (MetaMask, Coinbase Wallet)
 */
export async function switchToBaseSepolia(ethereumProvider: any): Promise<boolean> {
  if (!ethereumProvider) return false;
  try {
    await ethereumProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_SEPOLIA_CONFIG.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 means the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await ethereumProvider.request({
          method: "wallet_addEthereumChain",
          params: [BASE_SEPOLIA_CONFIG],
        });
        return true;
      } catch (addError) {
        console.error("Failed to add Base Sepolia network:", addError);
        return false;
      }
    }
    console.error("Failed to switch network:", switchError);
    return false;
  }
}

/**
 * Re-verify a record against Base smart contract
 */
export async function verifyRecordOnBase(dataHashOrUrl: string): Promise<{
  success: boolean;
  record?: VerificationRecord;
  error?: string;
}> {
  try {
    const contract = getReadOnlyContract();
    let rawRecord;

    if (dataHashOrUrl.startsWith("0x") && dataHashOrUrl.length === 66) {
      // Query by bytes32 dataHash
      rawRecord = await contract.verifyRecord(dataHashOrUrl);
    } else {
      // Query by post URL
      rawRecord = await contract.getRecordByUrl(dataHashOrUrl);
    }

    if (!rawRecord || !rawRecord.isVerified) {
      return { success: false, error: "Record not found or not verified on Base" };
    }

    return {
      success: true,
      record: {
        dataHash: rawRecord.dataHash,
        faceHash: rawRecord.faceHash,
        postUrl: rawRecord.postUrl,
        platform: rawRecord.platform,
        postAuthor: rawRecord.postAuthor,
        metadataURI: rawRecord.metadataURI,
        verifier: rawRecord.verifier,
        timestamp: Number(rawRecord.timestamp),
        blockNumber: Number(rawRecord.blockNumber),
        isVerified: rawRecord.isVerified,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.reason || err.message || "Failed to query Base smart contract",
    };
  }
}
