# ARTthenticity Bridge

A cross-chain token bridge implementation using Hyperbridge and Polkadot for secure token transfers between Ethereum and Polkadot networks.

## Overview

This project implements a cross-chain token bridge based on the ISMP (Interoperable State Machine Protocol) by Hyperbridge. It enables secure token transfers between Ethereum and Polkadot networks.

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Ethereum      │    │   Hyperbridge    │    │   Polkadot      │
│   (EVM)         │◄──►│   ISMP Protocol  │◄──►│   (Substrate)   │
│                 │    │                  │    │                 │
│ • Smart         │    │ • Message        │    │ • Pallets       │
│   Contracts     │    │   Routing        │    │ • Runtime       │
│ • ERC20 Tokens  │    │ • State Proofs   │    │ • Accounts      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Features

- Cross-chain token transfers between Ethereum and Polkadot
- ISMP protocol integration with Hyperbridge
- React frontend with Polkadot.js integration
- Comprehensive testing with Hardhat
- Multi-network support (Rococo, Westend, Kusama, Polkadot)
- Wallet integration (MetaMask, Polkadot.js Extension)
- Real-time transfer tracking
- Responsive design

## Requirements

### System Requirements
- Node.js 18+
- npm or yarn
- Git

### Blockchain Tools
- MetaMask (Ethereum Wallet)
- Polkadot.js Extension (Polkadot Wallet)
- Hardhat (Smart Contract Development)

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd artthenticity-bridge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Create .env file
cp .env.example .env

# Configure environment variables
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
PRIVATE_KEY=your-private-key-here
ETHERSCAN_API_KEY=your-etherscan-api-key
```

## Development

### Compile Smart Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
# All tests
npx hardhat test

# Specific tests
npx hardhat test test/CrossChainTokenModule.test.js
```

### Local Development
```bash
# Start Hardhat node
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
npm start
```

### Deploy to Testnet
```bash
# Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Rococo testnet
npx hardhat run scripts/deploy.js --network rococo
```

## Project Structure

```
artthenticity-bridge/
├── contracts/                 # Smart Contracts
│   ├── interfaces/           # ISMP Interfaces
│   │   ├── IIsmpHost.sol
│   │   ├── IIsmpModule.sol
│   │   └── IDispatcher.sol
│   ├── BaseIsmpModule.sol    # Base ISMP Module
│   ├── CrossChainTokenModule.sol  # Token Transfer Module
│   ├── MockIsmpHost.sol      # Mock for Testing
│   └── MockERC20.sol         # Test Token
├── src/                      # React Frontend
│   ├── App.tsx              # Main Component
│   ├── App.css              # Styling
│   └── index.tsx            # Entry Point
├── test/                     # Tests
│   └── CrossChainTokenModule.test.js
├── scripts/                  # Deployment Scripts
│   └── deploy.js
├── hardhat.config.js         # Hardhat Configuration
└── package.json
```

## Smart Contracts

### Core Contracts

#### `CrossChainTokenModule.sol`
Main module for cross-chain token transfers:

```solidity
// Send tokens to Polkadot
function sendToPolkadot(
    address token,
    bytes memory recipient,
    uint256 amount,
    bytes memory destChain
) external payable;

// Process incoming transfers
function onAccept(bytes memory from, bytes memory data) external;
```

#### `BaseIsmpModule.sol`
Base class for all ISMP modules with common functionality.

#### `MockIsmpHost.sol`
Mock implementation of ISMP host for testing.

### ISMP Protocol

The project implements the Interoperable State Machine Protocol:

- **IIsmpHost**: Central data storage
- **IIsmpModule**: Receiving logic for cross-chain messages
- **IDispatcher**: Message routing between chains

## Networks

### Supported Networks

| Network | Chain ID | RPC URL | Status |
|---------|----------|---------|--------|
| Rococo | 1000 | `wss://rococo-rpc.polkadot.io` | Testnet |
| Westend | 1001 | `wss://westend-rpc.polkadot.io` | Testnet |
| Kusama | 2000 | `wss://kusama-rpc.polkadot.io` | Mainnet |
| Polkadot | 2001 | `wss://rpc.polkadot.io` | Mainnet |
| Sepolia | 11155111 | `https://sepolia.infura.io` | Testnet |

