import { utils } from 'ethers/lib/ethers';
import { Raffle } from 'hardhat/types';

import { RaffleHistoryType, RaffleStateType, RaffleTicketType } from '@/types';

/*
 * Parse raffle history data received from smart-contract
 * @param raffleHistory - The data object received from proxy call to smart-contract
 */
function parseRaffleHistoryType(raffleHistory: Raffle.RaffleHistoryStructOutput[]): RaffleHistoryType[] {
  return raffleHistory
    .slice(0)
    .reverse()
    .map((history) => ({
      winner: history.winner,
      winningTicket: history.winningTicket.toNumber(),
      ticketPrice: parseFloat(utils.formatEther(history.ticketPrice)),
      totalTickets: history.totalTickets.toNumber(),
    }));
}

/*
 * Parse ticket data received from smart-contract into tickets bought by players and tickets available
 * @param ticketsBoughtData - The data object received from proxy call to smart-contract
 * @param maxTicketAmount - The maximum amount of tickets in the current raffle
 */
function parseRaffleTicketsBoughtData(
  ticketsBoughtData: Raffle.TicketBoughtStructOutput[],
  maxTicketAmount: number
): { tickets: RaffleTicketType[]; ticketsBought: RaffleTicketType[]; ticketsLeft: RaffleTicketType[] } {
  const tickets: RaffleTicketType[] = Array(maxTicketAmount)
    .fill({ id: -1, isSelected: false })
    .map((item, index) => ({ ...item, id: index + 1 }));
  const ticketsLeft: RaffleTicketType[] = [];
  const ticketsBought: RaffleTicketType[] = [];

  const ticketsBoughtMap = new Map(ticketsBoughtData.map((ticket) => [ticket.ticketId.toNumber(), ticket.owner]));

  // Split tickets left and tickets bought
  tickets.forEach((ticket) => {
    if (ticketsBoughtMap.has(ticket.id)) {
      ticket.owner = ticketsBoughtMap.get(ticket.id);
      ticketsBought.push(ticket);
    } else {
      ticketsLeft.push(ticket);
    }
  });

  return { tickets, ticketsBought, ticketsLeft };
}

/*
 * Get raffle states from the raffle smart-contract by querying proxy
 * @param raffleContract - The raffle object derived from smart-contract abi
 */
export async function getRaffleState(raffleContract: Raffle, library: any): Promise<RaffleStateType> {
  const [
    maxTicketAmountData,
    ticketPrice,
    draftTimeData,
    ticketsBoughtData,
    raffleHistoryData,
    royaltyData,
    contractBalanceData,
    owner,
  ] = await Promise.all([
    raffleContract.maxTicketAmount(),
    raffleContract.ticketPrice(),
    raffleContract.draftTime(),
    raffleContract.getTicketsBought(),
    raffleContract.getRaffleHistory(),
    raffleContract.royalty(),
    library.getBalance(raffleContract.address),
    raffleContract.owner(),
  ]);

  const maxTicketAmount = maxTicketAmountData.toNumber();
  const draftTime = new Date(draftTimeData.toNumber() * 1000);
  const { tickets, ticketsBought, ticketsLeft } = parseRaffleTicketsBoughtData(ticketsBoughtData, maxTicketAmount);
  const raffleHistory = parseRaffleHistoryType(raffleHistoryData);
  const royalty = royaltyData / 10; // Ex: 50  -> 5% royalty
  const contractBalance = parseFloat(utils.formatEther(contractBalanceData));

  return {
    maxTicketAmount,
    ticketPrice,
    draftTime,
    tickets,
    ticketsBought,
    ticketsLeft,
    raffleHistory,
    royalty,
    contractBalance,
    owner,
  };
}
