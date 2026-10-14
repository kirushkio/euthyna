// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC20.sol";
import "../interfaces/IVenueAdapter.sol";

interface IERC4626 is IERC20 {
    function asset() external view returns (address);
    function totalAssets() external view returns (uint256);
    function convertToShares(uint256 assets) external view returns (uint256 shares);
    function convertToAssets(uint256 shares) external view returns (uint256 assets);
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);
}

/**
 * @title ERC4626Adapter
 * @notice Adapter for real ERC-4626 vaults on Arc Testnet (such as Morpho USDC Earn vaults)
 */
contract ERC4626Adapter is IVenueAdapter {
    IERC20 public immutable usdc;
    IERC4626 public immutable vault;
    bool public constant isSimulated = false;

    constructor(address _usdc, address _vault) {
        usdc = IERC20(_usdc);
        vault = IERC4626(_vault);
    }

    function deposit(uint256 amount) external override returns (uint256 shares) {
        usdc.transferFrom(msg.sender, address(this), amount);
        usdc.approve(address(vault), amount);
        shares = vault.deposit(amount, msg.sender);
        return shares;
    }

    function requestRedemption(uint256) external pure override returns (bytes32) {
        revert("Use instantRedeem for ERC-4626");
    }

    function completeRedemption(bytes32) external pure override returns (uint256) {
        revert("Use instantRedeem for ERC-4626");
    }

    function instantRedeem(uint256 amount) external override returns (uint256 receivedAmount) {
        uint256 shares = vault.convertToShares(amount);
        receivedAmount = vault.redeem(shares, msg.sender, msg.sender);
        return receivedAmount;
    }

    function totalValue() external view override returns (uint256) {
        uint256 shares = vault.balanceOf(msg.sender);
        return vault.convertToAssets(shares);
    }

    function redemptionDelay() external pure override returns (uint256) {
        return 0; // Instant redemption
    }
}
