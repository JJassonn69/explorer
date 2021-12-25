import { Delegator, Round, UnbondingLock } from "../@types";
import Utils from "web3-utils";
import url from "url";
import parseDomain from "parse-domain";
import { ethers } from "ethers";
import { gql } from "@apollo/client";
import Numeral from "numeral";
import { blockClient } from "../core/apollo";
import { request } from "graphql-request";
import bondingManagerABI from "../abis/bondingManager.json";
import ThreeBox from "3box";

export const NETWORKS = {
  mainnet: {
    bondingManager: "0x511bc4556d823ae99630ae8de28b9b80df90ea2e",
  },
  rinkeby: {
    bondingManager: "0xe75a5DccfFe8939F7f16CC7f63EB252bB542FE95",
  },
  arbitrum: {
    l1GatewayRouter: "0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef",
    l2GatewayRouter: "0x5288c571Fd7aD117beA99bF60FE0846C4E84F933",
    inbox: "0x4c6f947Ae67F572afa4ae0730947DE7C874F95Ef",
    outbox: "0x760723CD2e632826c38Fef8CD438A4CC7E7E1A40",
    arbRetryableTx: "0x000000000000000000000000000000000000006E",
    nodeInterface: "0x00000000000000000000000000000000000000C8",
  },
  "arbitrum-rinkeby": {
    l1GatewayRouter: "0x70C143928eCfFaf9F5b406f7f4fC28Dc43d68380",
    l2GatewayRouter: "0x9413AD42910c1eA60c737dB5f58d1C504498a3cD",
    inbox: "0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e",
    outbox: "0x2360A33905dc1c72b12d975d975F42BaBdcef9F3",
    arbRetryableTx: "0x000000000000000000000000000000000000006E",
    nodeInterface: "0x00000000000000000000000000000000000000C8",
  },
};

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_NETWORK === "mainnet"
    ? process.env.NEXT_PUBLIC_RPC_URL_1
    : process.env.NEXT_PUBLIC_RPC_URL_4
);

export const bondingManagerContract = new ethers.Contract(
  NETWORKS[process.env.NEXT_PUBLIC_NETWORK].bondingManager,
  bondingManagerABI,
  provider
);

export function avg(obj, key) {
  const arr = Object.values(obj);
  const sum = (prev, cur) => ({ [key]: prev[key] + cur[key] });
  return arr.reduce(sum)[key] / arr.length;
}

export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

export const abbreviateNumber = (value, precision = 3) => {
  let newValue = value;
  const suffixes = ["", "K", "M", "B", "T"];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum++;
  }

  newValue = parseFloat(Number.parseFloat(newValue).toPrecision(precision));

  newValue += suffixes[suffixNum];
  return newValue;
};

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getDelegationStatusColor = (status) => {
  if (status === "Bonded") {
    return "$primary";
  } else if (status === "Unbonding") {
    return "yellow";
  } else if (status === "Pending") {
    return "blue";
  } else {
    return "$muted";
  }
};

export const getDelegatorStatus = (
  delegator: Delegator,
  currentRound: Round
): string => {
  if (!+delegator?.bondedAmount) {
    return "Unbonded";
  } else if (
    delegator.unbondingLocks.filter(
      (lock: UnbondingLock) =>
        lock.withdrawRound && lock.withdrawRound > parseInt(currentRound.id, 10)
    ).length > 0
  ) {
    return "Unbonding";
  } else if (delegator.startRound > parseInt(currentRound.id, 10)) {
    return "Pending";
  } else if (
    delegator.startRound > 0 &&
    delegator.startRound <= parseInt(currentRound.id, 10)
  ) {
    return "Bonded";
  } else {
    return "Unbonded";
  }
};

export const MAXIUMUM_VALUE_UINT256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export const removeURLParameter = (_url, _parameter) => {
  //prefer to use l.search if you have a location/link object
  var urlparts = _url.split("?");
  if (urlparts.length >= 2) {
    var prefix = encodeURIComponent(_parameter) + "=";
    var pars = urlparts[1].split(/[&;]/g);

    //reverse iteration as may be destructive
    for (var i = pars.length; i-- > 0; ) {
      //idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    return urlparts[0] + (pars.length > 0 ? "?" + pars.join("&") : "");
  }
  return _url;
};

export const nl2br = (str, is_xhtml = true) => {
  if (typeof str === "undefined" || str === null) {
    return "";
  }
  var breakTag =
    is_xhtml || typeof is_xhtml === "undefined" ? "<br />" : "<br>";
  return (str + "").replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    "$1" + breakTag + "$2"
  );
};

