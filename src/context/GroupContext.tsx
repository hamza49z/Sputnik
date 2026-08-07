import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { createPublicClient, http } from 'viem';
import {
  SPUTNIK_CONTRACT_ADDRESS,
  SPUTNIK_ABI,
  ERC20_ABI,
  TOKENS,
  arcTestnet,
  DEPLOYER_ADDRESS,
  formatTokenAmount,
  parseTokenAmount,
} from '../config/contract';
import { Group, Member, Cycle, Token, PlatformStats, ContributionRecord } from '../types';

interface GroupContextType {
  groups: Group[];
  userGroups: Group[];
  stats: PlatformStats;
  contributions: ContributionRecord[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getGroupById: (id: string | bigint) => Group | undefined;
  createGroup: (name: string, token: Token, members: { address: string; shareAmount: string }[]) => Promise<bigint>;
  addMember: (groupId: bigint, memberAddress: string, shareAmount: string) => Promise<void>;
  startCycle: (groupId: bigint, payerAddress: string, deadlineDays: number) => Promise<void>;
  contribute: (cycleId: bigint, amount: bigint, tokenAddress: `0x${string}`) => Promise<{ needApprove: boolean; approved: boolean; txHash?: string }>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

// Default initial groups matching Design Images 10 & 8
const INITIAL_MOCK_GROUPS: Group[] = [
  {
    id: 1n,
    name: 'Monthly Rent',
    creator: DEPLOYER_ADDRESS,
    token: Token.USDC,
    activeCycleId: 101n,
    totalMembers: 5,
    members: [
      { address: '0x82C29B3f14a79DE1aB551a89b3E9946d4e221E5A', shareAmount: 200000000n, formattedShare: '200', status: 'PAID ON TIME' },
      { address: '0x1A41819d921389B10B46c19B8a113d762c9A9B2', shareAmount: 200000000n, formattedShare: '200', status: 'PAID LATE' },
      { address: '0x9F3e2918a25c1109aA325a3d0B474a2C193182C1', shareAmount: 200000000n, formattedShare: '200', status: 'NOT YET PAID' },
      { address: '0xd26b9DB3bE088A6dB91eeadEC89e781EB41a449c', shareAmount: 200000000n, formattedShare: '200', status: 'PAID ON TIME' },
      { address: '0x4E7092104a0e08B39B21a084120fB0C272301f21', shareAmount: 200000000n, formattedShare: '200', status: 'PAID ON TIME' },
    ],
    activeCycle: {
      id: 101n,
      groupId: 1n,
      payer: '0x82C29B3f14a79DE1aB551a89b3E9946d4e221E5A',
      deadline: BigInt(Math.floor(Date.now() / 1000) + 172800), // 2 days left
      totalExpected: 1000000000n, // 1000 USDC
      totalCollected: 750000000n, // 750 USDC
      isReleased: false,
    },
    pastCycles: [
      {
        id: 99n,
        groupId: 1n,
        payer: '0x1A41819d921389B10B46c19B8a113d762c9A9B2',
        deadline: BigInt(Math.floor(Date.now() / 1000) - 2592000),
        totalExpected: 1000000000n,
        totalCollected: 1000000000n,
        isReleased: true,
      },
    ],
  },
  {
    id: 2n,
    name: 'Summer Trip',
    creator: '0x82C29B3f14a79DE1aB551a89b3E9946d4e221E5A',
    token: Token.EURC,
    activeCycleId: 102n,
    totalMembers: 8,
    members: [
      { address: '0x82C29B3f14a79DE1aB551a89b3E9946d4e221E5A', shareAmount: 250000000n, formattedShare: '250', status: 'PAID ON TIME' },
      { address: '0xd26b9DB3bE088A6dB91eeadEC89e781EB41a449c', shareAmount: 250000000n, formattedShare: '250', status: 'PAID ON TIME' },
      { address: '0x1A41819d921389B10B46c19B8a113d762c9A9B2', shareAmount: 250000000n, formattedShare: '250', status: 'PAID ON TIME' },
      { address: '0x9F3e2918a25c1109aA325a3d0B474a2C193182C1', shareAmount: 250000000n, formattedShare: '250', status: 'PAID ON TIME' },
    ],
    activeCycle: {
      id: 102n,
      groupId: 2n,
      payer: '0xd26b9DB3bE088A6dB91eeadEC89e781EB41a449c',
      deadline: BigInt(Math.floor(Date.now() / 1000) + 432000), // 5 days left
      totalExpected: 2000000000n, // 2000 EURC
      totalCollected: 2000000000n, // 2000 EURC
      isReleased: false,
    },
    pastCycles: [],
  },
  {
    id: 3n,
    name: 'Q1 Marketing Fund',
    creator: DEPLOYER_ADDRESS,
    token: Token.USDC,
    activeCycleId: 0n,
    totalMembers: 3,
    members: [
      { address: DEPLOYER_ADDRESS, shareAmount: 2500000000n, formattedShare: '2500', status: 'PAID ON TIME' },
      { address: '0x1A41819d921389B10B46c19B8a113d762c9A9B2', shareAmount: 2500000000n, formattedShare: '2500', status: 'PAID ON TIME' },
    ],
    activeCycle: null,
    pastCycles: [
      {
        id: 88n,
        groupId: 3n,
        payer: DEPLOYER_ADDRESS,
        deadline: BigInt(Math.floor(Date.now() / 1000) - 5000000),
        totalExpected: 5000000000n,
        totalCollected: 5000000000n,
        isReleased: true,
      },
    ],
  },
  {
    id: 4n,
    name: 'Pizza Friday',
    creator: '0x9F3e2918a25c1109aA325a3d0B474a2C193182C1',
    token: Token.USDC,
    activeCycleId: 104n,
    totalMembers: 12,
    members: [
      { address: DEPLOYER_ADDRESS, shareAmount: 10000000n, formattedShare: '10', status: 'PAID ON TIME' },
      { address: '0x9F3e2918a25c1109aA325a3d0B474a2C193182C1', shareAmount: 10000000n, formattedShare: '10', status: 'PAID ON TIME' },
    ],
    activeCycle: {
      id: 104n,
      groupId: 4n,
      payer: '0x9F3e2918a25c1109aA325a3d0B474a2C193182C1',
      deadline: BigInt(Math.floor(Date.now() / 1000) + 86400),
      totalExpected: 120000000n, // 120 USDC
      totalCollected: 45000000n,  // 45 USDC
      isReleased: false,
    },
    pastCycles: [],
  },
];

const INITIAL_CONTRIBUTIONS: ContributionRecord[] = [
  {
    id: 'tx-1',
    groupId: 1n,
    groupName: 'Monthly Rent',
    cycleId: 101n,
    amount: 200000000n,
    token: Token.USDC,
    date: 'Oct 15, 2023',
    timestamp: Date.now() - 86400000 * 20,
    isLate: false,
    txHash: '0xabc123...456',
  },
  {
    id: 'tx-2',
    groupId: 2n,
    groupName: 'Summer Trip',
    cycleId: 102n,
    amount: 150000000n,
    token: Token.USDC,
    date: 'Sep 01, 2023',
    timestamp: Date.now() - 86400000 * 50,
    isLate: true,
    txHash: '0xdef456...789',
  },
  {
    id: 'tx-3',
    groupId: 3n,
    groupName: 'Tech Fund',
    cycleId: 88n,
    amount: 500000000n,
    token: Token.USDC,
    date: 'Aug 15, 2023',
    timestamp: Date.now() - 86400000 * 80,
    isLate: false,
    txHash: '0x789ghi...012',
  },
  {
    id: 'tx-4',
    groupId: 1n,
    groupName: 'Monthly Rent',
    cycleId: 99n,
    amount: 200000000n,
    token: Token.USDC,
    date: 'Jul 15, 2023',
    timestamp: Date.now() - 86400000 * 110,
    isLate: false,
    txHash: '0x345jkl...678',
  },
];

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [groups, setGroups] = useState<Group[]>(INITIAL_MOCK_GROUPS);
  const [contributions, setContributions] = useState<ContributionRecord[]>(INITIAL_CONTRIBUTIONS);
  const [stats, setStats] = useState<PlatformStats>({
    activeGroups: 1021n,
    cyclesCompleted: 7005n,
    totalCollected: 2000000000000n, // $2.0M formatted
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch live on-chain platform stats and wallet groups
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = createPublicClient({ chain: arcTestnet, transport: http() });

      // Get platform stats from contract
      try {
        const [activeGrp, totColl] = await client.readContract({
          address: SPUTNIK_CONTRACT_ADDRESS,
          abi: SPUTNIK_ABI,
          functionName: 'getPlatformStats',
        });
        if (activeGrp > 0n || totColl > 0n) {
          setStats({
            activeGroups: activeGrp > 0n ? activeGrp : 1238n,
            cyclesCompleted: 8492n,
            totalCollected: totColl > 0n ? totColl : 2400000000000n,
          });
        }
      } catch (e) {
        console.warn('Could not read getPlatformStats:', e);
      }

      // If wallet is connected, check on-chain groups for wallet
      if (address) {
        try {
          const groupIds = await client.readContract({
            address: SPUTNIK_CONTRACT_ADDRESS,
            abi: SPUTNIK_ABI,
            functionName: 'getGroupsOf',
            args: [address],
          });

          if (groupIds && groupIds.length > 0) {
            const fetchedGroups: Group[] = [];
            for (const id of groupIds) {
              const [name, creator, token, activeCycleId, totalMembers] = await client.readContract({
                address: SPUTNIK_CONTRACT_ADDRESS,
                abi: SPUTNIK_ABI,
                functionName: 'getGroupInfo',
                args: [id],
              });

              const memberAddresses = await client.readContract({
                address: SPUTNIK_CONTRACT_ADDRESS,
                abi: SPUTNIK_ABI,
                functionName: 'getGroupMembers',
                args: [id],
              });

              const membersList: Member[] = [];
              for (const mAddr of memberAddresses) {
                const share = await client.readContract({
                  address: SPUTNIK_CONTRACT_ADDRESS,
                  abi: SPUTNIK_ABI,
                  functionName: 'getMemberShare',
                  args: [id, mAddr],
                });
                membersList.push({
                  address: mAddr,
                  shareAmount: share,
                  formattedShare: formatTokenAmount(share),
                  status: 'NOT YET PAID',
                });
              }

              let activeCycle: Cycle | null = null;
              if (activeCycleId > 0n) {
                const [gId, payer, deadline, totalExpected, totalCollected, isReleased] =
                  await client.readContract({
                    address: SPUTNIK_CONTRACT_ADDRESS,
                    abi: SPUTNIK_ABI,
                    functionName: 'getCycleInfo',
                    args: [activeCycleId],
                  });

                activeCycle = {
                  id: activeCycleId,
                  groupId: gId,
                  payer,
                  deadline,
                  totalExpected,
                  totalCollected,
                  isReleased,
                };

                // Check payment status for each member
                for (const m of membersList) {
                  try {
                    const [amountPaid, isLate] = await client.readContract({
                      address: SPUTNIK_CONTRACT_ADDRESS,
                      abi: SPUTNIK_ABI,
                      functionName: 'getMemberContribution',
                      args: [activeCycleId, m.address as `0x${string}`],
                    });
                    if (amountPaid > 0n) {
                      m.hasContributed = true;
                      m.isLate = isLate;
                      m.status = isLate ? 'PAID LATE' : 'PAID ON TIME';
                    }
                  } catch (e) {
                    // fallback
                  }
                }
              }

              fetchedGroups.push({
                id,
                name,
                creator,
                token: token as Token,
                activeCycleId,
                totalMembers: Number(totalMembers),
                members: membersList,
                activeCycle,
                pastCycles: [],
              });
            }

            // Merge fetched on-chain groups with existing initial mock groups
            setGroups((prev) => {
              const prevOther = prev.filter((p) => !fetchedGroups.some((f) => f.id === p.id));
              return [...fetchedGroups, ...prevOther];
            });
          }
        } catch (e) {
          console.warn('Could not fetch user groups on-chain:', e);
        }
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getGroupById = (id: string | bigint): Group | undefined => {
    const idBig = typeof id === 'bigint' ? id : BigInt(id);
    return groups.find((g) => g.id === idBig);
  };

  // Create a new group on-chain
  const createGroup = async (
    name: string,
    token: Token,
    members: { address: string; shareAmount: string }[]
  ): Promise<bigint> => {
    setIsLoading(true);
    try {
      let newGroupId = BigInt(Date.now());

      if (walletClient && address) {
        // Send createGroup tx to contract
        const txHash = await walletClient.writeContract({
          chain: arcTestnet,
          address: SPUTNIK_CONTRACT_ADDRESS,
          abi: SPUTNIK_ABI,
          functionName: 'createGroup',
          args: [name, token],
          account: address,
        });

        // Add members to contract
        for (const m of members) {
          const shareBig = parseTokenAmount(m.shareAmount);
          try {
            await walletClient.writeContract({
              chain: arcTestnet,
              address: SPUTNIK_CONTRACT_ADDRESS,
              abi: SPUTNIK_ABI,
              functionName: 'addMember',
              args: [newGroupId, m.address as `0x${string}`, shareBig],
              account: address,
            });
          } catch (e) {
            console.warn('Could not add member on-chain:', e);
          }
        }
      }

      // Format members for state
      const formattedMembers: Member[] = members.map((m) => ({
        address: m.address,
        shareAmount: parseTokenAmount(m.shareAmount),
        formattedShare: m.shareAmount,
        status: 'NOT YET PAID',
      }));

      // Always include creator if not present
      const creatorAddr = address || DEPLOYER_ADDRESS;
      if (!formattedMembers.some((m) => m.address.toLowerCase() === creatorAddr.toLowerCase())) {
        formattedMembers.unshift({
          address: creatorAddr,
          shareAmount: parseTokenAmount('200'),
          formattedShare: '200',
          status: 'NOT YET PAID',
        });
      }

      const newGroup: Group = {
        id: newGroupId,
        name,
        creator: creatorAddr,
        token,
        activeCycleId: 0n,
        totalMembers: formattedMembers.length,
        members: formattedMembers,
        activeCycle: null,
        pastCycles: [],
      };

      setGroups((prev) => [newGroup, ...prev]);

      return newGroupId;
    } finally {
      setIsLoading(false);
    }
  };

  // Add member to group
  const addMember = async (groupId: bigint, memberAddress: string, shareAmount: string) => {
    const shareBig = parseTokenAmount(shareAmount);
    if (walletClient && address) {
      await walletClient.writeContract({
        chain: arcTestnet,
        address: SPUTNIK_CONTRACT_ADDRESS,
        abi: SPUTNIK_ABI,
        functionName: 'addMember',
        args: [groupId, memberAddress as `0x${string}`, shareBig],
        account: address,
      });
    }

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const updatedMembers = [
            ...g.members,
            {
              address: memberAddress,
              shareAmount: shareBig,
              formattedShare: shareAmount,
              status: 'NOT YET PAID' as const,
            },
          ];
          return {
            ...g,
            totalMembers: updatedMembers.length,
            members: updatedMembers,
          };
        }
        return g;
      })
    );
  };

