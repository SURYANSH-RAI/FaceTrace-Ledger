"use client";

import React, { useState } from "react";
import { Search, Shield, CheckCircle2, XCircle, ExternalLink, Calendar, User, Link as LinkIcon, Cpu, Award } from "lucide-react";
import { VerificationRecord } from "@/lib/types";
import contractConfig from "@/config/contractConfig.json";

interface OnChainVerifierProps {
  onOpenCertificate: (record: VerificationRecord) => void;
}

export const OnChainVerifier: React.FC<OnChainVerifierProps> = ({ onOpenCertificate }) => {
  const [queryInput, setQueryInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isFound, setIsFound] = useState<boolean | null>(null);

  const sampleQueries = [
    {
      label: "Sample Verified Post Hash",
      query: "0x8fa4c36190ab78f2d5e31c9472e38c92a912f714271829471928374619284729",
    },
    {
      label: "Sample Verified Post URL",
      query: "https://x.com/alexrivera_ai/status/1882000000000000000",
    },
  ];

  const handleVerify = async (queryToRun?: string) => {
    const q = queryToRun || queryInput.trim();
    if (!q) return;

    setIsVerifying(true);
    setStatusMessage("Querying Base Sepolia smart contract storage...");
    setVerificationResult(null);
    setIsFound(null);

    try {
      const res = await fetch("/api/blockchain/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.record) {
        setVerificationResult(data.record);
        setIsFound(true);
        setStatusMessage("Cryptographic proof verified on Base L2 blockchain!");
      } else {
        setIsFound(false);
        setStatusMessage(data.error || "No matching on-chain record found for this query.");
      }
    } catch (err: any) {
      console.error("Verification query error:", err);
      setIsFound(false);
      setStatusMessage("Failed to connect to Base blockchain node.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-[#0D131F]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Base Blockchain Independent Re-Verifier
            </h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verify the mathematical integrity and immutable timestamp of any facial OSINT discovery.
            This tool directly inspects the <code className="text-cyan-300 font-mono">FaceMediaRegistry.sol</code> smart
            contract on Base L2 (Chain ID 84532) without relying on any centralized server.
          </p>
        </div>

        {/* Input Form */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Paste Canonical Keccak-256 Hash (0x...) or Discovered Post URL..."
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-xs font-mono transition outline-none"
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || !queryInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
          >
            <Search className="w-4 h-4" />
            {isVerifying ? "Verifying On-Chain..." : "Verify On Base"}
          </button>
        </div>

        {/* Quick Sample Queries */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500">Quick Test Samples:</span>
          {sampleQueries.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryInput(s.query);
                handleVerify(s.query);
              }}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 rounded-lg px-2.5 py-1 transition"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Status & Details Card */}
      {isFound === true && verificationResult && (
        <div className="bg-[#0D131F]/90 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Tamper-Proof Verification Confirmed
                </h3>
                <p className="text-xs text-emerald-400 font-medium">{statusMessage}</p>
              </div>
            </div>

            <button
              onClick={() => onOpenCertificate(verificationResult)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 self-start sm:self-auto"
            >
              <Award className="w-4 h-4" />
              View Certificate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Canonical Data Hash (Keccak-256)</span>
                <span className="font-mono text-cyan-400 break-all">{verificationResult.dataHash}</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Biometric Face Fingerprint Hash</span>
                <span className="font-mono text-slate-300 break-all">{verificationResult.faceHash}</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Discovered Post URL</span>
                <a
                  href={verificationResult.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1.5 break-all"
                >
                  <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{verificationResult.postUrl}</span>
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Platform &amp; Author</span>
                  <span className="font-bold text-slate-200">
                    {verificationResult.platform} &bull; {verificationResult.postAuthor}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold">
                  Verified Identity
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">On-Chain Block</span>
                  <span className="font-mono font-bold text-slate-200">#{verificationResult.blockNumber}</span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">Attested Timestamp</span>
                  <span className="font-mono text-slate-300">
                    {new Date(verificationResult.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Verifier Wallet Address</span>
                <span className="font-mono text-slate-400 text-[11px] break-all">
                  {verificationResult.verifier}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Failure / Not Found State */}
      {isFound === false && (
        <div className="bg-[#0D131F]/90 border border-red-500/30 rounded-2xl p-6 text-center text-xs">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Record Not Found On Base Blockchain</h3>
          <p className="text-slate-400 max-w-md mx-auto">{statusMessage}</p>
        </div>
      )}
    </div>
  );
};
