# 🌉 Cross-Chain Token Bridge

Ein interoperables Smart-Contract-Projekt mit **Hyperbridge** & **Polkadot** für Cross-Chain Token Transfers zwischen Ethereum und Polkadot.

## 🎯 Projektübersicht

Dieses Projekt implementiert eine **Cross-Chain Token Bridge** basierend auf dem **ISMP (Interoperable State Machine Protocol)** von Hyperbridge. Es ermöglicht sichere Token-Transfers zwischen Ethereum und Polkadot-Netzwerken.

### 🏗️ Architektur

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

## 🚀 Features

- ✅ **Cross-Chain Token Transfers** zwischen Ethereum und Polkadot
- ✅ **ISMP Protocol Integration** mit Hyperbridge
- ✅ **Moderne React Frontend** mit Polkadot.js Integration
- ✅ **Comprehensive Testing** mit Hardhat
- ✅ **Multi-Network Support** (Rococo, Westend, Kusama, Polkadot)
- ✅ **Wallet Integration** (MetaMask, Polkadot.js Extension)
- ✅ **Real-time Transfer Tracking**
- ✅ **Responsive Design**

## 📋 Voraussetzungen

### System Requirements
- **Node.js** 18+ 
- **npm** oder **yarn**
- **Git**

### Blockchain Tools
- **MetaMask** (Ethereum Wallet)
- **Polkadot.js Extension** (Polkadot Wallet)
- **Hardhat** (Smart Contract Development)

## 🛠️ Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd my-polkadot-app
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Environment Setup
```bash
# .env Datei erstellen
cp .env.example .env

# Environment Variablen konfigurieren
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
PRIVATE_KEY=your-private-key-here
ETHERSCAN_API_KEY=your-etherscan-api-key
```

## 🏃‍♂️ Entwicklung

### Smart Contracts kompilieren
```bash
npx hardhat compile
```

### Tests ausführen
```bash
# Alle Tests
npx hardhat test

# Spezifische Tests
npx hardhat test test/CrossChainTokenModule.test.js
```

### Lokale Entwicklung
```bash
# Hardhat Node starten
npx hardhat node

# Contracts deployen
npx hardhat run scripts/deploy.js --network localhost

# Frontend starten
npm start
```

### Deployment auf Testnet
```bash
# Sepolia Testnet
npx hardhat run scripts/deploy.js --network sepolia

# Rococo Testnet
npx hardhat run scripts/deploy.js --network rococo
```

## 📁 Projektstruktur

```
my-polkadot-app/
├── contracts/                 # Smart Contracts
│   ├── interfaces/           # ISMP Interfaces
│   │   ├── IIsmpHost.sol
│   │   ├── IIsmpModule.sol
│   │   └── IDispatcher.sol
│   ├── BaseIsmpModule.sol    # Basis ISMP Module
│   ├── CrossChainTokenModule.sol  # Token Transfer Module
│   ├── MockIsmpHost.sol      # Mock für Testing
│   └── MockERC20.sol         # Test Token
├── src/                      # React Frontend
│   ├── App.tsx              # Hauptkomponente
│   ├── App.css              # Styling
│   └── index.tsx            # Entry Point
├── test/                     # Tests
│   └── CrossChainTokenModule.test.js
├── scripts/                  # Deployment Scripts
│   └── deploy.js
├── hardhat.config.js         # Hardhat Konfiguration
└── package.json
```

## 🔧 Smart Contracts

### Core Contracts

#### `CrossChainTokenModule.sol`
Das Hauptmodul für Cross-Chain Token Transfers:

```solidity
// Token zu Polkadot senden
function sendToPolkadot(
    address token,
    bytes memory recipient,
    uint256 amount,
    bytes memory destChain
) external payable;

// Incoming Transfers verarbeiten
function onAccept(bytes memory from, bytes memory data) external;
```

#### `BaseIsmpModule.sol`
Basis-Klasse für alle ISMP Module mit gemeinsamer Funktionalität.

#### `MockIsmpHost.sol`
Mock-Implementierung des ISMP Hosts für Testing.

### ISMP Protocol

Das Projekt implementiert das **Interoperable State Machine Protocol**:

- **IIsmpHost**: Zentrale Datenspeicherung
- **IIsmpModule**: Empfangslogik für Cross-Chain Nachrichten
- **IDispatcher**: Nachrichten-Routing zwischen Chains

## 🌐 Netzwerke

### Unterstützte Netzwerke

