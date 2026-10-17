import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  defineChain,
  parseAbi,
  type PublicClient,
  type WalletClient,
  type Address,
  type Hash,
  type TransactionReceipt
} from 'viem';

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';
export const ARC_EXPLORER_URL = process.env.NEXT_PUBLIC_ARC_EXPLORER_URL || 'https://testnet.arcscan.app';
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000') as Address;

export const arcTestnetChain = defineChain({
  id: ARC_TESTNET_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: [ARC_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: ARC_EXPLORER_URL },
  },
});

export const EUTHYNA_VAULT_ABI = parseAbi([
  'constructor(address _usdc, address _owner, address _registrar, address _agent, address _guardian, (uint256 perTxCap, uint256 dailyCap, uint256 minLiquidReserve, uint256 newPayeeCooldown, uint256 minTicket) _initialPolicy)',
  'function owner() view returns (address)',
  'function registrar() view returns (address)',
  'function agent() view returns (address)',
  'function guardian() view returns (address)',
  'function paused() view returns (bool)',
  'function totalPaidToDate() view returns (uint256)',
  'function totalRegisteredPayables() view returns (uint256)',
  'function policy() view returns (uint256 perTxCap, uint256 dailyCap, uint256 minLiquidReserve, uint256 newPayeeCooldown, uint256 minTicket)',
  'function payees(address payee) view returns (uint8 status, uint256 activeAfter, bytes32 metadataHash)',
  'function obligations(bytes32 id) view returns (bytes32 id, address payee, uint256 amount, uint256 dueTs, uint16 discountBps, uint256 discountDeadlineTs, bool requiresReceipt, bool received, uint8 kind, bytes32 documentHash, bool paid)',
  'function approvePayee(address payee) external',
  'function revokePayee(address payee) external',
  'function proposePayee(address payee, bytes32 metaHash) external',
  'function registerObligation(bytes32 id, address payee, uint256 amount, uint256 dueTs, uint16 discountBps, uint256 discountDeadlineTs, bool requiresReceipt, uint8 kind, bytes32 documentHash) external',
  'function attestReceipt(bytes32 id) external',
  'function payObligation(bytes32 id, uint256 amount, bytes32 decisionHash) external returns (uint256 seq)',
  'function allocate(address venue, uint256 amount, bytes32 decisionHash) external returns (uint256 seq)',
  'function redeem(address venue, uint256 amount, bytes32 decisionHash) external returns (uint256 seq)',
  'function anchor(uint256 seq, bytes32 headHash) external',
  'function pause() external',
  'function unpause() external',
  'function setRoles(address _registrar, address _agent, address _guardian) external',
  'function setPolicy((uint256 perTxCap, uint256 dailyCap, uint256 minLiquidReserve, uint256 newPayeeCooldown, uint256 minTicket) newPolicy) external',
  'function rescueToOwner(address token, uint256 amount) external',
  'event PolicyUpdated(uint256 perTxCap, uint256 dailyCap, uint256 minLiquidReserve, uint256 newPayeeCooldown, uint256 minTicket)',
  'event RolesUpdated(address owner, address registrar, address agent, address guardian)',
  'event PayeeProposed(address indexed payee, bytes32 metaHash, uint256 activeAfter)',
  'event PayeeApproved(address indexed payee)',
  'event PayeeRevoked(address indexed payee)',
  'event ObligationRegistered(bytes32 indexed id, address indexed payee, uint256 amount, uint256 dueTs, uint16 discountBps, uint256 discountDeadlineTs, uint8 kind, bytes32 documentHash)',
  'event ReceiptAttested(bytes32 indexed id)',
  'event Paid(bytes32 indexed id, address indexed payee, uint256 amount, uint256 indexed seq)',
  'event DecisionAnchored(uint256 indexed seq, bytes32 indexed decisionHash)',
  'event Paused(address account)',
  'event Unpaused(address account)'
]);

export const IERC20_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)'
]);

let cachedPublicClient: PublicClient | null = null;

export function getPublicClient(): PublicClient {
  if (!cachedPublicClient) {
    cachedPublicClient = createPublicClient({
      chain: arcTestnetChain,
      transport: http(ARC_RPC_URL),
    });
  }
  return cachedPublicClient;
}

