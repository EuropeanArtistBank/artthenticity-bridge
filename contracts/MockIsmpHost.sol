// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IIsmpHost.sol";
import "./interfaces/IDispatcher.sol";
import "./interfaces/IIsmpModule.sol";

/**
 * @title MockIsmpHost
 * @notice Mock implementation of ISMP Host for testing
 */
contract MockIsmpHost is IIsmpHost, IDispatcher {
    // Current state machine identifier
    bytes public override stateMachine;
    
    // Mapping to track requests
    mapping(bytes32 => bool) public override hasRequest;
    
    // Request counter
    uint256 public requestCounter;
    
    // Mapping from request ID to request data
    mapping(bytes32 => RequestData) public requests;
    
    struct RequestData {
        bytes dest;
        bytes to;
        bytes body;
        uint256 timeout;
        uint256 fee;
        address payer;
        uint256 timestamp;
    }
    
    /**
     * @notice Constructor
     * @param _stateMachine The state machine identifier
     */
    constructor(bytes memory _stateMachine) {
        stateMachine = _stateMachine;
    }
    
    /**
     * @notice Dispatch a cross-chain request
     */
    function dispatch(
        bytes memory dest,
        bytes memory to,
        bytes memory body,
        uint256 timeout,
        uint256 fee,
        address payer
    ) external payable override(IDispatcher, IIsmpHost) returns (bytes32) {
        require(msg.value >= fee, "MockIsmpHost: insufficient fee");
        
        // Generate request ID
        bytes32 requestId = keccak256(abi.encodePacked(
            block.chainid,
            address(this),
            requestCounter++,
            block.timestamp
        ));
        
        // Store request data
        requests[requestId] = RequestData({
            dest: dest,
            to: to,
            body: body,
            timeout: timeout,
            fee: fee,
            payer: payer,
            timestamp: block.timestamp
        });
        
        hasRequest[requestId] = true;
        
        emit RequestDispatched(requestId, msg.sender, body);
        
        return requestId;
    }
    
    /**
     * @notice Simulate receiving a message (for testing)
     * @param module The module address to receive the message
     * @param from The source address
     * @param data The message data
     */
    function simulateReceive(
        address module,
        bytes memory from,
        bytes memory data
    ) external {
        // Call the module's onAccept function
        IIsmpModule(module).onAccept(from, data);
        
        emit RequestReceived(keccak256(abi.encodePacked(from, data)), module, data);
    }
    
    /**
     * @notice Get the host address (for IDispatcher interface)
     */
    function host() external view override returns (address) {
        return address(this);
    }
    
    /**
     * @notice Withdraw accumulated fees
     */
    function withdrawFees() external {
        payable(msg.sender).transfer(address(this).balance);
    }
} 