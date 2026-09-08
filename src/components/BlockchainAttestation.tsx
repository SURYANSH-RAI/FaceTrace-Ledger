"use client";

import React, { useState } from "react";
import { ShieldCheck, ArrowRight, ExternalLink, FileText, CheckCircle2, Lock, Cpu, Sparkles, AlertCircle, Award } from "lucide-react";
import { ethers } from "ethers";
import { FaceScanResult, OsintSearchResult, VerificationRecord } from "@/lib/types";
import { computeCanonicalDataHash, switchToBaseSepolia } from "@/lib/blockchain";
import contractConfig from "@/config/contractConfig.json";

interface BlockchainAttestationProps {
  scanResult: FaceScanResult | null;
  selectedPost: OsintSearchResult | null;
  walletAddress: string | null;
  onAttestationComplete: (record: VerificationRecord) => void;
  onOpenCertificate: (record: VerificationRecord) => void;
}

export const BlockchainAttestation: React.FC<BlockchainAttestationProps> = ({
  scanResult,
  selectedPost,
  walletAddress,
  onAttestationComplete,
  onOpenCertificate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attestationStatus, setAttestationStatus] = useState<string>("");
  const [lastAttestedRecord, setLastAttestedRecord] = useState<VerificationRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timestamp = scanResult ? scanResult.timestamp : Date.now();
  const canonicalHash =
    scanResult && selectedPost
      ? computeCanonicalDataHash(
          scanResult.faceHash,
          selectedPost.postUrl,
          selectedPost.platform,
          timestamp
        )
      : "0x0000000000000000000000000000000000000000000000000000000000000000";

  const handleAttestOnBase = async () => {
    if (!scanResult || !selectedPost) {
      setErrorMsg("Please complete Face Scan and select a Discovered Post first.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    setAttestationStatus("Preparing cryptographic Keccak-256 payload...");

    try {
      // Check if browser wallet (MetaMask / Coinbase Wallet) is connected
      if (typeof window !== "undefined" && (window as any).ethereum && walletAddress) {
        setAttestationStatus("Requesting wallet signature on Base Sepolia L2...");
        await switchToBaseSepolia((window as any).ethereum);

        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractConfig.address;
        const contract = new ethers.Contract(contractAddress, contractConfig.abi, signer);

        const metadataURI = JSON.stringify({
          faceHash: scanResult.faceHash,
          postUrl: selectedPost.postUrl,
          platform: selectedPost.platform,
          author: selectedPost.postAuthor,
          confidence: scanResult.confidence,
          similarityScore: selectedPost.similarityScore,
          timestamp,
        });

        const tx = await contract.recordVerification(
          canonicalHash,
          scanResult.faceHash,
          selectedPost.postUrl,
          selectedPost.platform,
          selectedPost.postAuthor,
          metadataURI
        );

        setAttestationStatus("Broadcasting transaction to Base Sepolia L2 block...");
        const receipt = await tx.wait();

        const record: VerificationRecord = {
          dataHash: canonicalHash,
          faceHash: scanResult.faceHash,
          postUrl: selectedPost.postUrl,
          platform: selectedPost.platform,
          postAuthor: selectedPost.postAuthor,
          metadataURI,
          verifier: walletAddress,
          timestamp,
          blockNumber: receipt.blockNumber || 18492042,
          isVerified: true,
          txHash: receipt.hash,
        };

        setLastAttestedRecord(record);
        onAttestationComplete(record);
      } else {
        // Use Relayer API Route for automated friction-free attestation
        setAttestationStatus("Submitting to Base Sepolia L2 smart contract relayer...");
        const res = await fetch("/api/blockchain/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            faceHash: scanResult.faceHash,
            postUrl: selectedPost.postUrl,
            platform: selectedPost.platform,
            postAuthor: selectedPost.postAuthor,
            metadataURI: JSON.stringify({
              confidence: scanResult.confidence,
              similarityScore: selectedPost.similarityScore,
            }),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Blockchain attestation failed");
        }

        setLastAttestedRecord(data.data);
        onAttestationComplete(data.data);
      }
    } catch (err: any) {
      console.error("Attestation error:", err);
      setErrorMsg(err.reason || err.message || "Failed to commit on-chain attestation");
    } finally {
      setIsSubmitting(false);
      setAttestationStatus("");
    }
  };

  return (
    <div className="bg-[#0D131F]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Background glow */}
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              3
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Base Blockchain Attestation &amp; Immutability
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish cryptographic tamper-proof proof of identity-to-media association to Base L2 smart contract.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-cyan-300">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Smart Contract: <strong className="font-mono text-white">FaceMediaRegistry.sol</strong></span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Cryptographic Proof Payload */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Canonical Proof Hash (Keccak-256)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">EVM Solidity Packed</span>
            </div>
            <div className="bg-[#080B11] p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-400 break-all select-all">
              {canonicalHash}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-500 text-[10px] block mb-1">Target Network</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-bold text-slate-200">Base Sepolia L2</span>
                <span className="text-[10px] text-slate-400 font-mono">#84532</span>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-500 text-[10px] block mb-1">Estimated Gas Fee</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
                <span>&lt; 0.00004 ETH</span>
                <span className="text-[10px] text-slate-500">(~$0.001 on Base)</span>
              </div>
            </div>
          </div>

          {/* Selected Discovery Summary */}
          {selectedPost ? (
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-3 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-cyan-300">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
                  Attestation Target Record
                </span>
                <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                  {selectedPost.platform} &bull; {selectedPost.postAuthor}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{selectedPost.postUrl}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center text-slate-500 text-xs">
              Select a discovered social media post from Step 2 above to associate with the biometric fingerprint.
            </div>
          )}
        </div>

        {/* Right: Attestation Action & Verification Confirmation */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              On-Chain Registration
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              Recording this verification creates an immutable, timestamped record on the Base blockchain that can be independently audited anytime.
            </p>

            {lastAttestedRecord ? (
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 space-y-2 mb-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully Attested on Base!</span>
                </div>
                <div className="text-[11px] space-y-1 font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Block Number:</span>
                    <span>#{lastAttestedRecord.blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-emerald-400">Confirmed (Finalized)</span>
                  </div>
                </div>

                {lastAttestedRecord.txHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${lastAttestedRecord.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition"
                  >
                    <span>View on BaseScan Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Zero-knowledge perceptual vector indexing</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Coinbase Base L2 EVM security guarantee</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            {lastAttestedRecord ? (
              <button
                onClick={() => onOpenCertificate(lastAttestedRecord)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
              >
                <Award className="w-4 h-4" />
                View &amp; Export Verification Certificate
              </button>
            ) : (
              <button
                onClick={handleAttestOnBase}
                disabled={isSubmitting || !scanResult || !selectedPost}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                {isSubmitting ? (attestationStatus || "Attesting to Base...") : "Attest Record to Base Blockchain"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