export const textTruncate = (str, length, ending) => {
  if (length === null) {
    length = 100;
  }
  if (ending === null) {
    ending = "...";
  }
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  } else {
    return str;
  }
};

export const networksTypes = {
  1: "mainnet",
  4: "rinkeby",
  42161: "arbitrum",
  421611: "arbitrum-rinkeby",
};

const networksIds = {
  main: 1,
  mainnet: 1,
  morden: 2,
  ropsten: 3,
  kovan: 42,
  rinkeby: 4,
  arbitrum: 42161,
  "arbitrum-rinkeby": 421611,
};

export const detectNetwork = async (provider) => {
  let netId = null;

  if (provider instanceof Object) {
    // MetamaskInpageProvider
    if (
      provider.publicConfigStore &&
      provider.publicConfigStore._state &&
      provider.publicConfigStore._state.networkVersion
    ) {
      netId = provider.publicConfigStore._state.networkVersion;

      // Web3.providers.HttpProvider
    } else if (provider.host) {
      const parsed = url.parse(provider.host);
      const { subdomain, domain, tld } = parseDomain(parsed.host);

      if (domain === "infura" && tld === "io") {
        netId = networksIds[subdomain];
      }
    }
  } else if (typeof window !== "undefined" && window["web3"]) {
    if (window["web3"].version && window["web3"].version.getNetwork) {
      netId = await window["web3"].version.getNetwork();

      // web3.js v1.0+
    } else if (
      window["web3"].eth &&
      window["web3"].eth.net &&
      window["web3"].eth.net.getId
    ) {
      netId = await window["web3"].eth.net.getId();
    }
  }

  if (netId === undefined) {
    netId = null;
  }

  const type = networksTypes[netId] || "unknown";

  return {
    id: netId,
    type: type,
  };
};

export const checkAddressEquality = (address1, address2) => {
  if (!isAddress(address1) || !isAddress(address2)) {
    return false;
  }
  return (
    Utils.toChecksumAddress(address1) === Utils.toChecksumAddress(address2)
  );
};

export const txMessages = {
  approve: {
    pending: "Approving LPT",
    confirmed: "LPT Approved",
  },
  bond: {
    pending: "Delegating LPT",
    confirmed: "LPT Delegated",
  },
  unbond: {
    pending: "Undelegating LPT",
    confirmed: "LPT Undelegated",
  },
  rebond: {
    pending: "Redelegating LPT",
    confirmed: "LPT Redelegated",
  },
  rebondFromUnbonded: {
    pending: "Redelegating LPT",
    confirmed: "LPT Redelegated",
  },
  createPoll: {
    pending: "Creating Poll",
    confirmed: "Poll Created",
  },
  vote: {
    pending: "Casting Vote",
    confirmed: "Vote Casted",
  },
  withdrawFees: {
    pending: "Withdrawing Fees",
    confirmed: "Fees Withdrawn",
  },
  withdrawStake: {
    pending: "Withdrawing Stake",
    confirmed: "Stake Withdrawn",
  },
  batchClaimEarnings: {
    pending: "Claiming Earnings",
    confirmed: "Earnings Claimed",
  },
};

export const initTransaction = async (client, mutation) => {
  try {
    client.writeQuery({
      query: gql`
        query {
          txSummaryModal {
            __typename
            open
            error
          }
        }
      `,
      data: {
        txSummaryModal: {
          __typename: "TxSummaryModal",
          open: true,
          error: false,
        },
      },
    });

    await mutation();

    client.writeQuery({
      query: gql`
        query {
          txSummaryModal {
            __typename
            open
            error
          }
        }
      `,
      data: {
        txSummaryModal: {
          __typename: "TxSummaryModal",
          open: false,
          error: false,
        },
      },
    });
  } catch (e) {
    client.writeQuery({
      query: gql`
        query {
          txSummaryModal {
            __typename
            open
            error
          }
        }
      `,
      data: {
        txSummaryModal: {
          __typename: "TxSummaryModal",
          open: true,
          error: true,
        },
      },
    });

    return {
      error: e.message.replace("GraphQL error: ", ""),
    };
  }
};

