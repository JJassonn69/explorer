import { ethers } from "ethers";

const INFURA_KEY = process.env.NEXT_PUBLIC_INFURA_KEY;

if (typeof INFURA_KEY === "undefined") {
  throw new Error(
    `NEXT_PUBLIC_INFURA_KEY must be a defined environment variable`
  );
}

/**
 * List of all the networks supported by the Livepeer Explorer
 */
export enum SupportedChainId {
  MAINNET = 1,
  RINKEBY = 4,

  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
}

export const L2_CHAIN_IDS = [
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
] as const;

export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number];

export const DEFAULT_CHAIN_ID =
  SupportedChainId[process.env.NEXT_PUBLIC_NETWORK];

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(
  SupportedChainId
).filter((id) => typeof id === "number") as SupportedChainId[];

/**
 * These are the network URLs used by the Livepeer Explorer when there is not another available source of chain data
 */
export const INFURA_NETWORK_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_ONE]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_RINKEBY]: `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
};

export enum NetworkType {
  L1,
  L2,
}

const abis = {
  l1Migrator: require("../abis/bridge/L1Migrator.json"),
  l2Migrator: require("../abis/bridge/L2Migrator.json"),
  l2GatewayRouter: require("../abis/bridge/L2LPTGateway.json"),
  inbox: require("../abis/bridge/Inbox.json"),
  outbox: require("../abis/bridge/Outbox.json"),
  arbRetryableTx: require("../abis/bridge/ArbRetryableTx.json"),
  nodeInterface: require("../abis/bridge/NodeInterface.json"),
};

export const CHAIN_INFO = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    l1: SupportedChainId.MAINNET,
    explorer: "https://etherscan.io/",
    explorerAPI: "https://api.etherscan.io/api",
    pricingUrl: "https://nyc.livepeer.com/orchestratorStats",
    label: "Ethereum",
    // logoUrl: ethereumLogoUrl,
    addNetworkInfo: {
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrl: INFURA_NETWORK_URLS[SupportedChainId.MAINNET],
    },
    subgraph: "https://api.thegraph.com/subgraphs/name/livepeer/livepeer",
    contracts: {
      controller: "0xf96d54e490317c557a967abfa5d6e33006be69b3",
      pollCreator: "0xBf824EDb6b94D9B52d972d5B25bCc19b4e6E3F3C",
      l1Migrator: "0xcC7E99a650ED63f061AC26660f2bb71570e571b2",
      l2Migrator: "0x4547918C363f5d6452b77c6233c70F31Ae41b613",
      l2GatewayRouter: "0x747B531D31b36c3E2fea1b0adb27e3e5f3136fE8",
      inbox: "0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e",
      outbox: "0x2360A33905dc1c72b12d975d975F42BaBdcef9F3",
      arbRetryableTx: "0x000000000000000000000000000000000000006E",
      nodeInterface: "0x00000000000000000000000000000000000000C8",
    },
    abis,
  },
  [SupportedChainId.RINKEBY]: {
    networkType: NetworkType.L1,
    l1: SupportedChainId.RINKEBY,
    explorer: "https://rinkeby.etherscan.io/",
    explorerAPI: "https://api-rinkeby.etherscan.io/api",
    pricingUrl: "https://nyc.livepeer.com/orchestratorStats",
    label: "Rinkeby",
    // logoUrl: ethereumLogoUrl,
    addNetworkInfo: {
      nativeCurrency: { name: "Rinkeby Ether", symbol: "rETH", decimals: 18 },
      rpcUrl: INFURA_NETWORK_URLS[SupportedChainId.RINKEBY],
    },
    subgraph:
      "https://api.thegraph.com/subgraphs/name/livepeer/livepeer-rinkeby",
    contracts: {
      controller: "0xA268AEa9D048F8d3A592dD7f1821297972D4C8Ea",
      pollCreator: "0x149805EF90FaDA12D27e8a020b6c138F3d86A9a3",
      l1Migrator: "0xcC7E99a650ED63f061AC26660f2bb71570e571b2",
      l2Migrator: "0x4547918C363f5d6452b77c6233c70F31Ae41b613",
      l2GatewayRouter: "0x747B531D31b36c3E2fea1b0adb27e3e5f3136fE8",
      inbox: "0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e",
      outbox: "0x2360A33905dc1c72b12d975d975F42BaBdcef9F3",
      arbRetryableTx: "0x000000000000000000000000000000000000006E",
      nodeInterface: "0x00000000000000000000000000000000000000C8",
    },
    abis,
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    networkType: NetworkType.L2,
    l1: SupportedChainId.MAINNET,
    bridge: "https://bridge.arbitrum.io/",
    docs: "https://offchainlabs.com/",
    explorer: "https://arbiscan.io/",
    explorerAPI: "https://api.arbiscan.io/api",
    pricingUrl: "https://nyc.livepeer.com/orchestratorStats",
    label: "Arbitrum",
    // logoUrl: arbitrumLogoUrl,
    // defaultListUrl: ARBITRUM_LIST,
    addNetworkInfo: {
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrl: "https://arb1.arbitrum.io/rpc",
    },
    subgraph:
      "https://api.thegraph.com/subgraphs/name/livepeer/livepeer-arbitrum",
    contracts: {
      controller: "0xa81F7622A0600cc801cB5AEb9AE022cab43562f1",
      pollCreator: "0x149805EF90FaDA12D27e8a020b6c138F3d86A9a3",
      l1Migrator: "0xcC7E99a650ED63f061AC26660f2bb71570e571b2",
      l2Migrator: "0x4547918C363f5d6452b77c6233c70F31Ae41b613",
      l2GatewayRouter: "0x5288c571Fd7aD117beA99bF60FE0846C4E84F933",
      inbox: "0x4c6f947Ae67F572afa4ae0730947DE7C874F95Ef",
      outbox: "0x760723CD2e632826c38Fef8CD438A4CC7E7E1A40",
      arbRetryableTx: "0x000000000000000000000000000000000000006E",
      nodeInterface: "0x00000000000000000000000000000000000000C8",
    },
    abis,
  },
  [SupportedChainId.ARBITRUM_RINKEBY]: {
    networkType: NetworkType.L2,
    l1: SupportedChainId.RINKEBY,
    bridge: "https://bridge.arbitrum.io/",
    docs: "https://offchainlabs.com/",
    explorer: "https://testnet.arbiscan.io/",
    explorerAPI: "https://testnet.arbiscan.io/api",
    pricingUrl: "https://nyc.livepeer.com/orchestratorStats",
    label: "Arbitrum Rinkeby",
    // logoUrl: arbitrumLogoUrl,
    // defaultListUrl: ARBITRUM_LIST,
    addNetworkInfo: {
      nativeCurrency: {
        name: "Rinkeby Arbitrum Ether",
        symbol: "rinkArbETH",
        decimals: 18,
      },
      rpcUrl: "https://rinkeby.arbitrum.io/rpc",
    },
    subgraph:
      "https://api.thegraph.com/subgraphs/name/adamsoffer/arbitrum-rinkeby",
    contracts: {
      controller: "0xa81F7622A0600cc801cB5AEb9AE022cab43562f1",
      pollCreator: "0x149805EF90FaDA12D27e8a020b6c138F3d86A9a3",
      l1Migrator: "0xcC7E99a650ED63f061AC26660f2bb71570e571b2",
      l2Migrator: "0x4547918C363f5d6452b77c6233c70F31Ae41b613",
      l2GatewayRouter: "0x747B531D31b36c3E2fea1b0adb27e3e5f3136fE8",
      inbox: "0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e",
      outbox: "0x2360A33905dc1c72b12d975d975F42BaBdcef9F3",
      arbRetryableTx: "0x000000000000000000000000000000000000006E",
      nodeInterface: "0x00000000000000000000000000000000000000C8",
    },
    abis,
  },
};

export const L1_CHAIN_ID = CHAIN_INFO[DEFAULT_CHAIN_ID].l1;

export const l1Provider = new ethers.providers.JsonRpcProvider(
  INFURA_NETWORK_URLS[L1_CHAIN_ID]
);

export const l2Provider = new ethers.providers.JsonRpcProvider(
  INFURA_NETWORK_URLS[DEFAULT_CHAIN_ID]
);

export const l1Migrator = new ethers.Contract(
  CHAIN_INFO[DEFAULT_CHAIN_ID].contracts.l1Migrator,
  abis.l1Migrator,
  l1Provider
);

export const l2Migrator = new ethers.Contract(
  CHAIN_INFO[DEFAULT_CHAIN_ID].contracts.l2Migrator,
  abis.l2Migrator,
  l2Provider
);

export const arbRetryableTx = new ethers.Contract(
  CHAIN_INFO[DEFAULT_CHAIN_ID].contracts.arbRetryableTx,
  abis.arbRetryableTx,
  l2Provider
);

export const nodeInterface = new ethers.Contract(
  CHAIN_INFO[DEFAULT_CHAIN_ID].contracts.nodeInterface,
  abis.nodeInterface,
  l2Provider
);
