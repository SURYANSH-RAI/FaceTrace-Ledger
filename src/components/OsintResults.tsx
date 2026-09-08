"use client";

import React, { useState } from "react";
import { Search, ExternalLink, Globe, ShieldCheck, Twitter, Linkedin, Instagram, Github, MessageSquare, Heart, Share2, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { OsintSearchResult, FaceScanResult } from "@/lib/types";

interface OsintResultsProps {
  scanResult: FaceScanResult | null;
  results: OsintSearchResult[];
  isSearching: boolean;
  selectedPost: OsintSearchResult | null;
  onSelectPost: (post: OsintSearchResult) => void;
  onRunSearch: (keyword?: string) => void;
}

export const OsintResults: React.FC<OsintResultsProps> = ({
  scanResult,
  results,
  isSearching,
  selectedPost,
  onSelectPost,
  onRunSearch,
}) => {
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const filteredResults = results.filter((item) => {
    if (filterPlatform === "all") return true;
    return item.platform.toLowerCase().includes(filterPlatform.toLowerCase());
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "X (Twitter)":
        return <Twitter className="w-4 h-4 text-cyan-400" />;
      case "LinkedIn":
        return <Linkedin className="w-4 h-4 text-blue-400" />;
      case "Instagram":
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case "GitHub":
        return <Github className="w-4 h-4 text-purple-400" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-[#0D131F]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              2
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              OSINT Web &amp; Social Media Search
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual reverse lookup &amp; cross-platform post discovery matching the biometric profile.
          </p>
        </div>

        {/* Search / Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter or add keyword..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRunSearch(searchKeyword);
              }}
              className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
            />
          </div>
          <button
            onClick={() => onRunSearch(searchKeyword)}
            disabled={isSearching || !scanResult}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Search className="w-3.5 h-3.5" />
            {isSearching ? "Searching..." : "Re-Scan"}
          </button>
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {["all", "x (twitter)", "linkedin", "instagram", "github", "reddit"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterPlatform(cat)}
            className={`px-3 py-1 rounded-lg text-xs capitalize whitespace-nowrap transition ${
              filterPlatform === cat
                ? "bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Searching State */}
      {isSearching && (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-ping" />
            <div className="w-full h-full rounded-full border-2 border-t-cyan-400 border-r-blue-500 border-b-transparent border-l-transparent animate-spin flex items-center justify-center">
              <Search className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-200">Executing Deep OSINT Multi-Platform Search</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Querying visual indexing nodes, reverse image graphs, and verified social media networks...
          </p>
        </div>
      )}

      {/* Empty / Initial State */}
      {!isSearching && results.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-center text-slate-500">
          <Search className="w-10 h-10 mb-2 opacity-20 text-cyan-400" />
          <p className="text-sm font-medium">No OSINT search results available yet.</p>
          <p className="text-xs text-slate-600 mt-1 max-w-xs">
            Complete Step 1 (Face Scan) above to trigger autonomous cross-platform matching.
          </p>
        </div>
      )}

      {/* Discovered Posts List */}
      {!isSearching && filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map((post) => {
            const isSelected = selectedPost?.id === post.id;
            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-950/40 border-cyan-400/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                <div>
                  {/* Card Header: Platform + Confidence */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                        {getPlatformIcon(post.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200">{post.postAuthor}</span>
                          {post.verified && (
                            <CheckCircle2 className="w-3 h-3 text-blue-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{post.authorHandle}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono font-semibold border border-cyan-500/20">
                        {post.similarityScore}% Match
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{post.postedAt}</span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                    {post.postText}
                  </p>
                </div>

                {/* Card Footer: Metrics & Selection Trigger */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 hover:text-pink-400 transition">
                      <Heart className="w-3 h-3" />
                      {post.engagement.likes}
                    </span>
                    <span className="flex items-center gap-1 hover:text-cyan-400 transition">
                      <Share2 className="w-3 h-3" />
                      {post.engagement.shares}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-slate-400 hover:text-cyan-400 transition"
                      title="Open Original Post"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPost(post);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {isSelected ? "Selected for Base L2" : "Select Post"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
