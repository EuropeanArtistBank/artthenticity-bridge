// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IIsmpHost
 * @notice Interface for the ISMP Host contract that manages cross-chain state
 */
interface IIsmpHost {
    /**
     * @notice Emitted when a new request is dispatched
     */
    event RequestDispatched(bytes32 indexed requestId, address indexed from, bytes data);
    
    /**
     * @notice Emitted when a request is received
     */
    event RequestReceived(bytes32 indexed requestId, address indexed to, bytes data);
    
    /**
     * @notice Dispatch a new cross-chain request
     * @param dest The destination state machine identifier
     * @param to The recipient address on the destination chain
     * @param body The message body
     * @param timeout The timeout in seconds
     * @param fee The fee amount
     * @param payer The address paying the fee
     */
    function dispatch(
        bytes memory dest,
        bytes memory to,
        bytes memory body,
        uint256 timeout,
        uint256 fee,
        address payer
    ) external payable returns (bytes32);
    
    /**
     * @notice Get the current state machine identifier
     */
    function stateMachine() external view returns (bytes memory);
    
    /**
     * @notice Check if a request exists
     * @param requestId The request identifier
     */
    function hasRequest(bytes32 requestId) external view returns (bool);
} 