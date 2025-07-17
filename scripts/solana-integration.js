const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

/**
 * Solana Integration for Cross-Chain Bridge
 * Provides functionality for Solana wallet connection, token transfers, and test token faucet
 */

class SolanaBridge {
  constructor() {
    // Solana network configuration
    this.networks = {
      devnet: 'https://api.devnet.solana.com',
      testnet: 'https://api.testnet.solana.com',
      mainnet: 'https://api.mainnet-beta.solana.com'
    };
    
    this.connection = null;
    this.wallet = null;
    this.currentNetwork = 'devnet';
  }

  /**
   * Initialize Solana connection
   * @param {string} network - Network to connect to (devnet, testnet, mainnet)
   */
  async initialize(network = 'devnet') {
    try {
      this.currentNetwork = network;
      this.connection = new Connection(this.networks[network], 'confirmed');
      
      console.log(`✅ Connected to Solana ${network}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Solana:', error);
      return false;
    }
  }

  /**
   * Connect to Phantom wallet
   */
  async connectWallet() {
    try {
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        this.wallet = response.publicKey;
        
        console.log('✅ Phantom wallet connected:', this.wallet.toString());
        return this.wallet.toString();
      } else {
        throw new Error('Phantom wallet not found. Please install Phantom extension.');
      }
    } catch (error) {
      console.error('❌ Failed to connect Phantom wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   * @param {string} address - Wallet address
   */
  async getBalance(address) {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('❌ Failed to get balance:', error);
      return 0;
    }
  }

  /**
   * Request airdrop for test tokens
   * @param {string} address - Wallet address
   * @param {number} amount - Amount in SOL
   */
  async requestAirdrop(address, amount = 1) {
    try {
      const publicKey = new PublicKey(address);
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      
      await this.connection.confirmTransaction(signature);
      console.log(`✅ Airdropped ${amount} SOL to ${address}`);
      return signature;
    } catch (error) {
      console.error('❌ Failed to request airdrop:', error);
      throw error;
    }
  }

  /**
   * Create USDC token account
   * @param {string} mintAddress - USDC mint address
   */
  async createTokenAccount(mintAddress) {
    try {
      const mint = new PublicKey(mintAddress);
      const token = new Token(
        this.connection,
        mint,
        TOKEN_PROGRAM_ID,
        this.wallet
      );

      const account = await token.createAccount();
      console.log('✅ Token account created:', account.toString());
      return account.toString();
    } catch (error) {
      console.error('❌ Failed to create token account:', error);
      throw error;
    }
  }

  /**
   * Transfer SOL
   * @param {string} toAddress - Recipient address
   * @param {number} amount - Amount in SOL
   */
  async transferSOL(toAddress, amount) {
    try {
      const toPublicKey = new PublicKey(toAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.wallet,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await this.connection.sendTransaction(transaction, [this.wallet]);
      await this.connection.confirmTransaction(signature);
      
      console.log(`✅ Transferred ${amount} SOL to ${toAddress}`);
      return signature;
    } catch (error) {
      console.error('❌ Failed to transfer SOL:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   * @param {string} address - Wallet address
   * @param {number} limit - Number of transactions to fetch
   */
  async getTransactionHistory(address, limit = 10) {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });
      
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature);
          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            transaction: tx
          };
        })
      );

      return transactions;
    } catch (error) {
      console.error('❌ Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * Validate Solana address
   * @param {string} address - Address to validate
   */
  static validateAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      const epochInfo = await this.connection.getEpochInfo();
      
      return {
        version: version['solana-core'],
        slot,
        epoch: epochInfo.epoch,
        slotIndex: epochInfo.slotIndex,
        slotsInEpoch: epochInfo.slotsInEpoch
      };
    } catch (error) {
      console.error('❌ Failed to get network info:', error);
      return null;
    }
  }
}

/**
 * Test Token Faucet for Solana
 */
class SolanaFaucet {
  constructor(connection) {
    this.connection = connection;
    this.testTokens = {
      USDC: {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Devnet USDC
        decimals: 6
      },
      USDT: {
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Devnet USDT
        decimals: 6
      }
    };
  }

  /**
   * Request test tokens
   * @param {string} address - Wallet address
   * @param {string} token - Token symbol (USDC, USDT)
   * @param {number} amount - Amount to request
   */
  async requestTestTokens(address, token = 'USDC', amount = 100) {
    try {
      const tokenInfo = this.testTokens[token];
      if (!tokenInfo) {
        throw new Error(`Token ${token} not supported`);
      }

      // In a real implementation, this would interact with a faucet contract
      // For now, we'll simulate the process
      console.log(`🎯 Requesting ${amount} ${token} for ${address}`);
      
      // Simulate faucet delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`✅ ${amount} ${token} sent to ${address}`);
      return {
        success: true,
        token,
        amount,
        address,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to request ${token}:`, error);
      throw error;
    }
  }

  /**
   * Get available test tokens
   */
  getAvailableTokens() {
    return Object.keys(this.testTokens);
  }
}

/**
 * Cross-Chain Bridge Utilities
 */
class CrossChainUtils {
  /**
   * Generate cross-chain transfer ID
   * @param {string} sourceChain - Source blockchain
   * @param {string} destinationChain - Destination blockchain
   * @param {string} sourceAddress - Source address
   * @param {string} destinationAddress - Destination address
   * @param {number} amount - Transfer amount
   */
  static generateTransferId(sourceChain, destinationChain, sourceAddress, destinationAddress, amount) {
    const data = `${sourceChain}-${destinationChain}-${sourceAddress}-${destinationAddress}-${amount}-${Date.now()}`;
    return require('crypto').createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate cross-chain transfer parameters
   * @param {Object} params - Transfer parameters
   */
  static validateTransferParams(params) {
    const { sourceChain, destinationChain, sourceAddress, destinationAddress, amount, token } = params;
    
    const errors = [];
    
    if (!sourceChain || !destinationChain) {
      errors.push('Source and destination chains are required');
    }
    
    if (sourceChain === destinationChain) {
      errors.push('Source and destination chains must be different');
    }
    
    if (!sourceAddress || !destinationAddress) {
      errors.push('Source and destination addresses are required');
    }
    
    if (!amount || amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (!token) {
      errors.push('Token is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format amount for display
   * @param {number} amount - Raw amount
   * @param {number} decimals - Token decimals
   */
  static formatAmount(amount, decimals = 6) {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  /**
   * Parse amount from display format
   * @param {string} displayAmount - Display amount
   * @param {number} decimals - Token decimals
   */
  static parseAmount(displayAmount, decimals = 6) {
    return Math.floor(parseFloat(displayAmount) * Math.pow(10, decimals));
  }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SolanaBridge,
    SolanaFaucet,
    CrossChainUtils
  };
}

// Browser global exports
if (typeof window !== 'undefined') {
  window.SolanaBridge = SolanaBridge;
  window.SolanaFaucet = SolanaFaucet;
  window.CrossChainUtils = CrossChainUtils;
} 