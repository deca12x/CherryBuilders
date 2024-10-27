// A query to fetch the user's profile information
export const profileQuery = /* GraphQL */ `
  query Profile($address: Address!) {
    Socials(
      input: { filter: { dappName: { _eq: farcaster }, userAssociatedAddresses: { _eq: $address } }, blockchain: ethereum }
    ) {
      Social {
        userId
        profileName
        profileDisplayName
        profileImage
        userAddress
        connectedAddresses {
          address
          blockchain
        }
        socialCapital {
          socialCapitalRank
          socialCapitalScore
        }
        followerCount
        followingCount
        location
        profileBio
      }
    }
  }
`;