  // Start new cycle
  const startCycle = async (groupId: bigint, payerAddress: string, deadlineDays: number) => {
    const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + deadlineDays * 86400);

    if (walletClient && address) {
      await walletClient.writeContract({
        chain: arcTestnet,
        address: SPUTNIK_CONTRACT_ADDRESS,
        abi: SPUTNIK_ABI,
        functionName: 'startCycle',
        args: [groupId, payerAddress as `0x${string}`, deadlineTimestamp],
        account: address,
      });
    }

    const newCycleId = BigInt(Date.now());

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const totalExp = g.members.reduce((acc, m) => acc + m.shareAmount, 0n);
          const newCycle: Cycle = {
            id: newCycleId,
            groupId,
            payer: payerAddress,
            deadline: deadlineTimestamp,
            totalExpected: totalExp > 0n ? totalExp : 1000000000n,
            totalCollected: 0n,
            isReleased: false,
          };

          const resetMembers = g.members.map((m) => ({
            ...m,
            hasContributed: false,
            isLate: false,
            status: 'NOT YET PAID' as const,
          }));

          return {
            ...g,
            activeCycleId: newCycleId,
            activeCycle: newCycle,
            members: resetMembers,
          };
        }
        return g;
      })
    );
  };

  // Contribute to active cycle with allowance check & approve handling
  const contribute = async (
    cycleId: bigint,
    amount: bigint,
    tokenAddress: `0x${string}`
  ): Promise<{ needApprove: boolean; approved: boolean; txHash?: string }> => {
    if (!address || !publicClient || !walletClient) {
      // Demo simulation fallback if wallet not connected
      setGroups((prev) =>
        prev.map((g) => {
          if (g.activeCycle && g.activeCycle.id === cycleId) {
            const updatedCollected = g.activeCycle.totalCollected + amount;
            const isFull = updatedCollected >= g.activeCycle.totalExpected;

            const updatedCycle: Cycle = {
              ...g.activeCycle,
              totalCollected: updatedCollected,
              isReleased: isFull,
            };

            const updatedMembers = g.members.map((m) => {
              if (m.address.toLowerCase() === (address || DEPLOYER_ADDRESS).toLowerCase()) {
                return { ...m, hasContributed: true, isLate: false, status: 'PAID ON TIME' as const };
              }
              return m;
            });

            return {
              ...g,
              activeCycle: isFull ? null : updatedCycle,
              activeCycleId: isFull ? 0n : g.activeCycleId,
              members: updatedMembers,
              pastCycles: isFull ? [updatedCycle, ...(g.pastCycles || [])] : g.pastCycles,
            };
          }
          return g;
        })
      );

      // Record contribution
      const record: ContributionRecord = {
        id: `tx-${Date.now()}`,
        groupId: 1n,
        groupName: 'Monthly Rent',
        cycleId,
        amount,
        token: Token.USDC,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        timestamp: Date.now(),
        isLate: false,
      };
      setContributions((prev) => [record, ...prev]);

      return { needApprove: false, approved: true };
    }

    // Check ERC20 allowance first
    const currentAllowance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [address, SPUTNIK_CONTRACT_ADDRESS],
    });

    if (currentAllowance < amount) {
      // Must approve ERC20
      const approveTx = await walletClient.writeContract({
        chain: arcTestnet,
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SPUTNIK_CONTRACT_ADDRESS, amount * 100n],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash: approveTx });
      return { needApprove: true, approved: true, txHash: approveTx };
    }

    // Call contribute on-chain
    const contribTx = await walletClient.writeContract({
      chain: arcTestnet,
      address: SPUTNIK_CONTRACT_ADDRESS,
      abi: SPUTNIK_ABI,
      functionName: 'contribute',
      args: [cycleId],
      account: address,
    });

    await publicClient.waitForTransactionReceipt({ hash: contribTx });

    await refreshData();

    return { needApprove: false, approved: true, txHash: contribTx };
  };

  // Filter user groups (groups where user is creator or member)
  const userGroups = groups.filter((g) => {
    if (!address) return true; // show all when disconnected
    const userAddr = address.toLowerCase();
    const isCreator = g.creator.toLowerCase() === userAddr;
    const isMem = g.members.some((m) => m.address.toLowerCase() === userAddr);
    return isCreator || isMem;
  });

  return (
    <GroupContext.Provider
      value={{
        groups,
        userGroups,
        stats,
        contributions,
        isLoading,
        refreshData,
        getGroupById,
        createGroup,
        addMember,
        startCycle,
        contribute,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};
