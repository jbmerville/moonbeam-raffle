import { BigNumber } from 'ethers';

export interface RaffleTicketType {
  id: number;
  owner?: string;
  isSelected: boolean;
}

export interface RaffleHistoryType {
  winner: string;
  winningTicket: number;
  ticketPrice: number;
  totalTickets: number;
}

export interface RaffleStateType {
  tickets: RaffleTicketType[];
  ticketsLeft: RaffleTicketType[];
  ticketsBought: RaffleTicketType[];
  draftTime: Date;
  ticketPrice: BigNumber;
  raffleHistory: RaffleHistoryType[];
  maxTicketAmount: number;
  royalty: number;
  contractBalance: number;
  owner: string;
}

export interface CoinFlipStateType {
  totalVolume: number;
  totalFlips: number;
  contractBalance: number;
  royalty: number;
  maxPoolBetAmount: number;
  owner: string;
  maxPoolBetRatio: number;
}

export enum CoinFace {
  HEADS = 'HEADS',
  TAILS = 'TAILS',
}

export interface ExplorerTransactionType {
  from: string;
  to: string;
  timeStamp: string;
  value: string;
  hash: string;
  blockNumber: string;
  methodId: string;
  isError: string;
  input: string;
  blockHash: string;
}
