const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FaceMediaRegistry Smart Contract on Base", function () {
  let registry;
  let owner;
  let verifierUser;

  beforeEach(async function () {
    [owner, verifierUser] = await ethers.getSigners();
    const FaceMediaRegistry = await ethers.getContractFactory("FaceMediaRegistry");
    registry = await FaceMediaRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("Should record and re-verify a facial OSINT discovery record", async function () {
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("test-dataset-payload-001"));
    const faceHash = "b84f37ab290c5f24ecb94";
    const postUrl = "https://x.com/tech_insider/status/189283749281729";
    const platform = "X (Twitter)";
    const postAuthor = "@tech_insider";
    const metadataURI = "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

    const tx = await registry.connect(verifierUser).recordVerification(
      dataHash,
      faceHash,
      postUrl,
      platform,
      postAuthor,
      metadataURI
    );
    await tx.wait();

    // Verify record retrieval by dataHash
    const record = await registry.verifyRecord(dataHash);
    expect(record.dataHash).to.equal(dataHash);
    expect(record.faceHash).to.equal(faceHash);
    expect(record.postUrl).to.equal(postUrl);
    expect(record.platform).to.equal(platform);
    expect(record.postAuthor).to.equal(postAuthor);
    expect(record.verifier).to.equal(verifierUser.address);
    expect(record.isVerified).to.be.true;

    // Verify record retrieval by URL
    const urlRecord = await registry.getRecordByUrl(postUrl);
    expect(urlRecord.dataHash).to.equal(dataHash);

    // Verify total count
    expect(await registry.totalVerifications()).to.equal(1n);
  });

  it("Should reject duplicate dataHash records to maintain tamper-proof integrity", async function () {
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes("unique-sample-hash"));
    await registry.recordVerification(
      dataHash,
      "face123",
      "https://instagram.com/p/Cxyz123",
      "Instagram",
      "insta_creator",
      "uri_data"
    );

    await expect(
      registry.recordVerification(
        dataHash,
        "face123",
        "https://instagram.com/p/Cxyz123",
        "Instagram",
        "insta_creator",
        "uri_data"
      )
    ).to.be.revertedWith("Record already exists on-chain");
  });
});
