"use client";

import React, { useState, useEffect } from "react";
import { Activity, ExternalLink, RefreshCw, Shield, Link as LinkIcon, CheckCircle2, Search, Award } from "lucide-react";
import { VerificationRecord } from "@/lib/types";
import contractConfig from "@/config/contractConfig.json";

interface LedgerExplorerProps {
  onOpenCertificate: (record: VerificationRecord) => void;
}

export const LedgerExplorer: React.FC<LedgerExplorerProps> = ({ onOpenCertificate }) => {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractConfig.address;

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/blockchain/records");
      const data = await res.json();
      if (res.ok && data.success) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error("Failed to fetch ledger:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = records.filter(
    (r) =>
      r.dataHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.postUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.postAuthor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0D131F]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Base Blockchain Attestation Ledger
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live immutable verification records recorded on Base Sepolia Smart Contract
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by hash, URL, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>
          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Contract Quick Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] block">Contract Address</span>
          <a
            href={`https://sepolia.basescan.org/address/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
          >
            <span className="truncate">{contractAddress}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] block">Network &amp; Chain ID</span>
          <span className="font-bold text-slate-200 block mt-0.5">Base Sepolia L2 (84532)</span>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] block">Total Registered Attestations</span>
          <span className="font-mono font-bold text-emerald-400 block mt-0.5">{records.length} Records</span>
        </div>
      </div>

      {/* Table / List View */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Syncing recent blocks from Base L2...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          <p>No records found matching search query.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec, idx) => (
            <div
              key={idx}
              className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition text-xs"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 font-semibold text-[10px] border border-blue-500/20">
                    {rec.platform}
                  </span>
                  <span className="font-bold text-slate-200">{rec.postAuthor}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>Block #{rec.blockNumber}</span>
                  <span>&bull;</span>
                  <span>{new Date(rec.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-8 space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <span className="text-slate-600">Proof:</span>
                    <span className="text-cyan-400 truncate">{rec.dataHash}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                    <span className="text-slate-600">URL:</span>
                    <a
                      href={rec.postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 hover:text-cyan-300 hover:underline truncate"
                    >
                      {rec.postUrl}
                    </a>
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onOpenCertificate(rec)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                  >
                    <Award className="w-3 h-3 text-cyan-400" />
                    Certificate
                  </button>
                  <a
                    href={`https://sepolia.basescan.org/address/${contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition"
                    title="View on BaseScan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
