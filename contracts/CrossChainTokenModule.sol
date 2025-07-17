// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BaseIsmpModule.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CrossChainTokenModule
 * @notice ISMP module for cross-chain token transfers between Ethereum and Polkadot
 */
contract CrossChainTokenModule is BaseIsmpModule, ReentrancyGuard {
    // State machine identifiers
    bytes public constant POLKADOT_MAINNET = hex"0001";
    bytes public constant POLKADOT_ROCOCO = hex"0002";
    bytes public constant POLKADOT_WESTEND = hex"0003";
    
    // Transfer request structure
    struct TransferRequest {
        address token;
        address recipient;
        uint256 amount;
        uint256 nonce;
        bool executed;
    }
    
    // Mapping from request ID to transfer request
    mapping(bytes32 => TransferRequest) public transferRequests;
    
    // Mapping from nonce to request ID (for tracking)
    mapping(uint256 => bytes32) public nonceToRequest;
    
    // Current nonce for generating unique request IDs
    uint256 public currentNonce;
    
    // Fee for cross-chain transfers (in wei)
    uint256 public transferFee;
    
    /**
     * @notice Emitted when a transfer request is created
     */
    event TransferRequestCreated(
        bytes32 indexed requestId,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 nonce
    );
    
    /**
     * @notice Emitted when a transfer is executed
     */
    event TransferExecuted(
        bytes32 indexed requestId,
        address indexed token,
        address indexed recipient,
        uint256 amount
    );
    
    /**
     * @notice Constructor
     * @param _host The ISMP host address
     * @param _transferFee The fee for cross-chain transfers
     */
    constructor(address _host, uint256 _transferFee) 
        BaseIsmpModule(_host, keccak256("CrossChainTokenModule"))
    {
        transferFee = _transferFee;
    }
    
    /**
     * @notice Send tokens to Polkadot
     * @param token The token address to transfer
     * @param recipient The recipient address on Polkadot (encoded)
     * @param amount The amount to transfer
     * @param destChain The destination chain (POLKADOT_MAINNET, POLKADOT_ROCOCO, etc.)
     */
    function sendToPolkadot(
        address token,
        bytes memory recipient,
        uint256 amount,
        bytes memory destChain
    ) external payable nonReentrant {
        require(msg.value >= transferFee, "CrossChainTokenModule: insufficient fee");
        require(amount > 0, "CrossChainTokenModule: invalid amount");
        require(token != address(0), "CrossChainTokenModule: invalid token");
        
        // Transfer tokens from sender to this contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Generate unique request ID
        uint256 nonce = ++currentNonce;
        bytes32 requestId = keccak256(abi.encodePacked(
            block.chainid,
            address(this),
            nonce,
            block.timestamp
        ));
        
        // Create transfer request
        TransferRequest memory request = TransferRequest({
            token: token,
            recipient: address(0), // Will be decoded on destination
            amount: amount,
            nonce: nonce,
            executed: false
        });
        
        transferRequests[requestId] = request;
        nonceToRequest[nonce] = requestId;
        
        // Encode the transfer data
        bytes memory transferData = abi.encode(
            requestId,
            token,
            recipient,
            amount,
            nonce
        );
        
        // Send cross-chain message
        _sendMessage(
            destChain,
            recipient, // This should be the module address on Polkadot
            transferData,
            3600, // 1 hour timeout
            transferFee
        );
        
        emit TransferRequestCreated(requestId, token, address(0), amount, nonce);
    }
    
    /**
     * @notice Handle incoming transfer from Polkadot
     * @param from The source address
     * @param data The transfer data
     */
    function _handleIncomingMessage(bytes memory from, bytes memory data) internal override {
        // Decode the transfer data
        (
            bytes32 requestId,
            address token,
            address recipient,
            uint256 amount,
            uint256 nonce
        ) = abi.decode(data, (bytes32, address, address, uint256, uint256));
        
        // Check if request already executed
        require(!transferRequests[requestId].executed, "CrossChainTokenModule: already executed");
        
        // Mark as executed
        transferRequests[requestId].executed = true;
        
        // Transfer tokens to recipient
        IERC20(token).transfer(recipient, amount);
        
        emit TransferExecuted(requestId, token, recipient, amount);
    }
    
    /**
     * @notice Update transfer fee (only owner)
     * @param newFee The new transfer fee
     */
    function setTransferFee(uint256 newFee) external {
        // In a real implementation, this would have access control
        transferFee = newFee;
    }
    
    /**
     * @notice Withdraw accumulated fees (only owner)
     */
    function withdrawFees() external {
        // In a real implementation, this would have access control
        payable(msg.sender).transfer(address(this).balance);
    }
    
    /**
     * @notice Emergency function to recover stuck tokens
     * @param token The token to recover
     * @param to The recipient address
     * @param amount The amount to recover
     */
    function emergencyRecover(
        address token,
        address to,
        uint256 amount
    ) external {
        // In a real implementation, this would have access control
        IERC20(token).transfer(to, amount);
    }

    /**
     * @notice Allow the contract to receive ETH
     */
    receive() external payable {}
} 