export function getBrowserWalletClient(): WalletClient | null {
  if (typeof window === 'undefined') return null;
  const ethereum = (window as unknown as { ethereum?: any }).ethereum;
  if (!ethereum) return null;

  return createWalletClient({
    chain: arcTestnetChain,
    transport: custom(ethereum),
  });
}

export interface VaultOnchainState {
  isDeployed: boolean;
  vaultAddress: Address;
  owner: Address | null;
  registrar: Address | null;
  agent: Address | null;
  guardian: Address | null;
  paused: boolean;
  liquidBalanceUsdc: string;
  totalPaidUsdc: string;
  totalRegisteredUsdc: string;
  perTxCapUsdc: string;
  dailyCapUsdc: string;
  minLiquidReserveUsdc: string;
}

export async function readVaultState(vaultAddress: Address): Promise<VaultOnchainState> {
  const client = getPublicClient();

  try {
    const code = await client.getBytecode({ address: vaultAddress });
    if (!code || code === '0x' || code.length <= 2) {
      return {
        isDeployed: false,
        vaultAddress,
        owner: null,
        registrar: null,
        agent: null,
        guardian: null,
        paused: false,
        liquidBalanceUsdc: '0.00',
        totalPaidUsdc: '0.00',
        totalRegisteredUsdc: '0.00',
        perTxCapUsdc: '0.00',
        dailyCapUsdc: '0.00',
        minLiquidReserveUsdc: '0.00'
      };
    }

    const [
      owner,
      registrar,
      agent,
      guardian,
      paused,
      totalPaid,
      totalRegistered,
      policy,
      usdcBalance
    ] = await Promise.all([
      client.readContract({ address: vaultAddress, abi: EUTHYNA_VAULT_ABI, functionName: 'owner' }).catch(() => null),
      client.readContract({ address: vaultAddress, abi: EUTHYNA_VAULT_ABI, functionName: 'registrar' }).catch(() => null),
      client.readContract({ address: vaultAddress, abi: EUTHYNA_VAULT_ABI, functionName: 'agent' }).catch(() => null),
      client.readContract({ address: vaultAddress, abi: EUTHYNA_VAULT_ABI, functionName: 'guardian' }).catch(() => null),
      client.readContract({ address: vaultAddress, abi: EUTHYNA_VAULT_ABI, functionName: 'paused' }).catch(() => false),
      client.readContract({ address: vaultAddress, abi: EUTHYNA_VAULT_ABI, functionName: 'totalPaidToDate' }).catch(() => 0n),
      client.readContract({ address: vaultAddress, abi: EUTHYNA_VAULT_ABI, functionName: 'totalRegisteredPayables' }).catch(() => 0n),
      client.readContract({ address: vaultAddress, abi: EUTHYNA_VAULT_ABI, functionName: 'policy' }).catch(() => [0n, 0n, 0n, 0n, 0n] as const),
      client.readContract({ address: USDC_ADDRESS, abi: IERC20_ABI, functionName: 'balanceOf', args: [vaultAddress] }).catch(() => 0n)
    ]);

    return {
      isDeployed: true,
      vaultAddress,
      owner,
      registrar,
      agent,
      guardian,
      paused: Boolean(paused),
      liquidBalanceUsdc: (Number(usdcBalance) / 1e6).toFixed(2),
      totalPaidUsdc: (Number(totalPaid) / 1e6).toFixed(2),
      totalRegisteredUsdc: (Number(totalRegistered) / 1e6).toFixed(2),
      perTxCapUsdc: (Number(policy[0]) / 1e6).toFixed(2),
      dailyCapUsdc: (Number(policy[1]) / 1e6).toFixed(2),
      minLiquidReserveUsdc: (Number(policy[2]) / 1e6).toFixed(2)
    };
  } catch (error) {
    console.error('Error reading vault state:', error);
    return {
      isDeployed: false,
      vaultAddress,
      owner: null,
      registrar: null,
      agent: null,
      guardian: null,
      paused: false,
      liquidBalanceUsdc: '0.00',
      totalPaidUsdc: '0.00',
      totalRegisteredUsdc: '0.00',
      perTxCapUsdc: '0.00',
      dailyCapUsdc: '0.00',
      minLiquidReserveUsdc: '0.00'
    };
  }
}

export interface TxResult {
  hash: Hash;
  receipt: TransactionReceipt;
  blockNumber: bigint;
  status: 'success' | 'reverted';
  explorerUrl: string;
}