| Netzwerk | Chain ID | RPC URL | Status |
|----------|----------|---------|--------|
| **Rococo** | 1000 | `wss://rococo-rpc.polkadot.io` | Testnet |
| **Westend** | 1001 | `wss://westend-rpc.polkadot.io` | Testnet |
| **Kusama** | 2000 | `wss://kusama-rpc.polkadot.io` | Mainnet |
| **Polkadot** | 2001 | `wss://rpc.polkadot.io` | Mainnet |
| **Sepolia** | 11155111 | `https://sepolia.infura.io` | Testnet |

### Faucets

Für Testnet-Token:

- **Rococo DOT**: https://faucet.parity.io/
- **Westend DOT**: https://westend-faucet.polkadot.io/
- **Sepolia ETH**: https://sepoliafaucet.com/

## 💰 Gebühren

### Transfer Fees
- **Protokollgebühr**: 0.001 ETH (konfigurierbar)
- **Relayer Fee**: Freiwillige Belohnung
- **Zahlung**: Native Token (ETH) oder Stablecoin

### Fee Management
```solidity
// Fee anpassen
function setTransferFee(uint256 newFee) external;

// Fees abheben
function withdrawFees() external;
```

## 🔐 Sicherheit

### Best Practices
- ✅ **Access Control** für Admin-Funktionen
- ✅ **Reentrancy Protection** mit OpenZeppelin
- ✅ **Input Validation** für alle Parameter
- ✅ **Event Logging** für Transparenz
- ✅ **Emergency Recovery** Funktionen

### Audit Recommendations
- [ ] Externe Smart Contract Audit
- [ ] Formal Verification
- [ ] Penetration Testing
- [ ] Economic Security Review

## 🧪 Testing

### Test Coverage
```bash
# Test Coverage Report
npx hardhat coverage

# Gas Usage Report
REPORT_GAS=true npx hardhat test
```

### Test Szenarien
- ✅ Contract Deployment
- ✅ Cross-Chain Message Sending
- ✅ Message Reception & Processing
- ✅ Fee Management
- ✅ Error Handling
- ✅ Access Control

## 🚀 Deployment

### Production Deployment

1. **Contracts deployen**:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

2. **Contracts verifizieren**:
```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

3. **Frontend konfigurieren**:
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

## 📊 Monitoring

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
- Transfer Volume
- Success/Failure Rates
- Gas Usage
- Network Performance

## 🤝 Beitragen

### Development Workflow
1. Fork das Repository
2. Feature Branch erstellen: `git checkout -b feature/amazing-feature`
3. Änderungen committen: `git commit -m 'Add amazing feature'`
4. Branch pushen: `git push origin feature/amazing-feature`
5. Pull Request erstellen

### Code Standards
- **Solidity**: Solidity Style Guide
- **TypeScript**: ESLint + Prettier
- **Testing**: 90%+ Coverage
- **Documentation**: JSDoc für alle Funktionen

## 📚 Dokumentation

### Weiterführende Links
- [Hyperbridge Documentation](https://hyperbridge.network/)
- [ISMP Protocol Spec](https://specs.hyperbridge.network/)
- [Polkadot.js API](https://polkadot.js.org/docs/)
- [Hardhat Documentation](https://hardhat.org/docs/)

### Tutorials
- [Cross-Chain Development Guide](docs/cross-chain-guide.md)
- [ISMP Module Development](docs/ismp-module-guide.md)
- [Frontend Integration](docs/frontend-integration.md)

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

### Häufige Probleme

**Polkadot.js Extension nicht gefunden**
```bash
# Browser Extension installieren
# https://polkadot.js.org/extension/
```

**MetaMask Connection Failed**
```bash
# MetaMask installieren und Netzwerk hinzufügen
# https://metamask.io/
```

**Contract Deployment Failed**
```bash
# Gas Limit erhöhen
npx hardhat run scripts/deploy.js --network mainnet --gas-limit 5000000
```

### Community
- **Discord**: [Hyperbridge Community](https://discord.gg/hyperbridge)
- **Telegram**: [Polkadot Community](https://t.me/PolkadotOfficial)
- **GitHub Issues**: [Project Issues](https://github.com/your-repo/issues)

## 🙏 Danksagungen

- **Hyperbridge Team** für das ISMP Protocol
- **Polkadot Foundation** für die Substrate Framework
- **OpenZeppelin** für die Security Libraries
- **Hardhat Team** für das Development Framework

---

**⚠️ Disclaimer**: Dieses Projekt ist für Bildungszwecke gedacht. Verwenden Sie es in Produktionsumgebungen auf eigene Gefahr.