export const getBlock = async () => {
  const blockDataResponse = await fetch(
    `https://${
      process.env.NEXT_PUBLIC_NETWORK === "rinkeby" ? "api-rinkeby" : "api"
    }.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${
      process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
    }`
  );
  const { result } = await blockDataResponse.json();
  return Utils.hexToNumber(result);
};

export const getBlockByNumber = async (number) => {
  const blockDataResponse = await fetch(
    `https://${
      process.env.NEXT_PUBLIC_NETWORK === "rinkeby" ? "api-rinkeby" : "api"
    }.etherscan.io/api?module=block&action=getblockreward&blockno=${number}&apikey=${
      process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
    }`
  );
  const { result } = await blockDataResponse.json();
  return result;
};

export const getEstimatedBlockCountdown = async (number) => {
  const countdownRaw = await fetch(
    `https://${
      process.env.NEXT_PUBLIC_NETWORK === "rinkeby" ? "api-rinkeby" : "api"
    }.etherscan.io/api?module=block&action=getblockcountdown&blockno=${number}&apikey=${
      process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
    }`
  );
  const { result } = await countdownRaw.json();
  return result;
};

export const expandedPriceLabels = {
  pixel: "pixel",
  "1m pixels": "1 million pixels",
  "1b pixels": "1 billion pixels",
  "1t pixels": "1 trillion pixels",
};

export const mergeObjectsInUnique = (array, property) => {
  const newArray = new Map();

  array.forEach((item) => {
    const propertyValue = item[property];
    newArray.has(propertyValue)
      ? newArray.set(propertyValue, { ...item, ...newArray.get(propertyValue) })
      : newArray.set(propertyValue, item);
  });

  return Array.from(newArray.values());
};

export const getHint = (id, transcoders) => {
  const hint = {
    newPosPrev: EMPTY_ADDRESS,
    newPosNext: EMPTY_ADDRESS,
  };

  if (!transcoders.length || !id) {
    return hint;
  }

  const index = transcoders.findIndex(
    (t) => t.id.toLowerCase() === id.toLowerCase()
  );

  // if transcoder is not in active set return
  if (index < 0) {
    return hint;
  } else if (index === 0) {
    // if transcoder is the first in the active set, only set posNex
    hint.newPosNext = transcoders[index + 1].id;
  } else if (index === transcoders.length - 1) {
    // if transcoder is the last in the active set, only set posPrev
    hint.newPosPrev = transcoders[index - 1].id;
  } else {
    hint.newPosNext = transcoders[index + 1].id;
    hint.newPosPrev = transcoders[index - 1].id;
  }
  return hint;
};

export const simulateNewActiveSetOrder = ({
  action,
  transcoders,
  amount,
  newDelegate,
  oldDelegate = EMPTY_ADDRESS,
}) => {
  const index = transcoders.findIndex(
    (t) => t.id.toLowerCase() === newDelegate.toLowerCase()
  );

  if (index < 0) {
    return transcoders;
  }

  if (action === "stake") {
    transcoders[index].totalStake = +transcoders[index].totalStake + +amount;

    // if delegator is moving stake, subtract amount from old delegate
    if (
      oldDelegate &&
      oldDelegate.toLowerCase() !== newDelegate.toLowerCase() &&
      oldDelegate.toLowerCase() !== EMPTY_ADDRESS
    ) {
      const oldDelegateIndex = transcoders.findIndex(
        (t) => t.id.toLowerCase() === oldDelegate.toLowerCase()
      );
      if (oldDelegateIndex !== -1) {
        transcoders[oldDelegateIndex].totalStake =
          +transcoders[oldDelegateIndex].totalStake - +amount;
      }
    }
  } else {
    transcoders[index].totalStake = +transcoders[index].totalStake - +amount;
  }

  // reorder transcoders array
  return transcoders.sort((a, b) => +a.totalStake - +b.totalStake);
};

