// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";
import "./interfaces/IVenueAdapter.sol";

/**
 * @title SimYieldVault
 * @notice [SIMULATED] Demonstrates configurable APR and redemption delay mechanics on Arc Testnet.
 * @dev Explicitly labeled SIMULATED per PRD Section 8.4.
 */
contract SimYieldVault is IVenueAdapter {
    IERC20 public immutable usdc;
    address public owner;

    uint256 public aprBps; // e.g. 520 = 5.20%
    uint256 public delaySeconds; // e.g. 86400 for 1 day, or 60 for 1 minute demo scale
    bool public constant isSimulated = true;

    struct RedemptionTicket {
        address recipient;
        uint256 amount;
        uint256 releaseTs;
        bool claimed;
    }

    uint256 public totalDeposited;
    mapping(bytes32 => RedemptionTicket) public tickets;

    event Deposited(address indexed from, uint256 amount);
    event RedemptionRequested(bytes32 indexed ticketId, address indexed recipient, uint256 amount, uint256 releaseTs);
    event RedemptionCompleted(bytes32 indexed ticketId, address indexed recipient, uint256 amount);

    error RedemptionNotReady();
    error AlreadyClaimed();
    error Unauthorized();

    constructor(address _usdc, uint256 _initialAprBps, uint256 _delaySeconds) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
        aprBps = _initialAprBps;
        delaySeconds = _delaySeconds;
    }

    function deposit(uint256 amount) external override returns (uint256) {
        usdc.transferFrom(msg.sender, address(this), amount);
        totalDeposited += amount;
        emit Deposited(msg.sender, amount);
        return amount;
    }

    function requestRedemption(uint256 amount) external override returns (bytes32 ticketId) {
        ticketId = keccak256(abi.encodePacked(msg.sender, amount, block.timestamp));
        uint256 releaseTs = block.timestamp + delaySeconds;
        tickets[ticketId] = RedemptionTicket({
            recipient: msg.sender,
            amount: amount,
            releaseTs: releaseTs,
            claimed: false
        });
        emit RedemptionRequested(ticketId, msg.sender, amount, releaseTs);
        return ticketId;
    }

    function completeRedemption(bytes32 ticketId) external override returns (uint256 receivedAmount) {
        RedemptionTicket storage t = tickets[ticketId];
        if (t.claimed) revert AlreadyClaimed();
        if (block.timestamp < t.releaseTs) revert RedemptionNotReady();

        t.claimed = true;
        receivedAmount = t.amount;
        if (totalDeposited >= receivedAmount) {
            totalDeposited -= receivedAmount;
        }

        emit RedemptionCompleted(ticketId, t.recipient, receivedAmount);
        usdc.transfer(t.recipient, receivedAmount);
    }

    function instantRedeem(uint256 amount) external override returns (uint256 receivedAmount) {
        if (totalDeposited >= amount) {
            totalDeposited -= amount;
        }
        usdc.transfer(msg.sender, amount);
        return amount;
    }

    function totalValue() external view override returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    function redemptionDelay() external view override returns (uint256) {
        return delaySeconds;
    }
}
