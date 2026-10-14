// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";
import "./interfaces/IVenueAdapter.sol";

/**
 * @title EuthynaVault
 * @notice Onchain treasury vault for small businesses on Arc, settled in USDC.
 * @dev Enforces the core paradigm: "The model proposes, the vault disposes".
 * Physically prevents unregistered payees, duplicate invoice payouts,
 * reserve floor breaches, and unvetted addresses.
 */
contract EuthynaVault {
    // --- Roles ---
    address public owner;
    address public registrar;
    address public agent;
    address public guardian;

    // --- Token ---
    IERC20 public immutable usdc;

    // --- State & Status ---
    bool public paused;
    uint256 public nextDecisionSeq = 1;

    enum PayeeStatus { None, Pending, Active, Revoked }
    enum ObligationKind { MANDATORY, DISCRETIONARY }

    struct Policy {
        uint256 perTxCap;
        uint256 dailyCap;
        uint256 minLiquidReserve;
        uint256 newPayeeCooldown;
        uint256 minTicket;
    }

    struct Payee {
        PayeeStatus status;
        uint256 activeAfter;
        bytes32 metadataHash;
    }

    struct Obligation {
        bytes32 id;
        address payee;
        uint256 amount;
        uint256 dueTs;
        uint16 discountBps;
        uint256 discountDeadlineTs;
        bool requiresReceipt;
        bool received;
        ObligationKind kind;
        bytes32 documentHash;
        bool paid;
    }

    struct Venue {
        bool enabled;
        uint16 maxBps; // Max basis points of total treasury (e.g. 5000 = 50%)
        uint256 principalDeployed;
    }

    Policy public policy;

    // Daily spent tracking: dayIndex => amount
    mapping(uint256 => uint256) public dailySpent;

    mapping(address => Payee) public payees;
    mapping(bytes32 => Obligation) public obligations;
    mapping(address => Venue) public venues;

    uint256 public totalRegisteredPayables;
    uint256 public totalPaidToDate;

    // Known Arc Testnet blocklisted address
    address public constant ARC_BLOCKLISTED_ADDRESS = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

    // --- Events ---
    event PolicyUpdated(uint256 perTxCap, uint256 dailyCap, uint256 minLiquidReserve, uint256 newPayeeCooldown, uint256 minTicket);
    event RolesUpdated(address owner, address registrar, address agent, address guardian);
    event PayeeProposed(address indexed payee, bytes32 metaHash, uint256 activeAfter);
    event PayeeApproved(address indexed payee);
    event PayeeRevoked(address indexed payee);
    event ObligationRegistered(
        bytes32 indexed id,
        address indexed payee,
        uint256 amount,
        uint256 dueTs,
        uint16 discountBps,
        uint256 discountDeadlineTs,
        ObligationKind kind,
        bytes32 documentHash
    );
    event ReceiptAttested(bytes32 indexed id);
    event Paid(bytes32 indexed id, address indexed payee, uint256 amount, uint256 indexed seq);
    event Allocated(address indexed venue, uint256 amount, uint256 indexed seq);
    event Redeemed(address indexed venue, uint256 amount, uint256 indexed seq);
    event DecisionAnchored(uint256 indexed seq, bytes32 indexed decisionHash);
    event Paused(address account);
    event Unpaused(address account);
    event Rescued(address indexed token, uint256 amount);

    // --- Errors ---
    error Unauthorized();
    error ContractPaused();
    error DecimalsMismatch();
    error BlocklistedAddress();
    error ZeroAddressForbidden();
    error InvalidAmount();
    error PerTxCapExceeded();
    error DailyCapExceeded();
    error ReserveFloorBreached();
    error ObligationAlreadyPaid();
    error ObligationNotFound();
    error NotReceived();
    error PayeeNotActive();
    error ExactAmountMismatch();
    error VenueNotEnabled();
    error VenueCapacityExceeded();
    error BelowMinTicket();

    // --- Modifiers ---
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyRegistrar() {
        if (msg.sender != registrar) revert Unauthorized();
        _;
    }

    modifier onlyAgent() {
        if (msg.sender != agent) revert Unauthorized();
        _;
    }

    modifier onlyGuardianOrOwner() {
        if (msg.sender != guardian && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    constructor(
        address _usdc,
        address _owner,
        address _registrar,
        address _agent,
        address _guardian,
        Policy memory _initialPolicy
    ) {
        if (_usdc == address(0) || _owner == address(0)) revert ZeroAddressForbidden();
        usdc = IERC20(_usdc);
        
        // Assert ERC-20 6 decimals as required by PRD Section 8
        if (IERC20(_usdc).decimals() != 6) revert DecimalsMismatch();

        owner = _owner;
        registrar = _registrar;
        agent = _agent;
        guardian = _guardian;
        policy = _initialPolicy;

        emit PolicyUpdated(
            _initialPolicy.perTxCap,
            _initialPolicy.dailyCap,
            _initialPolicy.minLiquidReserve,
            _initialPolicy.newPayeeCooldown,
            _initialPolicy.minTicket
        );
        emit RolesUpdated(_owner, _registrar, _agent, _guardian);
    }

    // --- Role & Policy Management (Owner Only) ---

    function setPolicy(Policy calldata newPolicy) external onlyOwner {
        policy = newPolicy;
        emit PolicyUpdated(
            newPolicy.perTxCap,
            newPolicy.dailyCap,
            newPolicy.minLiquidReserve,
            newPolicy.newPayeeCooldown,
            newPolicy.minTicket
        );
    }

    function setRoles(address _registrar, address _agent, address _guardian) external onlyOwner {
        registrar = _registrar;
        agent = _agent;
        guardian = _guardian;
        emit RolesUpdated(owner, _registrar, _agent, _guardian);
    }

    function enableVenue(address venue, uint16 maxBps, bool enabled) external onlyOwner {
        if (venue == address(0)) revert ZeroAddressForbidden();
        venues[venue].enabled = enabled;
        venues[venue].maxBps = maxBps;
    }

    function approvePayee(address payee) external onlyOwner {
        if (payee == address(0)) revert ZeroAddressForbidden();
        if (payee == ARC_BLOCKLISTED_ADDRESS) revert BlocklistedAddress();
        payees[payee].status = PayeeStatus.Active;
        emit PayeeApproved(payee);
    }

    function revokePayee(address payee) external onlyOwner {
        payees[payee].status = PayeeStatus.Revoked;
        emit PayeeRevoked(payee);
    }

    function rescueToOwner(address token, uint256 amount) external onlyOwner {
        if (token == address(usdc)) {
            usdc.transfer(owner, amount);
        } else {
            IERC20(token).transfer(owner, amount);
        }
        emit Rescued(token, amount);
    }

    // --- Intake & Registration (Registrar Only) ---

    function proposePayee(address payee, bytes32 metaHash) external onlyRegistrar {
        if (payee == address(0)) revert ZeroAddressForbidden();
        if (payee == ARC_BLOCKLISTED_ADDRESS) revert BlocklistedAddress();

        uint256 activeAfter = block.timestamp + policy.newPayeeCooldown;
        payees[payee] = Payee({
            status: PayeeStatus.Pending,
            activeAfter: activeAfter,
            metadataHash: metaHash
        });

        emit PayeeProposed(payee, metaHash, activeAfter);
    }

    function registerObligation(
        bytes32 id,
        address payee,
        uint256 amount,
        uint256 dueTs,
        uint16 discountBps,
        uint256 discountDeadlineTs,
        bool requiresReceipt,
        ObligationKind kind,
        bytes32 documentHash
    ) external onlyRegistrar {
        if (obligations[id].payee != address(0)) revert ObligationAlreadyPaid();
        if (amount == 0) revert InvalidAmount();
        
        // Payee must be active (either approved by owner or cooldown elapsed)
        Payee memory p = payees[payee];
        bool isActive = (p.status == PayeeStatus.Active) ||
            (p.status == PayeeStatus.Pending && block.timestamp >= p.activeAfter);
        if (!isActive) revert PayeeNotActive();

        obligations[id] = Obligation({
            id: id,
            payee: payee,
            amount: amount,
            dueTs: dueTs,
            discountBps: discountBps,
            discountDeadlineTs: discountDeadlineTs,
            requiresReceipt: requiresReceipt,
            received: !requiresReceipt, // auto-received if receipt not required
            kind: kind,
            documentHash: documentHash,
            paid: false
        });

        totalRegisteredPayables += amount;

        emit ObligationRegistered(
            id,
            payee,
            amount,
            dueTs,
            discountBps,
            discountDeadlineTs,
            kind,
            documentHash
        );
    }

    function attestReceipt(bytes32 id) external onlyRegistrar {
        Obligation storage ob = obligations[id];
        if (ob.payee == address(0)) revert ObligationNotFound();
        ob.received = true;
        emit ReceiptAttested(id);
    }

    // --- Execution & Actions (Agent Only) ---

    /**
     * @notice Pays an obligation strictly matching either full amount or exact discount inside window
     */
    function payObligation(
        bytes32 id,
        uint256 amount,
        bytes32 decisionHash
    ) external onlyAgent whenNotPaused returns (uint256 seq) {
        Obligation storage ob = obligations[id];
        if (ob.payee == address(0)) revert ObligationNotFound();
        if (ob.paid) revert ObligationAlreadyPaid();
        if (ob.requiresReceipt && !ob.received) revert NotReceived();

        Payee memory p = payees[ob.payee];
        bool isActive = (p.status == PayeeStatus.Active) ||
            (p.status == PayeeStatus.Pending && block.timestamp >= p.activeAfter);
        if (!isActive) revert PayeeNotActive();

        // Exact amount validation: must equal full amount OR exact discount within window
        uint256 exactDue = ob.amount;
        if (ob.discountBps > 0 && block.timestamp <= ob.discountDeadlineTs) {
            uint256 discountAmount = (ob.amount * ob.discountBps) / 10000;
            exactDue = ob.amount - discountAmount;
        }

        if (amount != exactDue && amount != ob.amount) {
            revert ExactAmountMismatch();
        }

        // Policy limits & caps
        _checkAndApplyCaps(amount);

        // Reserve floor protection: discretionary payments cannot breach reserve
        uint256 currentBalance = usdc.balanceOf(address(this));
        if (ob.kind == ObligationKind.DISCRETIONARY) {
            if (currentBalance < amount + policy.minLiquidReserve) {
                revert ReserveFloorBreached();
            }
        }

        ob.paid = true;
        totalPaidToDate += amount;

        seq = nextDecisionSeq++;
        emit Paid(id, ob.payee, amount, seq);
        emit DecisionAnchored(seq, decisionHash);

        usdc.transfer(ob.payee, amount);
    }

    /**
     * @notice Allocates surplus cash to an enabled yield venue
     */
    function allocate(
        address venue,
        uint256 amount,
        bytes32 decisionHash
    ) external onlyAgent whenNotPaused returns (uint256 seq) {
        Venue storage v = venues[venue];
        if (!v.enabled) revert VenueNotEnabled();
        if (amount < policy.minTicket) revert BelowMinTicket();

        _checkAndApplyCaps(amount);

        // Reserve floor enforcement
        uint256 currentBalance = usdc.balanceOf(address(this));
        if (currentBalance < amount + policy.minLiquidReserve) {
            revert ReserveFloorBreached();
        }

        // Concentration cap check
        uint256 totalTreasury = currentBalance + _totalVenueValue();
        uint256 maxAllocation = (totalTreasury * v.maxBps) / 10000;
        if (v.principalDeployed + amount > maxAllocation) {
            revert VenueCapacityExceeded();
        }

        v.principalDeployed += amount;
        seq = nextDecisionSeq++;

        emit Allocated(venue, amount, seq);
        emit DecisionAnchored(seq, decisionHash);

        // Approve and transfer to venue adapter
        usdc.approve(venue, amount);
        IVenueAdapter(venue).deposit(amount);
    }

    /**
     * @notice Pulls funds back from yield venue into the vault
     */
    function redeem(
        address venue,
        uint256 amount,
        bytes32 decisionHash
    ) external onlyAgent whenNotPaused returns (uint256 seq) {
        Venue storage v = venues[venue];
        if (v.principalDeployed >= amount) {
            v.principalDeployed -= amount;
        } else {
            v.principalDeployed = 0;
        }

        seq = nextDecisionSeq++;
        emit Redeemed(venue, amount, seq);
        emit DecisionAnchored(seq, decisionHash);

        IVenueAdapter(venue).instantRedeem(amount);
    }

    /**
     * @notice Anchors non-money moving decisions (HOLD, ESCALATE) into vault log
     */
    function anchor(uint256 seq, bytes32 headHash) external onlyAgent whenNotPaused {
        emit DecisionAnchored(seq, headHash);
    }

    // --- Emergency & Governance (Guardian / Owner) ---

    function pause() external onlyGuardianOrOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyGuardianOrOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // --- Internal Helpers ---

    function _checkAndApplyCaps(uint256 amount) internal {
        if (amount > policy.perTxCap) revert PerTxCapExceeded();

        uint256 currentDay = block.timestamp / 86400;
        uint256 spentToday = dailySpent[currentDay];
        if (spentToday + amount > policy.dailyCap) revert DailyCapExceeded();

        dailySpent[currentDay] = spentToday + amount;
    }

    function _totalVenueValue() internal view returns (uint256 total) {
        // In full multi-venue deployment this can sum adapter totalValues
        return 0;
    }
}
