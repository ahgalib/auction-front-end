export const PLACE_BID_MUTATION = `
  mutation PlaceBid($auctionId: ID!, $amount: Float!, $requestId: String) {
    placeBid(auctionId: $auctionId, amount: $amount, requestId: $requestId) {
      accepted
      currentPrice
      endTime
      errorCode
    }
  }
`;
