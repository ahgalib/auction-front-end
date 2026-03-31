export const AUCTION_STATE_QUERY = `
  query AuctionState($id: ID!) {
    auction(id: $id) {
      id
      title
      currentPrice
      minIncrement
      currentWinnerId
      endTime
      category
      status
    }
  }
`;
