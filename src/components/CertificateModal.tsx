"use client";

import React from "react";
import { X, Shield, Award, CheckCircle2, Download, Copy, ExternalLink, Calendar, Cpu } from "lucide-react";
import { VerificationRecord } from "@/lib/types";
import contractConfig from "@/config/contractConfig.json";

interface CertificateModalProps {
  record: VerificationRecord | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractConfig.address;

  const downloadCertificateJson = () => {
    const certData = {
      title: "Base Blockchain Cryptographic Biometric OSINT Certificate",
      issuer: "BaseFace OSINT Protocol",
      network: "Base Sepolia L2 (Chain ID 84532)",
      smartContract: contractAddress,
      record: record,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(certData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Base-Verification-Certificate-${record.dataHash.substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#080C14] border-2 border-blue-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100">
        
        {/* Certificate Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Certificate Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 mb-3 shadow-lg shadow-blue-500/10">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase">
            Certificate of Blockchain Attestation
          </h2>
          <p className="text-xs text-blue-400 font-medium mt-1">
            Base L2 Smart Contract Cryptographic Proof &bull; Immutable &amp; Tamper-Evident
          </p>
        </div>

        {/* Certificate Body */}
        <div className="space-y-4 text-xs">
          
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Canonical Keccak-256 Proof Hash
            </span>
            <div className="font-mono text-cyan-400 text-[11px] break-all select-all bg-[#05080E] p-2 rounded-lg border border-slate-800">
              {record.dataHash}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Attested Entity / Platform</span>
              <span className="font-bold text-slate-200 text-xs block mt-0.5">
                {record.platform} &bull; {record.postAuthor}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Blockchain Network</span>
              <span className="font-bold text-blue-400 text-xs block mt-0.5">
                Base Sepolia L2 (EVM #84532)
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block mb-1">Discovered Social Post URL</span>
            <a
              href={record.postUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 hover:underline flex items-center gap-1.5 break-all text-[11px]"
            >
              <span>{record.postUrl}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Block Height</span>
              <span className="font-mono font-bold text-slate-200">#{record.blockNumber}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Attestation Time</span>
              <span className="font-mono text-slate-300 text-[10px]">
                {new Date(record.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Integrity State</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                VERIFIED
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Smart Contract Registry Address</span>
            <span className="font-mono text-slate-400 text-[10px] break-all">{contractAddress}</span>
          </div>

        </div>

        {/* Certificate Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`https://sepolia.basescan.org/address/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>Inspect On BaseScan Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={downloadCertificateJson}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Download JSON Proof
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
