import { gql } from "@apollo/client";

export const accountQuery = (currentRound) => {
  return gql`
    query accountQuery($account: ID!) {
      delegator(id: $account) {
        id
        pendingStake
        bondedAmount
        principal
        unbonded
        pendingFees
        withdrawnFees
        startRound
        lastClaimRound {
          id
        }
        unbondingLocks {
          id
          amount
          unbondingLockId
          withdrawRound
          delegate {
            id
          }
        }
        delegate(id: $account) {
          id
          active
          status
          totalStake
        }
      }
      transcoder(id: $account) {
        id
        active
        feeShare
        rewardCut
        price
        status
        active
        totalStake
        totalVolumeETH
        activationRound
        deactivationRound
        lastRewardRound {
          id
        }
        pools(first: 30, orderBy: id, orderDirection: desc where: { round_not: "${currentRound}" }) {
          rewardTokens
        }
        delegators(first: 1000) {
          id
        }
      }
      account(id: $account) {
        id
        tokenBalance
        ethBalance
        allowance
      }
      protocol(id: "0") {
        id
        totalSupply
        totalActiveStake
        participationRate
        inflation
        inflationChange
        currentRound {
          id
        }
      }
    }
  `;
};
