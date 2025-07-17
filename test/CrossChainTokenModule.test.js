const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainTokenModule", function () {
  let mockHost, tokenModule, mockToken, owner, user1, user2;
  
  const TRANSFER_FEE = ethers.parseEther("0.001");
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const TRANSFER_AMOUNT = ethers.parseEther("100");
  
  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy Mock ISMP Host
    const MockIsmpHost = await ethers.getContractFactory("MockIsmpHost");
    mockHost = await MockIsmpHost.deploy(ethers.toUtf8Bytes("ethereum"));
    
    // Deploy CrossChainTokenModule
    const CrossChainTokenModule = await ethers.getContractFactory("CrossChainTokenModule");
    tokenModule = await CrossChainTokenModule.deploy(await mockHost.getAddress(), TRANSFER_FEE);
    
    // Deploy Mock ERC20 Token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Test Token", "TEST", INITIAL_SUPPLY);
    
    // Transfer some tokens to user1
    await mockToken.transfer(user1.address, ethers.parseEther("1000"));
  });
  
  describe("Deployment", function () {
    it("Should set the correct host address", async function () {
      expect(await tokenModule.host()).to.equal(await mockHost.getAddress());
    });
    
    it("Should set the correct transfer fee", async function () {
      expect(await tokenModule.transferFee()).to.equal(TRANSFER_FEE);
    });
    
    it("Should have the correct module ID", async function () {
      const expectedModuleId = ethers.keccak256(ethers.toUtf8Bytes("CrossChainTokenModule"));
      expect(await tokenModule.moduleId()).to.equal(expectedModuleId);
    });
  });
  
  describe("sendToPolkadot", function () {
    it("Should create a transfer request when sending to Polkadot", async function () {
      const recipient = ethers.toUtf8Bytes(user2.address);
      const destChain = tokenModule.POLKADOT_ROCOCO();
      
      // Approve tokens
      await mockToken.connect(user1).approve(await tokenModule.getAddress(), TRANSFER_AMOUNT);
      
      // Send to Polkadot
      const tx = await tokenModule.connect(user1).sendToPolkadot(
        await mockToken.getAddress(),
        recipient,
        TRANSFER_AMOUNT,
        destChain,
        { value: TRANSFER_FEE }
      );
      
      const receipt = await tx.wait();
      
      // Check that MessageSent event was emitted
      const messageSentEvent = receipt.logs.find(log => {
        try {
          const parsed = tokenModule.interface.parseLog(log);
          return parsed.name === "MessageSent";
        } catch {
          return false;
        }
      });
      
      expect(messageSentEvent).to.not.be.undefined;
      
      // Check that TransferRequestCreated event was emitted
      const transferRequestEvent = receipt.logs.find(log => {
        try {
          const parsed = tokenModule.interface.parseLog(log);
          return parsed.name === "TransferRequestCreated";
        } catch {
          return false;
        }
      });
      
      expect(transferRequestEvent).to.not.be.undefined;
      
      // Check that tokens were transferred to the module
      expect(await mockToken.balanceOf(await tokenModule.getAddress())).to.equal(TRANSFER_AMOUNT);
    });
    
    it("Should revert if insufficient fee is provided", async function () {
      const recipient = ethers.toUtf8Bytes(user2.address);
      const destChain = tokenModule.POLKADOT_ROCOCO();
      
      // Approve tokens
      await mockToken.connect(user1).approve(await tokenModule.getAddress(), TRANSFER_AMOUNT);
      
      // Try to send with insufficient fee
      await expect(
        tokenModule.connect(user1).sendToPolkadot(
          await mockToken.getAddress(),
          recipient,
          TRANSFER_AMOUNT,
          destChain,
          { value: ethers.parseEther("0.0001") }
        )
      ).to.be.revertedWith("CrossChainTokenModule: insufficient fee");
    });
    
    it("Should revert if amount is zero", async function () {
      const recipient = ethers.toUtf8Bytes(user2.address);
      const destChain = tokenModule.POLKADOT_ROCOCO();
      
      await expect(
        tokenModule.connect(user1).sendToPolkadot(
          await mockToken.getAddress(),
          recipient,
          0,
          destChain,
          { value: TRANSFER_FEE }
        )
      ).to.be.revertedWith("CrossChainTokenModule: invalid amount");
    });
    
    it("Should revert if token address is zero", async function () {
      const recipient = ethers.toUtf8Bytes(user2.address);
      const destChain = tokenModule.POLKADOT_ROCOCO();
      
      await expect(
        tokenModule.connect(user1).sendToPolkadot(
          ethers.ZeroAddress,
          recipient,
          TRANSFER_AMOUNT,
          destChain,
          { value: TRANSFER_FEE }
        )
      ).to.be.revertedWith("CrossChainTokenModule: invalid token");
    });
  });
  
  describe("Message Reception", function () {
    it("Should handle incoming transfer from Polkadot", async function () {
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("test-request"));
      const recipient = user2.address;
      const nonce = 1;
      
      // Encode transfer data
      const transferData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "address", "address", "uint256", "uint256"],
        [requestId, await mockToken.getAddress(), recipient, TRANSFER_AMOUNT, nonce]
      );
      
      // Transfer tokens to module first
      await mockToken.transfer(await tokenModule.getAddress(), TRANSFER_AMOUNT);
      
      // Simulate receiving message from Polkadot
      await mockHost.simulateReceive(
        await tokenModule.getAddress(),
        ethers.toUtf8Bytes("polkadot-address"),
        transferData
      );
      
      // Check that tokens were transferred to recipient
      expect(await mockToken.balanceOf(recipient)).to.equal(TRANSFER_AMOUNT);
      
      // Check that request is marked as executed
      const request = await tokenModule.transferRequests(requestId);
      expect(request.executed).to.be.true;
    });
    
    it("Should revert if trying to execute the same request twice", async function () {
      const requestId = ethers.keccak256(ethers.toUtf8Bytes("test-request"));
      const recipient = user2.address;
      const nonce = 1;
      
      // Encode transfer data
      const transferData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "address", "address", "uint256", "uint256"],
        [requestId, await mockToken.getAddress(), recipient, TRANSFER_AMOUNT, nonce]
      );
      
      // Transfer tokens to module first
      await mockToken.transfer(await tokenModule.getAddress(), TRANSFER_AMOUNT);
      
      // Simulate receiving message from Polkadot
      await mockHost.simulateReceive(
        await tokenModule.getAddress(),
        ethers.toUtf8Bytes("polkadot-address"),
        transferData
      );
      
      // Try to execute the same request again
      await expect(
        mockHost.simulateReceive(
          await tokenModule.getAddress(),
          ethers.toUtf8Bytes("polkadot-address"),
          transferData
        )
      ).to.be.revertedWith("CrossChainTokenModule: already executed");
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to set transfer fee", async function () {
      const newFee = ethers.parseEther("0.002");
      await tokenModule.setTransferFee(newFee);
      expect(await tokenModule.transferFee()).to.equal(newFee);
    });
    
    it("Should allow owner to withdraw fees", async function () {
      // Send some ETH to the module
      await user1.sendTransaction({
        to: await tokenModule.getAddress(),
        value: ethers.parseEther("1")
      });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await tokenModule.withdrawFees();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
    
    it("Should allow owner to recover stuck tokens", async function () {
      // Transfer some tokens to the module
      await mockToken.transfer(await tokenModule.getAddress(), TRANSFER_AMOUNT);
      
      const initialBalance = await mockToken.balanceOf(user2.address);
      await tokenModule.emergencyRecover(
        await mockToken.getAddress(),
        user2.address,
        TRANSFER_AMOUNT
      );
      const finalBalance = await mockToken.balanceOf(user2.address);
      
      expect(finalBalance).to.equal(initialBalance + TRANSFER_AMOUNT);
    });
  });
}); 