// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVenueAdapter {
    function deposit(uint256 amount) external returns (uint256 sharesOrPrincipal);
    function requestRedemption(uint256 amount) external returns (bytes32 ticketId);
    function completeRedemption(bytes32 ticketId) external returns (uint256 receivedAmount);
    function instantRedeem(uint256 amount) external returns (uint256 receivedAmount);
    function totalValue() external view returns (uint256);
    function redemptionDelay() external view returns (uint256); // in seconds
    function isSimulated() external view returns (bool);
}
