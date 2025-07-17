const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of Cross-Chain Token Module...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Deploy Mock ISMP Host (for testing)
  console.log("\n📦 Deploying Mock ISMP Host...");
  const MockIsmpHost = await ethers.getContractFactory("MockIsmpHost");
  const mockHost = await MockIsmpHost.deploy(ethers.toUtf8Bytes("ethereum"));
  await mockHost.waitForDeployment();
  console.log("✅ Mock ISMP Host deployed to:", await mockHost.getAddress());
  
  // Deploy CrossChainTokenModule
  console.log("\n📦 Deploying CrossChainTokenModule...");
  const TRANSFER_FEE = ethers.parseEther("0.001"); // 0.001 ETH fee
  const CrossChainTokenModule = await ethers.getContractFactory("CrossChainTokenModule");
  const tokenModule = await CrossChainTokenModule.deploy(await mockHost.getAddress(), TRANSFER_FEE);
  await tokenModule.waitForDeployment();
  console.log("✅ CrossChainTokenModule deployed to:", await tokenModule.getAddress());
  console.log("💰 Transfer fee set to:", ethers.formatEther(TRANSFER_FEE), "ETH");
  
  // Deploy Mock ERC20 Token for testing
  console.log("\n📦 Deploying Mock ERC20 Token...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens
  const mockToken = await MockERC20.deploy("Test Token", "TEST", INITIAL_SUPPLY);
  await mockToken.waitForDeployment();
  console.log("✅ Mock ERC20 Token deployed to:", await mockToken.getAddress());
  console.log("💰 Initial supply:", ethers.formatEther(INITIAL_SUPPLY), "TEST tokens");
  
  // Transfer some tokens to the module for testing
  console.log("\n🔄 Setting up test environment...");
  const testAmount = ethers.parseEther("10000");
  await mockToken.transfer(await tokenModule.getAddress(), testAmount);
  console.log("✅ Transferred", ethers.formatEther(testAmount), "TEST tokens to module for testing");
  
  // Verify contracts on Etherscan (if not on localhost)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) { // Not localhost
    console.log("\n🔍 Waiting for block confirmations before verification...");
    await tokenModule.deploymentTransaction().wait(6);
    
    console.log("\n🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: await mockHost.getAddress(),
        constructorArguments: [ethers.toUtf8Bytes("ethereum")],
      });
      console.log("✅ Mock ISMP Host verified on Etherscan");
    } catch (error) {
      console.log("⚠️  Mock ISMP Host verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: await tokenModule.getAddress(),
        constructorArguments: [await mockHost.getAddress(), TRANSFER_FEE],
      });
      console.log("✅ CrossChainTokenModule verified on Etherscan");
    } catch (error) {
      console.log("⚠️  CrossChainTokenModule verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: await mockToken.getAddress(),
        constructorArguments: ["Test Token", "TEST", INITIAL_SUPPLY],
      });
      console.log("✅ Mock ERC20 Token verified on Etherscan");
    } catch (error) {
      console.log("⚠️  Mock ERC20 Token verification failed:", error.message);
    }
  }
  
  // Print deployment summary
  console.log("\n🎉 Deployment completed successfully!");
  console.log("=".repeat(50));
  console.log("📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("🌐 Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("👤 Deployer:", deployer.address);
  console.log("🏠 Mock ISMP Host:", await mockHost.getAddress());
  console.log("🔄 CrossChainTokenModule:", await tokenModule.getAddress());
  console.log("🪙 Mock ERC20 Token:", await mockToken.getAddress());
  console.log("💰 Transfer Fee:", ethers.formatEther(TRANSFER_FEE), "ETH");
  console.log("=".repeat(50));
  
  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      mockHost: await mockHost.getAddress(),
      tokenModule: await tokenModule.getAddress(),
      mockToken: await mockToken.getAddress(),
    },
    config: {
      transferFee: TRANSFER_FEE.toString(),
      initialSupply: INITIAL_SUPPLY.toString(),
    },
    timestamp: new Date().toISOString(),
  };
  
  const fs = require("fs");
  fs.writeFileSync(
    `deployment-${network.chainId}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployment-" + network.chainId + ".json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 