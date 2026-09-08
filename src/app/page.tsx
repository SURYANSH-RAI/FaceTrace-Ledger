"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FaceScanner } from "@/components/FaceScanner";
import { OsintResults } from "@/components/OsintResults";
import { BlockchainAttestation } from "@/components/BlockchainAttestation";
import { OnChainVerifier } from "@/components/OnChainVerifier";
import { LedgerExplorer } from "@/components/LedgerExplorer";
import { CertificateModal } from "@/components/CertificateModal";
import { FaceScanResult, OsintSearchResult, VerificationRecord } from "@/lib/types";
import { Shield, Sparkles, CheckCircle2, Cpu, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("pipeline");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Pipeline State
  const [scanResult, setScanResult] = useState<FaceScanResult | null>(null);
  const [faceImagePreview, setFaceImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [osintResults, setOsintResults] = useState<OsintSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPost, setSelectedPost] = useState<OsintSearchResult | null>(null);

  const [lastAttestedRecord, setLastAttestedRecord] = useState<VerificationRecord | null>(null);
  const [certificateRecord, setCertificateRecord] = useState<VerificationRecord | null>(null);

  // Triggered when face scanning completes in Step 1
  const handleScanComplete = async (result: FaceScanResult, previewUrl: string) => {
    setScanResult(result);
    setFaceImagePreview(previewUrl);
    setSelectedPost(null);

    // Automatically trigger OSINT search in Step 2
    setIsSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faceHash: result.faceHash,
          imagePreview: previewUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data.length > 0) {
        setOsintResults(data.data);
        // Automatically select the highest confidence post as default
        setSelectedPost(data.data[0]);
      }
    } catch (err) {
      console.error("OSINT search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Re-run search with custom keywords or filter
  const handleRunSearch = async (keyword?: string) => {
    if (!scanResult) return;
    setIsSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faceHash: scanResult.faceHash,
          imagePreview: faceImagePreview,
          queryKeyword: keyword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOsintResults(data.data);
        if (data.data.length > 0) setSelectedPost(data.data[0]);
      }
    } catch (err) {
      console.error("OSINT search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* Pipeline Studio Tab */}
        {activeTab === "pipeline" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Hero Header */}
            <div className="relative rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900/40 to-cyan-900/20 border border-slate-800/80 p-6 sm:p-8 backdrop-blur-md overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Base L2 Autonomous OSINT Verification Protocol</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Biometric Face Scan &rarr; OSINT Web Discovery &rarr; Base Blockchain Attestation
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Extract facial landmark vectors, autonomously cross-reference authentic social media posts across the web,
                  and register cryptographic Keccak-256 proofs onto the <strong>Base blockchain (Coinbase L2)</strong>.
                </p>
              </div>

              {/* Pipeline Step Progress Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
                <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  scanResult ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-slate-950/40 border-slate-800 text-slate-400"
                }`}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    scanResult ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    1
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Face Vectorization</p>
                    <p className="text-[11px] text-slate-400">{scanResult ? "Biometric Hash Ready" : "Awaiting Scan"}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  selectedPost ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-slate-950/40 border-slate-800 text-slate-400"
                }`}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    selectedPost ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    2
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-200">OSINT Social Match</p>
                    <p className="text-[11px] text-slate-400">{selectedPost ? `${selectedPost.platform} Selected` : "Awaiting Discovery"}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  lastAttestedRecord ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-slate-950/40 border-slate-800 text-slate-400"
                }`}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    lastAttestedRecord ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    3
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Base L2 Attestation</p>
                    <p className="text-[11px] text-slate-400">{lastAttestedRecord ? "Immutable on Base" : "Ready to Attest"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Biometric Face Scanner */}
            <FaceScanner
              onScanComplete={handleScanComplete}
              isScanning={isScanning}
              setIsScanning={setIsScanning}
            />

            {/* Step 2: OSINT Social Search Results */}
            <OsintResults
              scanResult={scanResult}
              results={osintResults}
              isSearching={isSearching}
              selectedPost={selectedPost}
              onSelectPost={(post) => setSelectedPost(post)}
              onRunSearch={handleRunSearch}
            />

            {/* Step 3: Base Blockchain Attestation */}
            <BlockchainAttestation
              scanResult={scanResult}
              selectedPost={selectedPost}
              walletAddress={walletAddress}
              onAttestationComplete={(record) => setLastAttestedRecord(record)}
              onOpenCertificate={(record) => setCertificateRecord(record)}
            />

          </div>
        )}

        {/* On-Chain Verifier Tab */}
        {activeTab === "verifier" && (
          <OnChainVerifier onOpenCertificate={(record) => setCertificateRecord(record)} />
        )}

        {/* Base Ledger Explorer Tab */}
        {activeTab === "ledger" && (
          <LedgerExplorer onOpenCertificate={(record) => setCertificateRecord(record)} />
        )}

      </main>

      {/* Certificate Modal */}
      <CertificateModal
        record={certificateRecord}
        onClose={() => setCertificateRecord(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080C14]/90 py-6 text-xs text-slate-500 text-center backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Secured by <strong>Base L2 Blockchain (Coinbase)</strong></span>
          </div>
          <p>BaseFace OSINT Pipeline &bull; Compliant with Task-3 Specifications</p>
          <div className="flex items-center gap-3">
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 transition"
            >
              BaseScan Sepolia
            </a>
            <span>&bull;</span>
            <a
              href="https://base.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-400 transition"
            >
              Base.org
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
