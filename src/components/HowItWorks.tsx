import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <div className="how-it-works-card">
      <h2 className="card-title">📚 How It Works</h2>
      
      <div className="explanation-grid">
        {/* What is this? */}
        <div className="explanation-section">
          <h3 className="explanation-title">🎨 What is ARTthenticity Bridge?</h3>
          <p className="explanation-text">
            ARTthenticity Bridge is a cross-chain bridge that allows artists and collectors to transfer 
            digital assets (tokens, NFTs) between different blockchain networks: Ethereum, Solana, and Polkadot.
          </p>
        </div>

        {/* Why three wallets? */}
        <div className="explanation-section">
          <h3 className="explanation-title">👛 Why do we need three wallets?</h3>
          <p className="explanation-text">
            Each blockchain has its own wallet technology:
          </p>
          <ul className="explanation-list">
            <li><strong>Ethereum:</strong> MetaMask, WalletConnect</li>
            <li><strong>Solana:</strong> Phantom, Solflare</li>
            <li><strong>Polkadot:</strong> Polkadot.js, Talisman</li>
          </ul>
          <p className="explanation-text">
            Our <strong>Universal Wallet</strong> connects to all three at once!
          </p>
        </div>

        {/* How cross-chain works */}
        <div className="explanation-section">
          <h3 className="explanation-title">🌉 How does cross-chain transfer work?</h3>
          <p className="explanation-text">
            When you transfer from Chain A to Chain B:
          </p>
          <ol className="explanation-list">
            <li>Your tokens are <strong>locked</strong> on Chain A</li>
            <li>A <strong>message</strong> is sent to Chain B via Hyperbridge</li>
            <li>Equivalent tokens are <strong>minted</strong> on Chain B</li>
            <li>Recipient receives the tokens on Chain B</li>
          </ol>
        </div>

        {/* Hyperbridge */}
        <div className="explanation-section">
          <h3 className="explanation-title">🔗 What is Hyperbridge?</h3>
          <p className="explanation-text">
            Hyperbridge is a decentralized bridge protocol that enables secure cross-chain communication 
            using the ISMP (Inter-System Message Passing) protocol. It allows different blockchains to 
            communicate and transfer assets securely.
          </p>
          <a 
            href="https://polkadotecosystem.com/de/dapps/bridges/hyperbridge/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="learn-more-link"
          >
            Learn more about Hyperbridge →
          </a>
        </div>

        {/* Testnets */}
        <div className="explanation-section">
          <h3 className="explanation-title">🧪 Why use testnets?</h3>
          <p className="explanation-text">
            Testnets are safe environments for testing:
          </p>
          <ul className="explanation-list">
            <li><strong>No real money:</strong> Test tokens have no value</li>
            <li><strong>Safe testing:</strong> Try features without risk</li>
            <li><strong>Free tokens:</strong> Get test tokens from faucets</li>
            <li><strong>Development:</strong> Test smart contracts safely</li>
          </ul>
        </div>

        {/* Getting started */}
        <div className="explanation-section">
          <h3 className="explanation-title">🚀 Getting Started</h3>
          <ol className="explanation-list">
            <li>Connect your wallets using the <strong>Universal Wallet</strong> button</li>
            <li>Get test tokens from the faucets (click "🎯 Get Test Tokens")</li>
            <li>Choose source and destination chains</li>
            <li>Enter amount and recipient address</li>
            <li>Click "Send Transfer" to start the cross-chain transfer</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks; 