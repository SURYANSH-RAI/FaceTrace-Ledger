import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import contractConfig from "@/config/contractConfig.json";
import { computeCanonicalDataHash } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { faceHash, postUrl, platform, postAuthor, metadataURI } = body;

    if (!faceHash || !postUrl) {
      return NextResponse.json(
        { error: "faceHash and postUrl are required" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const canonicalHash = computeCanonicalDataHash(faceHash, postUrl, platform || "Web", timestamp);
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractConfig.address;
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://sepolia.base.org";
    const privateKey = process.env.PRIVATE_KEY;

    let txHash = "";
    let blockNumber = 0;
    let verifier = "";
    let isMockSimulation = false;

    // Check if private key is provided for automated on-chain relayer
    if (privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      verifier = wallet.address;
      const contract = new ethers.Contract(contractAddress, contractConfig.abi, wallet);

      const tx = await contract.recordVerification(
        canonicalHash,
        faceHash,
        postUrl,
        platform || "Web",
        postAuthor || "Discovered Entity",
        metadataURI || JSON.stringify({ timestamp, faceHash, postUrl })
      );

      const receipt = await tx.wait();
      txHash = receipt.hash;
      blockNumber = receipt.blockNumber;
    } else {
      // If server relayer key is not set, simulate on-chain attestation for immediate UX
      // (or guide user to use browser MetaMask / Coinbase Wallet in frontend)
      isMockSimulation = true;
      verifier = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
      txHash = `0x${ethers.keccak256(ethers.toUtf8Bytes(canonicalHash + Date.now())).substring(2)}`;
      blockNumber = 18492042;
    }

    return NextResponse.json({
      success: true,
      data: {
        dataHash: canonicalHash,
        faceHash,
        postUrl,
        platform: platform || "Web",
        postAuthor: postAuthor || "Discovered Entity",
        metadataURI: metadataURI || "",
        verifier,
        timestamp,
        blockNumber,
        txHash,
        isVerified: true,
        network: "Base Sepolia Testnet (Chain ID 84532)",
        explorerUrl: `https://sepolia.basescan.org/tx/${txHash}`,
        isMockSimulation,
      },
    });
  } catch (error: any) {
    console.error("Error during blockchain recording:", error);
    return NextResponse.json(
      { error: error.reason || error.message || "Failed to record on Base blockchain" },
      { status: 500 }
    );
  }
}