export const isAddress = (address) => {
  try {
    ethers.utils.getAddress(address);
  } catch (e) {
    return false;
  }
  return true;
};

export const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const toK = (num) => {
  return Numeral(num).format("0.[00]a");
};

export const formattedNum = (number, unit = "usd") => {
  if (isNaN(number) || number === "" || number === undefined) {
    return unit === "usd" ? "$0" : 0;
  }
  const num = parseFloat(number);

  if (num > 500000000) {
    return `${
      (unit === "usd" ? "$" : "") + toK(num.toFixed(0)) + unit === "minutes"
        ? unit
        : ""
    }`;
  }

  if (num === 0) {
    if (unit === "usd") {
      return "$0";
    }
    if (unit === "minutes") {
      return "0 minutes";
    }
    return 0;
  }

  if (num < 0.0001 && num > 0) {
    if (unit === "usd") {
      return "< $0.0001";
    }
    if (unit === "minutes") {
      return "< 0.0001 minutes";
    }
    return "< 0.0001";
  }

  if (num > 1000) {
    if (unit === "usd") {
      return "$" + Number(num.toFixed(0)).toLocaleString();
    }
    if (unit === "minutes") {
      return Number(num.toFixed(0)).toLocaleString() + " minutes";
    }
    return Number(num.toFixed(0)).toLocaleString();
  }

  if (unit === "usd") {
    if (num < 0.1) {
      return "$" + Number(num.toFixed(4));
    } else {
      const usdString = priceFormatter.format(num);
      return "$" + usdString.slice(1, usdString.length);
    }
  }
  if (unit === "minutes") {
    if (num < 0.1) {
      return Number(num.toFixed(4)) + " minutes";
    } else {
      return Number(num.toFixed(0)) + " minutes";
    }
  }
  return Number(num.toFixed(5));
};

/**
 * gets the amount difference plus the % change in change itself (second order change)
 * @param {*} valueNow
 * @param {*} valueAsOfPeriodOne
 * @param {*} valueAsOfPeriodTwo
 */
export const getTwoPeriodPercentChange = (
  valueNow: number,
  valueAsOfPeriodOne: number,
  valueAsOfPeriodTwo: number
) => {
  // get volume info for both 24 hour periods
  const currentChange = valueNow - valueAsOfPeriodOne;
  const previousChange = valueAsOfPeriodOne - valueAsOfPeriodTwo;

  const adjustedPercentChange =
    ((currentChange - previousChange) / previousChange) * 100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export const getBlocksFromTimestamps = async (timestamps) => {
  if (!timestamps?.length) {
    return [];
  }
  const blocks = [];
  for (const timestamp of timestamps) {
    const { data } = await blockClient.query({
      query: gql`
        query blocks($timestampFrom: Int!, $timestampTo: Int!) {
          blocks(
            first: 1
            orderBy: timestamp
            orderDirection: asc
            where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
          ) {
            id
            number
            timestamp
          }
        }
      `,
      fetchPolicy: "network-only",
      variables: { timestampFrom: timestamp, timestampTo: timestamp + 600 },
    });
    blocks.push(+data.blocks[0].number);
  }

  return blocks;
};

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow, value24HoursAgo) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) /
      parseFloat(value24HoursAgo)) *
    100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

type LivepeerComUsageParams = {
  fromTime: number;
  toTime: number;
};

