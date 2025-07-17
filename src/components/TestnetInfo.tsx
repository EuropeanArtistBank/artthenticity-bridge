import React from 'react';

const TestnetInfo: React.FC = () => {
  const faucetLinks = {
    ethereum: [
      { name: 'Sepolia Faucet', url: 'https://sepoliafaucet.com/' },
      { name: 'Parity Faucet', url: 'https://faucet.parity.io/' },
      { name: 'Alchemy Faucet', url: 'https://sepoliafaucet.com/' }
    ],
    solana: [
      { name: 'Solana Faucet', url: 'https://faucet.solana.com/' },
      { name: 'QuickNode Faucet', url: 'https://faucet.quicknode.com/solana/devnet' }
    ],
    polkadot: [
      { name: 'Rococo Faucet', url: 'https://matrix.to/#/#rococo-faucet:matrix.org' },
      { name: 'Westend Faucet', url: 'https://wiki.polkadot.network/docs/learn-DOT#getting-westend-dot' }
    ]
  };

  return (
    <div className="testnet-info-card">
      <h2 className="card-title">🔗 Testnet Access</h2>
      <p className="testnet-description">
        Get test tokens for development and testing on different networks
      </p>
      
      <div className="faucet-grid">
        {/* Ethereum */}
        <div className="faucet-section">
          <h3 className="faucet-title">🔷 Ethereum (Sepolia)</h3>
          <p className="faucet-description">
            Get Sepolia ETH for testing smart contracts and dApps
          </p>
          <div className="faucet-links">
            {faucetLinks.ethereum.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="faucet-link"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Solana */}
        <div className="faucet-section">
          <h3 className="faucet-title">☀️ Solana (Devnet)</h3>
          <p className="faucet-description">
            Get SOL for testing Solana programs and applications
          </p>
          <div className="faucet-links">
            {faucetLinks.solana.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="faucet-link"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Polkadot */}
        <div className="faucet-section">
          <h3 className="faucet-title">🟣 Polkadot (Rococo)</h3>
          <p className="faucet-description">
            Get ROC for testing Polkadot parachains and cross-chain transfers
          </p>
          <div className="faucet-links">
            {faucetLinks.polkadot.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="faucet-link"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="testnet-tips">
        <h4>💡 Tips:</h4>
        <ul>
          <li>Use separate wallets for testnets and mainnet</li>
          <li>Testnet tokens have no real value</li>
          <li>Some faucets have rate limits</li>
          <li>Keep your testnet addresses for future testing</li>
        </ul>
      </div>
    </div>
  );
};

export default TestnetInfo; 