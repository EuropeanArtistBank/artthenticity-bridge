// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDispatcher
 * @notice Interface for the ISMP dispatcher that handles message routing
 */
interface IDispatcher {
    /**
     * @notice Dispatch a cross-chain message
     * @param dest The destination state machine
     * @param to The recipient address
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
     * @notice Get the current host address
     */
    function host() external view returns (address);
} 