### Faucets

For testnet tokens:

- Rococo DOT: https://faucet.parity.io/
- Westend DOT: https://westend-faucet.polkadot.io/
- Sepolia ETH: https://sepoliafaucet.com/

## Fees

### Transfer Fees
- Protocol fee: 0.001 ETH (configurable)
- Relayer fee: Voluntary reward
- Payment: Native token (ETH) or stablecoin

### Fee Management
```solidity
// Adjust fee
function setTransferFee(uint256 newFee) external;

// Withdraw fees
function withdrawFees() external;
```

## Security

### Best Practices
- Access control for admin functions
- Reentrancy protection with OpenZeppelin
- Input validation for all parameters
- Event logging for transparency
- Emergency recovery functions

### Audit Recommendations
- External smart contract audit
- Formal verification
- Penetration testing
- Economic security review

## Testing

### Test Coverage
```bash
# Test coverage report
npx hardhat coverage

# Gas usage report
REPORT_GAS=true npx hardhat test
```

### Test Scenarios
- Contract deployment
- Cross-chain message sending
- Message reception and processing
- Fee management
- Error handling
- Access control

## Deployment

### Production Deployment

1. **Deploy contracts**:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

2. **Verify contracts**:
```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

3. **Configure frontend**:
```javascript
// src/config/networks.js
export const NETWORKS = {
  mainnet: {
    ethereum: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    polkadot: 'wss://rpc.polkadot.io'
  }
};
```

### Environment Variables
```bash
# .env
PRIVATE_KEY=your-deployment-key
INFURA_PROJECT_ID=your-infura-id
ETHERSCAN_API_KEY=your-etherscan-key
POLKADOT_RPC_URL=wss://rpc.polkadot.io
```

## Monitoring

### Events Tracking
```solidity
event TransferRequestCreated(
    bytes32 indexed requestId,
    address indexed token,
    address indexed recipient,
    uint256 amount,
    uint256 nonce
);

event TransferExecuted(
    bytes32 indexed requestId,
    address indexed token,
    address indexed recipient,
    uint256 amount
);
```

### Analytics
- Transfer volume
- Success/failure rates
- Gas usage
- Network performance

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Create pull request

### Code Standards
- Solidity: Solidity Style Guide
- TypeScript: ESLint + Prettier
- Testing: 90%+ coverage
- Documentation: JSDoc for all functions

## Documentation

### Additional Links
- [Hyperbridge Documentation](https://hyperbridge.network/)
- [ISMP Protocol Spec](https://specs.hyperbridge.network/)
- [Polkadot.js API](https://polkadot.js.org/docs/)
- [Hardhat Documentation](https://hardhat.org/docs/)

### Tutorials
- [Cross-Chain Development Guide](docs/cross-chain-guide.md)
- [ISMP Module Development](docs/ismp-module-guide.md)
- [Frontend Integration](docs/frontend-integration.md)

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

### Common Issues

**Polkadot.js Extension not found**
```bash
# Install browser extension
# https://polkadot.js.org/extension/
```

**MetaMask Connection Failed**
```bash
# Install MetaMask and add network
# https://metamask.io/
```

**Contract Deployment Failed**
```bash
# Increase gas limit
npx hardhat run scripts/deploy.js --network mainnet --gas-limit 5000000
```

### Community
- Discord: [Hyperbridge Community](https://discord.gg/hyperbridge)
- Telegram: [Polkadot Community](https://t.me/PolkadotOfficial)
- GitHub Issues: [Project Issues](https://github.com/your-repo/issues)

## Acknowledgments

- Hyperbridge Team for the ISMP Protocol
- Polkadot Foundation for the Substrate Framework
- OpenZeppelin for the Security Libraries
- Hardhat Team for the Development Framework

---

**Disclaimer**: This project is for educational purposes. Use in production environments at your own risk.
