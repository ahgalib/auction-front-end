export const AUCTIONS_QUERY = `
  query Auctions {
    auctions {
      id
      title
      description
      startingPrice
      currentPrice
      minIncrement
      winnerName
      endTime
      category
      status
      participantCount
    }
  }
`;
