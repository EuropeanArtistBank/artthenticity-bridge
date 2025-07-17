// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IIsmpHost.sol";
import "./interfaces/IIsmpModule.sol";
import "./interfaces/IDispatcher.sol";

/**
 * @title BaseIsmpModule
 * @notice Base contract for ISMP modules with common functionality
 */
abstract contract BaseIsmpModule is IIsmpModule {
    address public immutable host;
    bytes32 public immutable override moduleId;
    
    /**
     * @notice Emitted when a message is sent
     */
    event MessageSent(bytes32 indexed requestId, bytes dest, bytes to, bytes body);
    
    /**
     * @notice Emitted when a message is received
     */
    event MessageReceived(bytes indexed from, bytes data);
    
    /**
     * @notice Modifier to ensure only the host can call certain functions
     */
    modifier onlyHost() {
        require(msg.sender == host, "BaseIsmpModule: only host");
        _;
    }
    
    /**
     * @notice Constructor
     * @param _host The ISMP host address
     * @param _moduleId The module identifier
     */
    constructor(address _host, bytes32 _moduleId) {
        require(_host != address(0), "BaseIsmpModule: invalid host");
        host = _host;
        moduleId = _moduleId;
    }
    
    /**
     * @notice Send a cross-chain message
     * @param dest The destination state machine
     * @param to The recipient address
     * @param body The message body
     * @param timeout The timeout in seconds
     * @param fee The fee amount
     */
    function _sendMessage(
        bytes memory dest,
        bytes memory to,
        bytes memory body,
        uint256 timeout,
        uint256 fee
    ) internal returns (bytes32) {
        bytes32 requestId = IDispatcher(host).dispatch{value: fee}(
            dest,
            to,
            body,
            timeout,
            fee,
            tx.origin
        );
        
        emit MessageSent(requestId, dest, to, body);
        return requestId;
    }
    
    /**
     * @notice Internal function to handle incoming messages
     * @param from The source address
     * @param data The message data
     */
    function _handleIncomingMessage(bytes memory from, bytes memory data) internal virtual;
    
    /**
     * @notice Called by the host when a message is received
     * @param from The source address
     * @param data The message data
     */
    function onAccept(bytes memory from, bytes memory data) external override onlyHost {
        emit MessageReceived(from, data);
        _handleIncomingMessage(from, data);
    }
} 