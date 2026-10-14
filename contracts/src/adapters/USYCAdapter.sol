// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";
import "../interfaces/IVenueAdapter.sol";

interface IHashnoteTeller {
    function buy(address token, uint256 amount) external returns (uint256 shares);
    function requestRedemption(uint256 shares) external returns (uint256 orderId);
    function completeRedemption(uint256 orderId) external returns (uint256 amount);
}

/**
 * @title USYCAdapter
 * @notice Adapter for Circle Hashnote USYC tokenized short-term US Treasury yield
 * @dev Settles on Arc in USDC (both use 6 decimals). Requires allowlisted holder address.
 */
contract USYCAdapter is IVenueAdapter {
    IERC20 public immutable usdc;
    IERC20 public immutable usyc;
    IHashnoteTeller public immutable teller;
    bool public constant isSimulated = false;

    // USYC redemption is T+1
    uint256 public constant REDEMPTION_DELAY = 86400;

    constructor(address _usdc, address _usyc, address _teller) {
        usdc = IERC20(_usdc);
        usyc = IERC20(_usyc);
        teller = IHashnoteTeller(_teller);
    }

    function deposit(uint256 amount) external override returns (uint256) {
        usdc.transferFrom(msg.sender, address(this), amount);
        usdc.approve(address(teller), amount);
        uint256 shares = teller.buy(address(usdc), amount);
        // Transfer USYC shares to vault
        usyc.transfer(msg.sender, shares);
        return shares;
    }

    function requestRedemption(uint256 amount) external override returns (bytes32) {
        usyc.transferFrom(msg.sender, address(this), amount);
        usyc.approve(address(teller), amount);
        uint256 orderId = teller.requestRedemption(amount);
        return bytes32(orderId);
    }

    function completeRedemption(bytes32 ticketId) external override returns (uint256 receivedAmount) {
        receivedAmount = teller.completeRedemption(uint256(ticketId));
        usdc.transfer(msg.sender, receivedAmount);
        return receivedAmount;
    }

    function instantRedeem(uint256 amount) external override returns (uint256) {
        // Falls back to request if instant capacity is unavailable
        bytes32 ticket = this.requestRedemption(amount);
        return this.completeRedemption(ticket);
    }

    function totalValue() external view override returns (uint256) {
        return usyc.balanceOf(msg.sender);
    }

    function redemptionDelay() external pure override returns (uint256) {
        return REDEMPTION_DELAY;
    }
}
