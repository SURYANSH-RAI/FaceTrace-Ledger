"use client";

import React, { useState, useEffect } from "react";
import { Shield, ExternalLink, Copy, CheckCircle2, Wallet, Cpu, Activity } from "lucide-react";
import contractConfig from "@/config/contractConfig.json";
import { switchToBaseSepolia } from "@/lib/blockchain";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletAddress: string | null;
  setWalletAddress: (addr: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  walletAddress,
  setWalletAddress,
}) => {
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || contractConfig.address;

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        setIsConnecting(true);
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          await switchToBaseSepolia((window as any).ethereum);
        }
      } catch (err) {
        console.error("User rejected wallet connection:", err);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("No Web3 wallet detected. Please install MetaMask or Coinbase Wallet to interact with Base L2.");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080C14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("pipeline")}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20">
              <div className="h-full w-full bg-[#080C14] rounded-[10px] flex items-center justify-center">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  Base<span className="text-blue-500">Face</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  OSINT v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Biometric &amp; Base Blockchain Verifier</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "pipeline"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Pipeline Studio
            </button>
            <button
              onClick={() => setActiveTab("verifier")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "verifier"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              On-Chain Verifier
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "ledger"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Base Ledger
            </button>
          </nav>

          {/* Network & Wallet Section */}
          <div className="flex items-center gap-3">
            {/* Base Network Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="font-semibold">Base Sepolia</span>
              <span className="text-slate-500 text-[10px]">#84532</span>
            </div>

            {/* Smart Contract Quick Link */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-400">
              <span className="text-[11px] text-slate-500">Contract:</span>
              <span className="font-mono text-[11px] text-slate-300">
                {contractAddress.substring(0, 6)}...{contractAddress.substring(contractAddress.length - 4)}
              </span>
              <button
                onClick={handleCopy}
                className="hover:text-cyan-400 transition"
                title="Copy Contract Address"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`https://sepolia.basescan.org/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition"
                title="View on BaseScan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Wallet Connect Button */}
            {walletAddress ? (
              <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/40 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-xs font-medium text-white shadow-lg shadow-blue-600/25"
              >
                <Wallet className="w-3.5 h-3.5" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
