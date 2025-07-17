import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import Faucet from './components/Faucet';
import TestnetInfo from './components/TestnetInfo';
import HowItWorks from './components/HowItWorks';

// Extend Window interface for Ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: any) => void) => void;
    };
    solflare?: {
      isSolflare?: boolean;
      connect: () => Promise<any>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: any) => void) => void;
      publicKey?: any;
      selectedAddress?: string;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    talisman?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

interface PolkadotAccount {
  address: string;
  meta: {
    name: string;
    source: string;
  };
}

interface TransferRequest {
  id: string;
  token: string;
  recipient: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  sourceChain: string;
  destinationChain: string;
}

function App() {
  const [polkadotApi, setPolkadotApi] = useState<ApiPromise | null>(null);
  const [polkadotAccounts, setPolkadotAccounts] = useState<PolkadotAccount[]>([]);
  const [selectedPolkadotAccount, setSelectedPolkadotAccount] = useState<string>('');
  const [ethereumAddress, setEthereumAddress] = useState<string>('');
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [sourceChain, setSourceChain] = useState<string>('ethereum');
  const [destinationChain, setDestinationChain] = useState<string>('solana');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transferHistory, setTransferHistory] = useState<TransferRequest[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [showFaucet, setShowFaucet] = useState<boolean>(false);
  const [showTestnetInfo, setShowTestnetInfo] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [universalWalletConnected, setUniversalWalletConnected] = useState<boolean>(false);
  const [connectedSolanaWallet, setConnectedSolanaWallet] = useState<string>('');

  // Initialize Polkadot connection
  const initializePolkadot = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      // Wait for crypto to be ready
      await cryptoWaitReady();
      
      // Connect to Polkadot network
      const provider = new WsProvider(getPolkadotEndpoint('rococo'));
      const api = await ApiPromise.create({ provider });
      
      setPolkadotApi(api);
      setConnectionStatus('connected');
      
      console.log('✅ Connected to Polkadot network: rococo');
    } catch (error) {
      console.error('❌ Failed to connect to Polkadot:', error);
      setConnectionStatus('error');
    }
  }, []);

  useEffect(() => {
    initializePolkadot();
  }, [initializePolkadot]);

  const getPolkadotEndpoint = (chain: string): string => {
    switch (chain) {
      case 'rococo':
        return 'wss://rococo-rpc.polkadot.io';
      case 'westend':
        return 'wss://westend-rpc.polkadot.io';
      case 'kusama':
        return 'wss://kusama-rpc.polkadot.io';
      case 'polkadot':
        return 'wss://rpc.polkadot.io';
      default:
        return 'wss://rococo-rpc.polkadot.io';
    }
  };

  const connectPolkadotWallet = async () => {
    try {
      setIsLoading(true);
      
      // Enable Polkadot extension
      await web3Enable('Cross-Chain Token App');
      
      // Get accounts
      const accounts = await web3Accounts();
      
      // Convert to our interface format
      const convertedAccounts: PolkadotAccount[] = accounts.map(account => ({
        address: account.address,
        meta: {
          name: account.meta.name || 'Unknown',
          source: account.meta.source
        }
      }));
      
      setPolkadotAccounts(convertedAccounts);
      
      if (convertedAccounts.length > 0) {
        setSelectedPolkadotAccount(convertedAccounts[0].address);
      }
      
      console.log('✅ Polkadot wallet connected');
    } catch (error) {
      console.error('❌ Failed to connect Polkadot wallet:', error);
      alert('Failed to connect Polkadot wallet. Please install Polkadot.js Extension.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectEthereumWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setEthereumAddress(accounts[0]);
        console.log('✅ Ethereum wallet connected:', accounts[0]);
      } else {
        alert('Please install MetaMask or another Ethereum wallet.');
      }
    } catch (error) {
      console.error('❌ Failed to connect Ethereum wallet:', error);
    }
  };

  const disconnectEthereumWallet = async () => {
    try {
      setEthereumAddress('');
      console.log('✅ Ethereum wallet disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect Ethereum wallet:', error);
    }
  };

  const connectSolanaWallet = async () => {
    try {
      if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
        const response = await window.solana.connect();
        setSolanaAddress(response.publicKey.toString());
        setConnectedSolanaWallet('phantom');
        console.log('✅ Phantom wallet connected:', response.publicKey.toString());
      } else {
        alert('Please install Phantom wallet for Solana.');
      }
    } catch (error) {
      console.error('❌ Failed to connect Phantom wallet:', error);
    }
  };

  const disconnectSolanaWallet = async () => {
    try {
      if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
        await window.solana.disconnect();
        setSolanaAddress('');
        console.log('✅ Phantom wallet disconnected');
      }
    } catch (error) {
      console.error('❌ Failed to disconnect Phantom wallet:', error);
    }
  };

  const connectSolflareWallet = async () => {
    try {
      if (typeof window.solflare !== 'undefined' && window.solflare.isSolflare) {
        const response = await window.solflare.connect();
        
        // Solflare sometimes returns true on successful connection
        // In this case, we need to get the public key from the wallet object
        let publicKey;
        
        if (response === true) {
          // Connection successful, get public key from wallet object
          if (window.solflare.publicKey) {
            publicKey = window.solflare.publicKey.toString();
          } else if (window.solflare.selectedAddress) {
            publicKey = window.solflare.selectedAddress;
          } else {
                         // Try to get the public key using a different method
             try {
               if (window.solflare.request) {
                 const accounts = await window.solflare.request({ method: 'getAccounts' });
                 if (accounts && accounts.length > 0) {
                   publicKey = accounts[0];
                 }
               }
             } catch (e) {
               console.log('Failed to get accounts via request method:', e);
             }
          }
        } else if (response && typeof response === 'object') {
          // Check if response has a publicKey property
          if (response.publicKey) {
            if (typeof response.publicKey === 'string') {
              publicKey = response.publicKey;
            } else if (response.publicKey.toString) {
              publicKey = response.publicKey.toString();
            } else if (response.publicKey.toBase58) {
              publicKey = response.publicKey.toBase58();
            }
          } else if (response.address) {
            // Some versions return address instead of publicKey
            publicKey = response.address;
          } else {
            // Try to get the first property that looks like a public key
            const keys = Object.keys(response);
            const publicKeyKey = keys.find(key => 
              key.toLowerCase().includes('public') || 
              key.toLowerCase().includes('address') ||
              key.toLowerCase().includes('key')
            );
            if (publicKeyKey && response[publicKeyKey]) {
              publicKey = typeof response[publicKeyKey] === 'string' 
                ? response[publicKeyKey] 
                : response[publicKeyKey].toString();
            }
          }
        } else if (typeof response === 'string') {
          // Direct string response
          publicKey = response;
        }
        
        if (!publicKey) {
          console.error('Solflare response structure:', response);
          console.error('Solflare wallet object:', window.solflare);
          throw new Error('Could not extract public key from Solflare response');
        }
        
        setSolanaAddress(publicKey);
        console.log('✅ Solflare wallet connected:', publicKey);
      } else {
        alert('Please install Solflare wallet for Solana. Visit https://solflare.com/');
      }
    } catch (error) {
      console.error('❌ Failed to connect Solflare wallet:', error);
      alert('Failed to connect Solflare wallet. Please make sure it is installed and unlocked.');
    }
  };

  const disconnectSolflareWallet = async () => {
    try {
      if (typeof window.solflare !== 'undefined' && window.solflare.isSolflare) {
        await window.solflare.disconnect();
        setSolanaAddress('');
        console.log('✅ Solflare wallet disconnected');
      }
    } catch (error) {
      console.error('❌ Failed to disconnect Solflare wallet:', error);
    }
  };

  const disconnectPolkadotWallet = async () => {
    try {
      // Clear Polkadot accounts and selected account
      setPolkadotAccounts([]);
      setSelectedPolkadotAccount('');
      console.log('✅ Polkadot wallet disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect Polkadot wallet:', error);
    }
  };

  const connectTalismanWallet = async () => {
    try {
      // Check if Talisman wallet is available
      if (typeof window.talisman !== 'undefined') {
        // Request accounts from Talisman
        const accounts = await window.talisman.request({ method: 'talisman_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const talismanAccounts: PolkadotAccount[] = accounts.map((account: any) => ({
            address: account.address,
            meta: {
              name: account.name || 'Talisman Account',
              source: 'talisman'
            }
          }));
          setPolkadotAccounts(talismanAccounts);
          setSelectedPolkadotAccount(talismanAccounts[0].address);
          console.log('✅ Talisman wallet connected:', talismanAccounts[0].address);
        }
      } else {
        alert('Please install Talisman wallet for Polkadot. Visit https://talisman.xyz/');
      }
    } catch (error) {
      console.error('❌ Failed to connect Talisman wallet:', error);
      alert('Failed to connect Talisman wallet. Please make sure it is installed and unlocked.');
    }
  };

  const connectUniversalWallet = async () => {
    try {
      setIsLoading(true);
      
      // Connect to all chains simultaneously
      const promises = [];
      
      // Connect Ethereum
      if (typeof window.ethereum !== 'undefined') {
        promises.push(
          window.ethereum.request({ method: 'eth_requestAccounts' })
            .then((accounts: string[]) => {
              setEthereumAddress(accounts[0]);
              return { chain: 'ethereum', address: accounts[0] };
            })
        );
      }
      
      // Connect Solana (Phantom or Solflare)
      if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
        promises.push(
          window.solana.connect()
            .then((response: any) => {
              setSolanaAddress(response.publicKey.toString());
              return { chain: 'solana', address: response.publicKey.toString() };
            })
        );
      } else if (typeof window.solflare !== 'undefined' && window.solflare.isSolflare) {
        promises.push(
          window.solflare.connect()
            .then((response: any) => {
              // Handle Solflare response structure
              let publicKey;
              
              if (response === true) {
                // Connection successful, get public key from wallet object
                if (window.solflare?.publicKey) {
                  publicKey = window.solflare.publicKey.toString();
                } else if (window.solflare?.selectedAddress) {
                  publicKey = window.solflare.selectedAddress;
                } else {
                  // Try to get the public key using a different method
                  try {
                    if (window.solflare?.request) {
                      return window.solflare.request({ method: 'getAccounts' })
                        .then((accounts: any) => {
                          if (accounts && accounts.length > 0) {
                            const publicKey = accounts[0];
                            setSolanaAddress(publicKey);
                            return { chain: 'solana', address: publicKey };
                          }
                          return null;
                        });
                    }
                  } catch (e) {
                    console.log('Failed to get accounts via request method:', e);
                  }
                }
              } else if (response && typeof response === 'object') {
                if (response.publicKey) {
                  publicKey = typeof response.publicKey === 'string' 
                    ? response.publicKey 
                    : response.publicKey.toString();
                } else if (response.address) {
                  publicKey = response.address;
                } else {
                  const keys = Object.keys(response);
                  const publicKeyKey = keys.find(key => 
                    key.toLowerCase().includes('public') || 
                    key.toLowerCase().includes('address') ||
                    key.toLowerCase().includes('key')
                  );
                  if (publicKeyKey && response[publicKeyKey]) {
                    publicKey = typeof response[publicKeyKey] === 'string' 
                      ? response[publicKeyKey] 
                      : response[publicKeyKey].toString();
                  }
                }
              } else if (typeof response === 'string') {
                publicKey = response;
              }
              
              if (publicKey) {
                setSolanaAddress(publicKey);
                return { chain: 'solana', address: publicKey };
              }
              return null;
            })
        );
      }
      
      // Connect Polkadot
      promises.push(
        web3Enable('ARTthenticity Bridge')
          .then(() => web3Accounts())
          .then((accounts) => {
            if (accounts.length > 0) {
              const convertedAccounts: PolkadotAccount[] = accounts.map(account => ({
                address: account.address,
                meta: {
                  name: account.meta.name || 'Unknown',
                  source: account.meta.source
                }
              }));
              setPolkadotAccounts(convertedAccounts);
              setSelectedPolkadotAccount(convertedAccounts[0].address);
              return { chain: 'polkadot', address: convertedAccounts[0].address };
            }
            return null;
          })
      );
      
      const results = await Promise.allSettled(promises);
      const successfulConnections = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
      
      if (successfulConnections.length > 0) {
        setUniversalWalletConnected(true);
        console.log('✅ Universal wallet connected to:', successfulConnections.map(c => c.chain).join(', '));
      }
      
    } catch (error) {
      console.error('❌ Failed to connect universal wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendCrossChainTransfer = async () => {
    if (!transferAmount || !transferRecipient) {
      alert('Please fill in all fields.');
      return;
    }

    // Check if source wallet is connected
    if (sourceChain === 'ethereum' && !ethereumAddress) {
      alert('Please connect Ethereum wallet first.');
      return;
    }
    if (sourceChain === 'solana' && !solanaAddress) {
      alert('Please connect Solana wallet first.');
      return;
    }

    let transferRequest: TransferRequest | null = null;

    try {
      setIsLoading(true);

      // Create transfer request
      transferRequest = {
        id: Date.now().toString(),
        token: 'USDC',
        recipient: transferRecipient,
        amount: transferAmount,
        status: 'pending',
        timestamp: new Date(),
        sourceChain,
        destinationChain
      };

      setTransferHistory(prev => [transferRequest!, ...prev]);

      // Simulate cross-chain transfer (in real implementation, this would call the smart contract)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update transfer status
      setTransferHistory(prev => 
        prev.map(req => 
          req.id === transferRequest!.id 
            ? { ...req, status: 'completed' as const }
            : req
        )
      );

      console.log('✅ Cross-chain transfer completed');
      alert('Transfer completed successfully!');
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      
      if (transferRequest) {
        setTransferHistory(prev => 
          prev.map(req => 
            req.id === transferRequest!.id 
              ? { ...req, status: 'failed' as const }
              : req
          )
        );
      }
      
      alert('Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500';
      case 'failed':
        return 'text-red-500';
      case 'pending':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'ethereum':
        return '🔷';
      case 'solana':
        return '☀️';
      case 'polkadot':
        return '🟣';
      default:
        return '🔗';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1 className="main-title">
            <img 
              src="https://avatars.githubusercontent.com/u/221155513?v=4" 
              alt="ARTthenticity Bridge Logo" 
              style={{ 
                width: '80px', 
                height: '80px', 
                marginRight: '15px',
                verticalAlign: 'middle'
              }} 
            />
            ARTthenticity Bridge
          </h1>
          <p className="subtitle">by European Artist Bank</p>
          <div className="chain-indicators">
            <span className="chain-indicator">🔷 Ethereum</span>
            <span className="chain-arrow">→</span>
            <span className="chain-indicator">☀️ Solana</span>
            <span className="chain-arrow">→</span>
            <span className="chain-indicator">🟣 Polkadot</span>
          </div>
          <div className="header-buttons">
            <button 
              onClick={() => setShowFaucet(true)}
              className="faucet-header-btn"
            >
              🎯 Get Test Tokens
            </button>
            <button 
              onClick={() => setShowTestnetInfo(true)}
              className="testnet-info-btn"
            >
              🔗 Testnet Access
            </button>
            <button 
              onClick={() => setShowHowItWorks(true)}
              className="how-it-works-btn"
            >
              📚 How It Works
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Connection Status */}
        <div className="status-card">
          <h2 className="card-title">🔗 Connection Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <div className={`status-dot ${connectionStatus === 'connected' ? 'connected' : connectionStatus === 'connecting' ? 'connecting' : 'disconnected'}`}></div>
              <span>Polkadot (Rococo): {connectionStatus}</span>
            </div>
            <div className="status-item">
              <div className={`status-dot ${ethereumAddress ? 'connected' : 'disconnected'}`}></div>
              <span>Ethereum: {ethereumAddress ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="status-item">
              <div className={`status-dot ${solanaAddress ? 'connected' : 'disconnected'}`}></div>
              <span>Solana: {solanaAddress ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Universal Wallet */}
        <div className="wallet-card">
          <h2 className="card-title">🎨 EAB ArtKey Wallet</h2>
          {!universalWalletConnected ? (
            <div className="universal-wallet-section">
              <p className="wallet-description">
                Connect to all chains at once for seamless cross-chain art transfers
              </p>
              <button
                onClick={connectUniversalWallet}
                disabled={isLoading}
                className="connect-btn universal-btn"
              >
                {isLoading ? '🔄 Connecting...' : '🎨 Connect EAB ArtKey Wallet'}
              </button>
            </div>
          ) : (
            <div className="universal-wallet-info">
              <div className="connected-chains">
                <h3>Connected Chains:</h3>
                <div className="chain-status-grid">
                  <div className="chain-status">
                    <span className="chain-icon">🔷</span>
                    <span className="chain-name">Ethereum</span>
                    <span className={`status ${ethereumAddress ? 'connected' : 'disconnected'}`}>
                      {ethereumAddress ? 'Connected' : 'Not Connected'}
                    </span>
                    {ethereumAddress && (
                      <span className="address">{ethereumAddress.slice(0, 8)}...{ethereumAddress.slice(-8)}</span>
                    )}
                  </div>
                  <div className="chain-status">
                    <span className="chain-icon">☀️</span>
                    <span className="chain-name">Solana</span>
                    <span className={`status ${solanaAddress ? 'connected' : 'disconnected'}`}>
                      {solanaAddress ? 'Connected' : 'Not Connected'}
                    </span>
                    {solanaAddress && (
                      <span className="address">{solanaAddress.slice(0, 8)}...{solanaAddress.slice(-8)}</span>
                    )}
                  </div>
                  <div className="chain-status">
                    <span className="chain-icon">🟣</span>
                    <span className="chain-name">Polkadot</span>
                    <span className={`status ${polkadotAccounts.length > 0 ? 'connected' : 'disconnected'}`}>
                      {polkadotAccounts.length > 0 ? 'Connected' : 'Not Connected'}
                    </span>
                    {polkadotAccounts.length > 0 && (
                      <span className="address">{selectedPolkadotAccount.slice(0, 8)}...{selectedPolkadotAccount.slice(-8)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Individual Wallet Connections (Optional) */}
        <div className="wallet-card">
          <h2 className="card-title">👛 Individual Wallet Connections</h2>
          <div className="wallet-grid">
            {/* Ethereum Wallet */}
            <div className="wallet-section">
              <h3 className="wallet-title">🔷 Ethereum Wallet</h3>
              {!ethereumAddress ? (
                <button
                  onClick={connectEthereumWallet}
                  className="connect-btn ethereum-btn"
                >
                  Connect MetaMask
                </button>
              ) : (
                <div className="wallet-info">
                  <p className="wallet-address">{ethereumAddress.slice(0, 8)}...{ethereumAddress.slice(-8)}</p>
                  <button 
                    onClick={disconnectEthereumWallet}
                    className="disconnect-btn"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* Solana Wallet */}
            <div className="wallet-section">
              <h3 className="wallet-title">☀️ Solana Wallet</h3>
              {!solanaAddress ? (
                <div className="wallet-options">
                  <button
                    onClick={connectSolanaWallet}
                    className="connect-btn solana-btn"
                  >
                    Connect Phantom
                  </button>
                  <button
                    onClick={connectSolflareWallet}
                    className="connect-btn solflare-btn"
                  >
                    Connect Solflare
                  </button>
                </div>
              ) : (
                <div className="wallet-info">
                  <p className="wallet-address">{solanaAddress.slice(0, 8)}...{solanaAddress.slice(-8)}</p>
                  <button 
                    onClick={disconnectSolanaWallet}
                    className="disconnect-btn"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* Polkadot Wallet */}
            <div className="wallet-section">
              <h3 className="wallet-title">🟣 Polkadot Wallet</h3>
              {polkadotAccounts.length === 0 ? (
                <div className="wallet-options">
                  <button
                    onClick={connectPolkadotWallet}
                    disabled={isLoading}
                    className="connect-btn polkadot-btn"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Polkadot.js'}
                  </button>
                  <button
                    onClick={connectTalismanWallet}
                    disabled={isLoading}
                    className="connect-btn talisman-btn"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Talisman'}
                  </button>
                </div>
              ) : (
                <div className="wallet-info">
                  <select
                    value={selectedPolkadotAccount}
                    onChange={(e) => setSelectedPolkadotAccount(e.target.value)}
                    className="account-select"
                  >
                    {polkadotAccounts.map((account) => (
                      <option key={account.address} value={account.address}>
                        {account.meta.name} ({account.address.slice(0, 8)}...{account.address.slice(-8)})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={disconnectPolkadotWallet}
                    className="disconnect-btn"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cross-Chain Transfer */}
        <div className="transfer-card">
          <h2 className="card-title">🔄 Cross-Chain Transfer</h2>
          <div className="hyperbridge-powered">
            <span>Powered by </span>
            <a 
              href="https://polkadotecosystem.com/de/dapps/bridges/hyperbridge/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hyperbridge-link"
            >
              Hyperbridge
            </a>
          </div>
          <div className="transfer-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Source Chain</label>
                <select
                  value={sourceChain}
                  onChange={(e) => setSourceChain(e.target.value)}
                  className="form-select"
                >
                  <option value="ethereum">🔷 Ethereum</option>
                  <option value="solana">☀️ Solana</option>
                  <option value="polkadot">🟣 Polkadot</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Destination Chain</label>
                <select
                  value={destinationChain}
                  onChange={(e) => setDestinationChain(e.target.value)}
                  className="form-select"
                >
                  <option value="solana">☀️ Solana</option>
                  <option value="ethereum">🔷 Ethereum</option>
                  <option value="polkadot">🟣 Polkadot</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (USDC)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="100"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Recipient Address</label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="Enter recipient address"
                  className="form-input"
                />
              </div>
            </div>
            <button
              onClick={sendCrossChainTransfer}
              disabled={isLoading}
              className="transfer-btn"
            >
              {isLoading ? 'Processing...' : 'Send Transfer'}
            </button>
          </div>
        </div>

        {/* Transfer History */}
        <div className="history-card">
          <h2 className="card-title">📋 Transfer History</h2>
          {transferHistory.length === 0 ? (
            <p className="empty-state">No transfers yet.</p>
          ) : (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Token</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transferHistory.map((transfer) => (
                    <tr key={transfer.id}>
                      <td>{transfer.id}</td>
                      <td>{transfer.token}</td>
                      <td>
                        <span className="chain-badge">
                          {getChainIcon(transfer.sourceChain)} {transfer.sourceChain}
                        </span>
                      </td>
                      <td>
                        <span className="chain-badge">
                          {getChainIcon(transfer.destinationChain)} {transfer.destinationChain}
                        </span>
                      </td>
                      <td>{transfer.amount}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td>{transfer.timestamp.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <p className="footer-text">
              Made with ❤️ from European Artist Bank Dev Team
            </p>
          </div>
          <div className="footer-section">
            <p className="footer-text">
              Powered by <a 
                href="https://polkadotecosystem.com/de/dapps/bridges/hyperbridge/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                Hyperbridge
              </a>
            </p>
          </div>
        </div>
      </footer>

      {showFaucet && (
        <Faucet onClose={() => setShowFaucet(false)} />
      )}

      {/* Testnet Info Modal */}
      {showTestnetInfo && (
        <div className="faucet-overlay" onClick={() => setShowTestnetInfo(false)}>
          <div className="faucet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="faucet-header">
              <h2>Testnet Access</h2>
              <button className="close-btn" onClick={() => setShowTestnetInfo(false)}>×</button>
            </div>
            <div className="faucet-content">
              <TestnetInfo />
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="faucet-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="faucet-modal how-it-works-modal" onClick={(e) => e.stopPropagation()}>
            <div className="faucet-header">
              <h2>How It Works</h2>
              <button className="close-btn" onClick={() => setShowHowItWorks(false)}>×</button>
            </div>
            <div className="faucet-content">
              <HowItWorks />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
