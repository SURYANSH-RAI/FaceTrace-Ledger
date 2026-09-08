export interface FaceLandmark {
  x: number;
  y: number;
}

export interface FaceScanResult {
  faceDetected: boolean;
  confidence: number;
  faceHash: string; // Biometric perceptual / SHA-256 fingerprint
  landmarksCount: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metrics: {
    eyeDistanceRatio: number;
    jawWidthRatio: number;
    symmetryScore: number;
    aspectRatio: number;
    colorDominanceHex: string;
  };
  timestamp: number;
  faceThumbnail?: string; // base64 preview
}

export interface OsintSearchResult {
  id: string;
  platform: 'X (Twitter)' | 'LinkedIn' | 'Instagram' | 'Reddit' | 'GitHub' | 'Web News' | 'Facebook';
  postUrl: string;
  postAuthor: string;
  authorHandle: string;
  authorAvatar?: string;
  postText: string;
  postedAt: string;
  postImage?: string;
  similarityScore: number; // 0 to 100%
  searchEngine: string;
  engagement: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
  verified: boolean;
}

export interface BlockchainAttestationPayload {
  dataHash: string;
  faceHash: string;
  postUrl: string;
  platform: string;
  postAuthor: string;
  metadataURI: string;
}

export interface VerificationRecord {
  dataHash: string;
  faceHash: string;
  postUrl: string;
  platform: string;
  postAuthor: string;
  metadataURI: string;
  verifier: string;
  timestamp: number;
  blockNumber: number;
  isVerified: boolean;
  txHash?: string;
}

export interface BlockchainNetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
}
