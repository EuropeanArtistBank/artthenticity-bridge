import React, { useState } from 'react';

interface FaucetProps {
  onClose: () => void;
}

const Faucet: React.FC<FaucetProps> = ({ onClose }) => {
  const [selectedChain, setSelectedChain] = useState('solana');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [amount, setAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const faucetOptions = {
    solana: {
      name: 'Solana',
      icon: '☀️',
      tokens: ['USDC', 'USDT', 'SOL'],
      faucetUrl: 'https://solfaucet.com/',
      description: 'Get test tokens for Solana Devnet'
    },
    ethereum: {
      name: 'Ethereum',
      icon: '🔷',
      tokens: ['ETH', 'USDC', 'USDT'],
      faucetUrl: 'https://sepoliafaucet.com/',
      description: 'Get test tokens for Ethereum Sepolia'
    },
    polkadot: {
      name: 'Polkadot',
      icon: '🟣',
      tokens: ['DOT', 'KSM'],
      faucetUrl: 'https://faucet.parity.io/',
      description: 'Get test tokens for Polkadot Rococo'
    }
  };

  const handleRequestTokens = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Simulate faucet request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(`✅ Successfully requested ${amount} ${selectedToken} on ${faucetOptions[selectedChain as keyof typeof faucetOptions].name}`);
    } catch (error) {
      setMessage('❌ Failed to request tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openFaucetUrl = () => {
    const url = faucetOptions[selectedChain as keyof typeof faucetOptions].faucetUrl;
    window.open(url, '_blank');
  };

  return (
    <div className="faucet-overlay">
      <div className="faucet-modal">
        <div className="faucet-header">
          <h2>🎯 Test Token Faucet</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="faucet-content">
          <div className="faucet-section">
            <label className="faucet-label">Select Chain</label>
            <div className="chain-options">
              {Object.entries(faucetOptions).map(([key, option]) => (
                <button
                  key={key}
                  onClick={() => setSelectedChain(key)}
                  className={`chain-option ${selectedChain === key ? 'active' : ''}`}
                >
                  <span className="chain-icon">{option.icon}</span>
                  <span className="chain-name">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="faucet-section">
            <label className="faucet-label">Select Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="faucet-select"
            >
              {faucetOptions[selectedChain as keyof typeof faucetOptions].tokens.map(token => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>

          <div className="faucet-section">
            <label className="faucet-label">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="faucet-input"
              placeholder="100"
              min="1"
            />
          </div>

          <div className="faucet-description">
            <p>{faucetOptions[selectedChain as keyof typeof faucetOptions].description}</p>
          </div>

          {message && (
            <div className={`faucet-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="faucet-actions">
            <button
              onClick={handleRequestTokens}
              disabled={isLoading}
              className="faucet-btn primary"
            >
              {isLoading ? 'Requesting...' : 'Request Tokens'}
            </button>
            <button
              onClick={openFaucetUrl}
              className="faucet-btn secondary"
            >
              Open Faucet Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faucet; 