export const getLivepeerComUsageData = async (
  params?: LivepeerComUsageParams
) => {
  try {
    const endpoint = `https://livepeer.com/api/usage${
      params ? `?fromTime=${params.fromTime}&toTime=${params.toTime}` : ""
    }`;

    const livepeerComUsageDataReponse = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.LIVEPEER_COM_API_ADMIN_TOKEN}`,
      },
    });

    const livepeerComUsageData = await livepeerComUsageDataReponse.json();

    // convert date format from milliseconds to seconds before merging
    return livepeerComUsageData.map((day) => ({
      ...day,
      date: day.date / 1000,
    }));
  } catch (e) {
    console.log(e);
  }
};

export const getTotalFeeDerivedMinutes = ({
  totalVolumeETH,
  totalVolumeUSD,
  pricePerPixel,
  pixelsPerMinute,
}): number => {
  const ethDaiRate = totalVolumeETH / totalVolumeUSD;
  const usdAveragePricePerPixel = pricePerPixel / ethDaiRate;
  const feeDerivedMinutes =
    totalVolumeUSD / usdAveragePricePerPixel / pixelsPerMinute || 0;
  return feeDerivedMinutes;
};

export const scientificToDecimal = (x) => {
  if (Math.abs(x) < 1.0) {
    const e = parseInt(x.toString().split("e-")[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = "0." + new Array(e).join("0") + x.toString().substring(2);
    }
  } else {
    let e = parseInt(x.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join("0");
    }
  }
  return x;
};

export const getOrchestrators = async () => {
  const currentRoundData = await request(
    process.env.NEXT_PUBLIC_SUBGRAPH,
    gql`
      {
        protocol(id: "0") {
          currentRound {
            id
          }
        }
      }
    `
  );

  const currentRound = currentRoundData?.protocol.currentRound.id;

  const query = gql`
  {
    transcoders(
      orderBy: "totalStake"
      orderDirection: "desc"
      where: {
        activationRound_lte: ${currentRound},
        deactivationRound_gt: ${currentRound},
      }
    ) {
      id
      activationRound
      deactivationRound
      totalStake
      totalVolumeETH
      rewardCut
      feeShare
      delegator {
        startRound
      }
      pools(first: 30, orderBy: id, orderDirection: desc, where: { round_not: "${currentRound}" }) {
        rewardTokens
      }
      delegators(first: 1000) {
        id
      }
    }
    protocol(id: "0") {
      currentRound {
        id
      }
    }
  }
`;

  const subgraphData = await request(process.env.NEXT_PUBLIC_SUBGRAPH, query);

  const regions = ["FRA", "MDW", "SIN", "NYC", "LAX", "LON", "PRG"];

  let orchestrators = [];

  const response = await fetch(
    `https://leaderboard-serverless.vercel.app/api/aggregated_stats`
  );
  const performanceScores = await response.json();

  await Promise.all(
    subgraphData.transcoders.map(async (transcoder) => {
      const scores = [];
      await new Promise((resolve, _reject) => {
        regions.forEach(async (region, index, array) => {
          if (
            performanceScores[transcoder.id] &&
            performanceScores[transcoder.id][region]
          ) {
            scores.push(performanceScores[transcoder.id][region]?.score);
          }
          if (index === array.length - 1) {
            resolve(true);
          }
        });
      });

      const currentHighScore = Math.max(...scores);
      const averageScore = performanceScores[transcoder.id]
        ? avg(performanceScores[transcoder.id], "score")
        : 0;

      const space = await ThreeBox.getSpace(transcoder.id, "livepeer");

      let selfStake = "0";
      try {
        selfStake = await bondingManagerContract.pendingStake(
          transcoder.id,
          currentRound
        );
      } catch (e) {
        console.log(e);
      }

      selfStake = ethers.utils.formatUnits(selfStake, 18);
      const name = await provider.lookupAddress(transcoder.id);
      const resolver = await provider.getResolver(transcoder.id);
      const ens = {
        name,
        url: resolver ? await resolver.getText("email") : null,
        avatar: resolver ? await resolver.getText("avatar") : null,
        description: resolver ? await resolver.getText("description") : null,
      };

      orchestrators.push({
        address: transcoder.id,
        ens,
        totalStake: parseFloat(transcoder.totalStake),
        currentHighScore,
        averageScore,
        totalVolumeETH: transcoder.totalVolumeETH,
        pools: transcoder.pools,
        selfStake,
        delegatedStake:
          parseFloat(transcoder.totalStake) - parseFloat(selfStake),
        username: space?.name ? space.name : null,
        avatar: space?.image ? space.image : null,
        totalDelegators: transcoder.delegators.length,
        rewardCut: parseInt(transcoder.rewardCut, 10) / 10000,
        feeCut: 100 - parseInt(transcoder.feeShare, 10) / 10000,
      });
    })
  );
  return orchestrators;
};

export function roundToTwo(num) {
  return Math.round(num * 100 + Number.EPSILON) / 100;
}
