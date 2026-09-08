// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FaceMediaRegistry
 * @dev Decentralized Registry on Base Blockchain for Attesting and Verifying
 * Facial OSINT Discovered Media & Social Posts.
 */
contract FaceMediaRegistry {
    struct VerificationRecord {
        bytes32 dataHash;
        string faceHash;
        string postUrl;
        string platform;
        string postAuthor;
        string metadataURI;
        address verifier;
        uint256 timestamp;
        uint256 blockNumber;
        bool isVerified;
    }

    // Mapping from canonical dataHash to verification record
    mapping(bytes32 => VerificationRecord) private _records;
    
    // Mapping from post URL to dataHash for reverse lookups
    mapping(string => bytes32) private _urlToHash;
    
    // Mapping from faceHash to array of dataHashes
    mapping(string => bytes32[]) private _faceToHashes;

    // Array of all recorded data hashes for enumeration
    bytes32[] private _allHashes;

    // Events
    event MediaAttested(
        bytes32 indexed dataHash,
        string indexed faceHash,
        string postUrl,
        string platform,
        address indexed verifier,
        uint256 timestamp,
        uint256 blockNumber
    );

    /**
     * @notice Attest and permanently store a face-to-post verification on Base
     * @param dataHash Canonical keccak256 hash of the verification payload
     * @param faceHash Biometric fingerprint / perceptual vector hash
     * @param postUrl URL of the discovered web / social media post
     * @param platform Platform name (e.g. X/Twitter, LinkedIn, Instagram, Reddit)
     * @param postAuthor Discovered author / username
     * @param metadataURI Off-chain metadata URI (IPFS / Data URI)
     */
    function recordVerification(
        bytes32 dataHash,
        string calldata faceHash,
        string calldata postUrl,
        string calldata platform,
        string calldata postAuthor,
        string calldata metadataURI
    ) external returns (bool) {
        require(dataHash != bytes32(0), "Invalid data hash");
        require(bytes(faceHash).length > 0, "Face hash required");
        require(bytes(postUrl).length > 0, "Post URL required");
        require(!_records[dataHash].isVerified, "Record already exists on-chain");

        VerificationRecord memory newRecord = VerificationRecord({
            dataHash: dataHash,
            faceHash: faceHash,
            postUrl: postUrl,
            platform: platform,
            postAuthor: postAuthor,
            metadataURI: metadataURI,
            verifier: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            isVerified: true
        });

        _records[dataHash] = newRecord;
        _urlToHash[postUrl] = dataHash;
        _faceToHashes[faceHash].push(dataHash);
        _allHashes.push(dataHash);

        emit MediaAttested(
            dataHash,
            faceHash,
            postUrl,
            platform,
            msg.sender,
            block.timestamp,
            block.number
        );

        return true;
    }

    /**
     * @notice Re-verify an attestation against the Base blockchain
     * @param dataHash The hash to query
     */
    function verifyRecord(bytes32 dataHash) external view returns (VerificationRecord memory) {
        require(_records[dataHash].isVerified, "Record not found on Base blockchain");
        return _records[dataHash];
    }

    /**
     * @notice Look up verification record by original post URL
     */
    function getRecordByUrl(string calldata postUrl) external view returns (VerificationRecord memory) {
        bytes32 dataHash = _urlToHash[postUrl];
        require(dataHash != bytes32(0), "URL not found on Base blockchain");
        return _records[dataHash];
    }

    /**
     * @notice Get all records associated with a specific face fingerprint
     */
    function getRecordsByFace(string calldata faceHash) external view returns (VerificationRecord[] memory) {
        bytes32[] memory hashes = _faceToHashes[faceHash];
        VerificationRecord[] memory records = new VerificationRecord[](hashes.length);
        for (uint256 i = 0; i < hashes.length; i++) {
            records[i] = _records[hashes[i]];
        }
        return records;
    }

    /**
     * @notice Get total count of verified records on Base
     */
    function totalVerifications() external view returns (uint256) {
        return _allHashes.length;
    }

    /**
     * @notice Get recent verification records with pagination
     */
    function getRecentRecords(uint256 limit) external view returns (VerificationRecord[] memory) {
        uint256 total = _allHashes.length;
        if (total == 0) {
            return new VerificationRecord[](0);
        }

        uint256 count = limit > total ? total : limit;
        VerificationRecord[] memory recent = new VerificationRecord[](count);

        for (uint256 i = 0; i < count; i++) {
            bytes32 currentHash = _allHashes[total - 1 - i];
            recent[i] = _records[currentHash];
        }

        return recent;
    }
}
