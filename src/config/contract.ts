import { parseAbi, defineChain } from 'viem';

export const ARC_TESTNET_CHAIN_ID = 5042002;

export const arcTestnet = defineChain({
  id: ARC_TESTNET_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'Arc',
    symbol: 'ARC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
});

export const SPUTNIK_CONTRACT_ADDRESS = '0x1C64f2052b333F03AAb7241392a5bd8E374ebD24' as const;
export const WALLETCONNECT_PROJECT_ID = 'c56788cb3743960e6b04977d3db84544';
export const DEPLOYER_ADDRESS = '0xd26b9DB3bE088A6dB91eeadEC89e781EB41a449c' as const;

export const TOKENS = {
  USDC: {
    address: '0x3600000000000000000000000000000000000000' as const,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  EURC: {
    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' as const,
    symbol: 'EURC',
    name: 'Euro Coin',
    decimals: 6,
  },
} as const;

export const SPUTNIK_ABI = parseAbi([
  'function createGroup(string name, uint8 token) returns (uint256 groupId)',
  'function addMember(uint256 groupId, address member, uint256 shareAmount)',
  'function setShareAmount(uint256 groupId, address member, uint256 shareAmount)',
  'function startCycle(uint256 groupId, address payer, uint256 deadline)',
  'function contribute(uint256 cycleId)',
  'function getPlatformStats() view returns (uint256 activeGroups, uint256 totalCollected)',
  'function getGroupsOf(address member) view returns (uint256[])',
  'function getGroupInfo(uint256 groupId) view returns (string name, address creator, uint8 token, uint256 activeCycleId, uint256 totalMembers)',
  'function getGroupMembers(uint256 groupId) view returns (address[])',
  'function getMemberShare(uint256 groupId, address member) view returns (uint256)',
  'function isGroupMember(uint256 groupId, address member) view returns (bool)',
  'function getCycleInfo(uint256 cycleId) view returns (uint256 groupId, address payer, uint256 deadline, uint256 totalExpected, uint256 totalCollected, bool isReleased)',
  'function getMemberContribution(uint256 cycleId, address member) view returns (uint256 amountPaid, bool isLate)',
  'function hasContributed(uint256 cycleId, address member) view returns (bool)',
  'function isCycleOverdue(uint256 cycleId) view returns (bool)'
]);

export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
]);

/** Format 6-decimal tokens (USDC / EURC) to clean human readable strings */
export function formatTokenAmount(amount: bigint | number | string, decimals = 6): string {
  if (typeof amount === 'number' || typeof amount === 'string') {
    return Number(amount).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  const value = Number(amount) / 10 ** decimals;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Parse human token amount (e.g. "200") to 6-decimal bigint */
export function parseTokenAmount(amountStr: string, decimals = 6): bigint {
  const clean = amountStr.replace(/,/g, '').trim();
  if (!clean || isNaN(Number(clean))) return 0n;
  const parts = clean.split('.');
  let integerPart = parts[0] || '0';
  let decimalPart = (parts[1] || '').slice(0, decimals).padEnd(decimals, '0');
  return BigInt(integerPart + decimalPart);
}

/** Truncate Ethereum address */
export function shortenAddress(address?: string | null): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
