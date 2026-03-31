export const AUCTION_STATE_QUERY = `
  query AuctionState($id: ID!) {
    auction(id: $id) {
      id
      title
      description
      currentPrice
      startingPrice
      minIncrement
      currentWinnerId
      winnerName
      endTime
      category
      status
      participantCount
      bids {
        id
        amount
        status
        bidderName
        createdAt
      }
    }
  }
`;