export async function executeApprovePayee(
  walletClient: WalletClient,
  account: Address,
  vaultAddress: Address,
  payeeAddress: Address
): Promise<TxResult> {
  const publicClient = getPublicClient();

  const hash = await walletClient.writeContract({
    account,
    chain: arcTestnetChain,
    address: vaultAddress,
    abi: EUTHYNA_VAULT_ABI,
    functionName: 'approvePayee',
    args: [payeeAddress]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    hash,
    receipt,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 'success' ? 'success' : 'reverted',
    explorerUrl: `${ARC_EXPLORER_URL}/tx/${hash}`
  };
}

export async function executeRevokePayee(
  walletClient: WalletClient,
  account: Address,
  vaultAddress: Address,
  payeeAddress: Address
): Promise<TxResult> {
  const publicClient = getPublicClient();

  const hash = await walletClient.writeContract({
    account,
    chain: arcTestnetChain,
    address: vaultAddress,
    abi: EUTHYNA_VAULT_ABI,
    functionName: 'revokePayee',
    args: [payeeAddress]
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    hash,
    receipt,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 'success' ? 'success' : 'reverted',
    explorerUrl: `${ARC_EXPLORER_URL}/tx/${hash}`
  };
}

export async function executePauseVault(
  walletClient: WalletClient,
  account: Address,
  vaultAddress: Address
): Promise<TxResult> {
  const publicClient = getPublicClient();

  const hash = await walletClient.writeContract({
    account,
    chain: arcTestnetChain,
    address: vaultAddress,
    abi: EUTHYNA_VAULT_ABI,
    functionName: 'pause'
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    hash,
    receipt,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 'success' ? 'success' : 'reverted',
    explorerUrl: `${ARC_EXPLORER_URL}/tx/${hash}`
  };
}

export async function executeUnpauseVault(
  walletClient: WalletClient,
  account: Address,
  vaultAddress: Address
): Promise<TxResult> {
  const publicClient = getPublicClient();

  const hash = await walletClient.writeContract({
    account,
    chain: arcTestnetChain,
    address: vaultAddress,
    abi: EUTHYNA_VAULT_ABI,
    functionName: 'unpause'
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return {
    hash,
    receipt,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 'success' ? 'success' : 'reverted',
    explorerUrl: `${ARC_EXPLORER_URL}/tx/${hash}`
  };
}

export async function deployVaultViaMetaMask(
  account: Address
): Promise<TxResult & { contractAddress: Address }> {
  const publicClient = getPublicClient();

  const artifactRes = await fetch('/api/deploy/artifact');
  const { vaultBytecode } = await artifactRes.json();
  if (!vaultBytecode) {
    throw new Error('Could not fetch vault compiled bytecode from server');
  }

  const initialPolicy = {
    perTxCap: 5000_000000n,
    dailyCap: 8000_000000n,
    minLiquidReserve: 3000_000000n,
    newPayeeCooldown: 86400n,
    minTicket: 100_000000n,
  };

  const { encodeDeployData } = await import('viem');
  const deployData = encodeDeployData({
    abi: EUTHYNA_VAULT_ABI,
    bytecode: vaultBytecode as `0x${string}`,
    args: [
      USDC_ADDRESS,
      account, // owner
      account, // registrar
      account, // agent
      account, // guardian
      initialPolicy
    ]
  });

  const ethereum = (window as unknown as { ethereum?: any }).ethereum;
  if (!ethereum) {
    throw new Error('MetaMask or Web3 extension not found in browser');
  }

  // Broadcast real onchain contract deployment transaction through MetaMask
  const hash = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: account,
      data: deployData
    }]
  }) as Hash;

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) {
    throw new Error(`Transaction mined but contract address was not returned. Status: ${receipt.status}`);
  }

  // Record deployment via API into deployments.json
  await fetch('/api/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vaultAddress: receipt.contractAddress,
      txHash: hash,
      deployerAddress: account
    })
  });

  return {
    hash,
    receipt,
    contractAddress: receipt.contractAddress,
    blockNumber: receipt.blockNumber,
    status: receipt.status === 'success' ? 'success' : 'reverted',
    explorerUrl: `${ARC_EXPLORER_URL}/address/${receipt.contractAddress}`
  };
}


