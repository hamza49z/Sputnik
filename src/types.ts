export enum Token {
  USDC = 0,
  EURC = 1,
}

export interface Member {
  address: `0x${string}` | string;
  shareAmount: bigint; // in 6 decimals
  formattedShare: string; // e.g. "200"
  hasContributed?: boolean;
  isLate?: boolean;
  status?: 'PAID ON TIME' | 'PAID LATE' | 'NOT YET PAID';
}

export interface Cycle {
  id: bigint;
  groupId: bigint;
  payer: `0x${string}` | string;
  deadline: bigint; // Unix timestamp in seconds
  totalExpected: bigint;
  totalCollected: bigint;
  isReleased: boolean;
  isOverdue?: boolean;
}

export interface Group {
  id: bigint;
  name: string;
  creator: `0x${string}` | string;
  token: Token; // 0 = USDC, 1 = EURC
  activeCycleId: bigint;
  totalMembers: number;
  members: Member[];
  activeCycle?: Cycle | null;
  pastCycles?: Cycle[];
}

export interface PlatformStats {
  activeGroups: bigint;
  cyclesCompleted: bigint;
  totalCollected: bigint;
}

export interface ContributionRecord {
  id: string;
  groupId: bigint;
  groupName: string;
  cycleId: bigint;
  amount: bigint;
  token: Token;
  date: string; // formatted date string
  timestamp: number;
  isLate: boolean;
  txHash?: string;
}
