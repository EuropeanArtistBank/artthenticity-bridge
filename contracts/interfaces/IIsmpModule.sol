// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IIsmpModule
 * @notice Interface for ISMP modules that can receive cross-chain messages
 */
interface IIsmpModule {
    /**
     * @notice Called when a cross-chain message is received
     * @param from The source address
     * @param data The message data
     */
    function onAccept(bytes memory from, bytes memory data) external;
    
    /**
     * @notice Get the module identifier
     */
    function moduleId() external view returns (bytes32);
} 