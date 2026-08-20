const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("LandRegistry", function () {
  let registry;
  let admin;
  let authority;
  let ownerA;
  let buyerB;
  let unauthorized;
  let buyerC;

  const PROPERTY_ID = 1n;
  const PROPERTY_NUMBER = "P001";
  const LOCATION = "Agwar Demo Zone, Uttar Pradesh, India";
  const AREA = 1500n;
  const PROPERTY_TYPE = "Residential";
  const DOC_HASH = ethers.encodeBytes32String("DOC-P001");

  async function registerAndVerify() {
    await registry
      .connect(authority)
      .registerProperty(
        PROPERTY_ID,
        PROPERTY_NUMBER,
        LOCATION,
        AREA,
        PROPERTY_TYPE,
        ownerA.address,
        DOC_HASH
      );

    await registry.connect(authority).verifyProperty(PROPERTY_ID);
  }

  beforeEach(async function () {
    [admin, authority, ownerA, buyerB, unauthorized, buyerC] =
      await ethers.getSigners();

    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    registry = await LandRegistry.deploy();
    await registry.waitForDeployment();

    await registry.connect(admin).addAuthority(authority.address);
  });

  it("deploys with the deployer as admin and authority", async function () {
    expect(await registry.admin()).to.equal(admin.address);
    expect(await registry.authorities(admin.address)).to.equal(true);
  });

  it("allows the authority to register a property", async function () {
    await registry
      .connect(authority)
      .registerProperty(
        PROPERTY_ID,
        PROPERTY_NUMBER,
        LOCATION,
        AREA,
        PROPERTY_TYPE,
        ownerA.address,
        DOC_HASH
      );

    const p = await registry.getProperty(PROPERTY_ID);

    expect(p.propertyId).to.equal(PROPERTY_ID);
    expect(p.propertyNumber).to.equal(PROPERTY_NUMBER);
    expect(p.currentOwner).to.equal(ownerA.address);
    expect(p.documentHash).to.equal(DOC_HASH);
    expect(p.verified).to.equal(false);
    expect(p.status).to.equal(0); // REGISTERED
  });

  it("rejects a duplicate property ID", async function () {
    await registry
      .connect(authority)
      .registerProperty(
        PROPERTY_ID,
        PROPERTY_NUMBER,
        LOCATION,
        AREA,
        PROPERTY_TYPE,
        ownerA.address,
        DOC_HASH
      );

    await expect(
      registry
        .connect(authority)
        .registerProperty(
          PROPERTY_ID,
          "P001-DUPLICATE",
          LOCATION,
          AREA,
          PROPERTY_TYPE,
          ownerA.address,
          DOC_HASH
        )
    ).to.be.revertedWith("Property ID already exists");
  });

  it("rejects a zero owner", async function () {
    await expect(
      registry
        .connect(authority)
        .registerProperty(
          PROPERTY_ID,
          PROPERTY_NUMBER,
          LOCATION,
          AREA,
          PROPERTY_TYPE,
          ethers.ZeroAddress,
          DOC_HASH
        )
    ).to.be.revertedWith("Owner cannot be zero address");
  });

  it("rejects unauthorized registration", async function () {
    await expect(
      registry
        .connect(unauthorized)
        .registerProperty(
          PROPERTY_ID,
          PROPERTY_NUMBER,
          LOCATION,
          AREA,
          PROPERTY_TYPE,
          ownerA.address,
          DOC_HASH
        )
    ).to.be.revertedWith("Only authority");
  });

  it("allows an authority to verify a registered property", async function () {
    await registry
      .connect(authority)
      .registerProperty(
        PROPERTY_ID,
        PROPERTY_NUMBER,
        LOCATION,
        AREA,
        PROPERTY_TYPE,
        ownerA.address,
        DOC_HASH
      );

    await expect(
      registry.connect(authority).verifyProperty(PROPERTY_ID)
    )
      .to.emit(registry, "PropertyVerified")
      .withArgs(PROPERTY_ID, authority.address, anyValue);

    const p = await registry.getProperty(PROPERTY_ID);
    expect(p.verified).to.equal(true);
    expect(p.status).to.equal(1); // VERIFIED
  });

  it("rejects unauthorized verification", async function () {
    await registry
      .connect(authority)
      .registerProperty(
        PROPERTY_ID,
        PROPERTY_NUMBER,
        LOCATION,
        AREA,
        PROPERTY_TYPE,
        ownerA.address,
        DOC_HASH
      );

    await expect(
      registry.connect(unauthorized).verifyProperty(PROPERTY_ID)
    ).to.be.revertedWith("Only authority");
  });

  it("rejects transfer of an unverified property", async function () {
    await registry
      .connect(authority)
      .registerProperty(
        PROPERTY_ID,
        PROPERTY_NUMBER,
        LOCATION,
        AREA,
        PROPERTY_TYPE,
        ownerA.address,
        DOC_HASH
      );

    await expect(
      registry.connect(ownerA).transferOwnership(PROPERTY_ID, buyerB.address)
    ).to.be.revertedWith("Property must be verified");
  });

  it("allows the current owner to transfer verified property", async function () {
    await registerAndVerify();

    await expect(
      registry
        .connect(ownerA)
        .transferOwnership(PROPERTY_ID, buyerB.address)
    )
      .to.emit(registry, "OwnershipTransferred")
      .withArgs(PROPERTY_ID, ownerA.address, buyerB.address, anyValue);

    const p = await registry.getProperty(PROPERTY_ID);
    expect(p.currentOwner).to.equal(buyerB.address);
    expect(p.previousOwner).to.equal(ownerA.address);
    expect(p.status).to.equal(3); // TRANSFERRED
    expect(p.lastTransferredAt).to.be.greaterThan(0);
  });

  it("rejects transfer by a non-owner", async function () {
    await registerAndVerify();

    await expect(
      registry
        .connect(unauthorized)
        .transferOwnership(PROPERTY_ID, buyerB.address)
    ).to.be.revertedWith("Caller is not current owner");
  });

  it("rejects a zero new owner", async function () {
    await registerAndVerify();

    await expect(
      registry
        .connect(ownerA)
        .transferOwnership(PROPERTY_ID, ethers.ZeroAddress)
    ).to.be.revertedWith("New owner cannot be zero address");
  });

  it("prevents the old owner from transferring again", async function () {
    await registerAndVerify();

    await registry
      .connect(ownerA)
      .transferOwnership(PROPERTY_ID, buyerB.address);

    await expect(
      registry
        .connect(ownerA)
        .transferOwnership(PROPERTY_ID, buyerC.address)
    ).to.be.revertedWith("Caller is not current owner");
  });

  it("allows the new owner to transfer again", async function () {
    await registerAndVerify();

    await registry
      .connect(ownerA)
      .transferOwnership(PROPERTY_ID, buyerB.address);

    await registry
      .connect(buyerB)
      .transferOwnership(PROPERTY_ID, buyerC.address);

    const p = await registry.getProperty(PROPERTY_ID);
    expect(p.currentOwner).to.equal(buyerC.address);
    expect(p.previousOwner).to.equal(buyerB.address);
  });

  it("rejects an invalid property ID", async function () {
    await expect(
      registry.connect(authority).verifyProperty(999)
    ).to.be.revertedWith("Property does not exist");

    await expect(
      registry.connect(unauthorized).getProperty(999)
    ).to.be.revertedWith("Property does not exist");
  });

  it("stores the initial owner in the owner property list", async function () {
    await registerAndVerify();

    const ids = await registry.getPropertiesByOwner(ownerA.address);
    expect(ids).to.deep.equal([PROPERTY_ID]);
  });

  it("moves the active property from old owner to new owner", async function () {
    await registerAndVerify();

    await registry
      .connect(ownerA)
      .transferOwnership(PROPERTY_ID, buyerB.address);

    const oldOwnerIds = await registry.getPropertiesByOwner(ownerA.address);
    const newOwnerIds = await registry.getPropertiesByOwner(buyerB.address);

    expect(oldOwnerIds).to.deep.equal([]);
    expect(newOwnerIds).to.deep.equal([PROPERTY_ID]);
  });

  it("preserves the document hash", async function () {
    await registerAndVerify();

    const p = await registry.getProperty(PROPERTY_ID);
    expect(p.documentHash).to.equal(DOC_HASH);
  });

  it("tracks complete ownership history", async function () {
    await registerAndVerify();

    await registry
      .connect(ownerA)
      .transferOwnership(PROPERTY_ID, buyerB.address);

    await registry
      .connect(buyerB)
      .transferOwnership(PROPERTY_ID, buyerC.address);

    const history = await registry.getOwnershipHistory(PROPERTY_ID);

    expect(history).to.deep.equal([
      ownerA.address,
      buyerB.address,
      buyerC.address,
    ]);
  });

  it("allows authority to mark a property disputed and blocks transfer", async function () {
    await registerAndVerify();

    await registry
      .connect(authority)
      .updatePropertyStatus(PROPERTY_ID, 4); // DISPUTED

    const p = await registry.getProperty(PROPERTY_ID);
    expect(p.status).to.equal(4);

    await expect(
      registry.connect(ownerA).transferOwnership(PROPERTY_ID, buyerB.address)
    ).to.be.revertedWith("Property cannot be transferred");
  });

  it("allows a verified authority-controlled record to be restored to VERIFIED", async function () {
    await registerAndVerify();

    await registry
      .connect(authority)
      .updatePropertyStatus(PROPERTY_ID, 4); // DISPUTED

    await registry
      .connect(authority)
      .updatePropertyStatus(PROPERTY_ID, 1); // VERIFIED

    const p = await registry.getProperty(PROPERTY_ID);
    expect(p.status).to.equal(1);
  });

  it("emits PropertyRegistered", async function () {
    await expect(
      registry
        .connect(authority)
        .registerProperty(
          PROPERTY_ID,
          PROPERTY_NUMBER,
          LOCATION,
          AREA,
          PROPERTY_TYPE,
          ownerA.address,
          DOC_HASH
        )
    )
      .to.emit(registry, "PropertyRegistered")
      .withArgs(
        PROPERTY_ID,
        PROPERTY_NUMBER,
        ownerA.address,
        DOC_HASH,
        anyValue
      );
  });
});

