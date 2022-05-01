import {
  Config,
  getMarketByBaseSymbolAndKind,
  GroupConfig,
  MangoClient,
  IDS,
  MangoAccount,
  PerpMarket,
  PerpOrder,
  MangoGroup,
  MangoCache,
  Payer,
  MarketConfig
} from '@blockworks-foundation/mango-client';
import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { fetch } from "cross-fetch";
import * as constants from './constants';
import { getTransactionConfirmation } from './tradingUtils';
import { TradeSide } from './types';

export function initMangoClient(): [GroupConfig, Connection, MangoClient] {
  const config = new Config(IDS);
  const groupConfig = config.getGroupWithName('mainnet.1') as GroupConfig;
  const connection = new Connection(
    config.cluster_urls[groupConfig.cluster],
    'processed' as Commitment,
  );
  const client = new MangoClient(connection, groupConfig.mangoProgramId);

  return [groupConfig, connection, client];
}

export async function initPerpMarket(
  groupConfig: GroupConfig,
  client: MangoClient,
  connection: Connection): Promise<[MangoGroup, PerpMarket, MarketConfig]> {
  const perpMarketConfig = getMarketByBaseSymbolAndKind(
    groupConfig,
    'SOL',
    'perp',
  );
  const mangoGroup = await client.getMangoGroup(groupConfig.publicKey);
  const perpMarket = await mangoGroup.loadPerpMarket(
    connection,
    perpMarketConfig.marketIndex,
    perpMarketConfig.baseDecimals,
    perpMarketConfig.quoteDecimals,
  );

  return [mangoGroup, perpMarket, perpMarketConfig];
}

export async function getOpenOrders(
  connection: Connection,
  mangoAccount: MangoAccount,
  perpMarket: PerpMarket): Promise<PerpOrder[]> {

  return await perpMarket.loadOrdersForAccount(
    connection,
    mangoAccount,
  );

}

export async function getOrderbook(
  perpMarket: PerpMarket,
  connection: Connection) {
  const bids = (await perpMarket.loadBids(connection)).getL2(5);
  const asks = (await perpMarket.loadAsks(connection)).getL2(5);

  return [bids, asks];
}

export async function getMangoAccounts(publicKey: PublicKey, client: MangoClient, mangoGroup: MangoGroup): Promise<MangoAccount[]> {
  return await client.getMangoAccountsForOwner(mangoGroup, publicKey, true);
}

export async function getAccountBalance(mangoKey: PublicKey, client: MangoClient, groupConfig: GroupConfig, connection: Connection) {

  const mangoAccountPk = mangoKey;
  const mangoGroup = await client.getMangoGroup(groupConfig.publicKey);
  const cache = await mangoGroup.loadCache(connection);
  const mangoAccount = await client.getMangoAccount(
    mangoAccountPk,
    mangoGroup.dexProgramId,
  );

  console.log(mangoAccount.toPrettyString(groupConfig, mangoGroup, cache));
}

export async function placePerpOrder(client: MangoClient,
  mangoGroup: MangoGroup,
  mangoAccount: MangoAccount,
  perpMarket: PerpMarket,
  side: TradeSide.BUY | TradeSide.SELL,
  price: number,
  quantity: number,
  connection: Connection) {
  try {
    return await client.placePerpOrder2(
      mangoGroup,
      mangoAccount,
      perpMarket,
      constants.USER_KEYPAIR,
      side,
      price,
      quantity,
      {
        orderType: 'postOnlySlide',
      },
    );
  }
  catch (mangoError: any) {
    await getTransactionConfirmation(mangoError.txid, connection);
    console.log(mangoError.txid);
  }
}

export async function modifyPerpOrder(client: MangoClient,
  mangoGroup: MangoGroup,
  mangoAccount: MangoAccount,
  mangoCache: MangoCache,
  perpMarket: PerpMarket,
  owner: Payer,
  order: PerpOrder,
  side: "buy" | "sell",
  price: number,
  quantity: number) {
  return await client.modifyPerpOrder(
    mangoGroup,
    mangoAccount,
    mangoCache.publicKey,
    perpMarket,
    owner,
    order,
    side,
    price,
    quantity
  );
}

export async function getPerpTradeHistory(): Promise<[]> {
  const perpHistory = await fetch(
    constants.PERP_TRADES_API
  );
  return (await perpHistory.json())?.data || [];
}