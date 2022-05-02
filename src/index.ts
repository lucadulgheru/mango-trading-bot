import {
  GroupConfig,
  MangoClient,
  MangoAccount,
  PerpMarket,
  PerpOrder,
  MangoGroup,
  MangoCache,
  MarketConfig,
  PerpAccount
} from '@blockworks-foundation/mango-client';
import { Connection } from '@solana/web3.js';
import * as constants from './constants';
import * as mangoUtils from './mangoUtils';
import * as tradingUtils from './tradingUtils';
import { TradeSide, MarketType } from './types';
import { ParsedFillEvent } from '@blockworks-foundation/mango-client/lib/src/PerpMarket';
import { CoinGeckoClient } from './coingecko/client';
import { Candlestick } from './coingecko/entity/candlestick';

async function main(): Promise<void> {

  // Init phase
  const [groupConfig, connection, client]: [GroupConfig, Connection, MangoClient] = mangoUtils.initMangoClient();
  const [mangoGroup, perpMarket, perpMarketConfig]: [MangoGroup, PerpMarket, MarketConfig] = await mangoUtils.initPerpMarket(groupConfig, client, connection);

  const market: string = process.argv[2];

  while (true) {

    const mangoAccount: MangoAccount = (await mangoUtils.getMangoAccounts(constants.USER_KEYPAIR.publicKey, client, mangoGroup))[0];
    const mangoCache: MangoCache = await mangoGroup.loadCache(connection);
    const perpAccount: PerpAccount = mangoAccount.perpAccounts[constants.SOL_PERP_INDEX];

    // Get the orderbook from Mango
    const [bids, asks] = await mangoUtils.getOrderbook(perpMarket, connection);
    const lowestAskingPrice: number = asks[0][0];
    const highestBiddingPrice: number = bids[0][0];

    const openOrders: PerpOrder[] = await mangoUtils.getOpenOrders(connection, mangoAccount, perpMarket);
    const fills: ParsedFillEvent[] = await perpMarket.loadFills(connection);
    let myFills = fills.filter((fill) => fill.taker.equals(mangoAccount.publicKey) || fill.maker.equals(mangoAccount.publicKey));
    const perpTradeHistory: [] = await mangoUtils.getPerpTradeHistory();
    myFills = myFills.concat(perpTradeHistory);

    const position: number = perpAccount.getBasePositionUi(perpMarket);

    const buyOrders = openOrders.filter(function (order) {
      return order.side == TradeSide.BUY;
    });

    const sellOrders = openOrders.filter(function (order) {
      return order.side == TradeSide.SELL;
    });

    if (market === MarketType.BEAR) {
      try {
        await tradingUtils.bearTrading(buyOrders, sellOrders, highestBiddingPrice, client, mangoGroup, mangoAccount, mangoCache, perpMarket, perpAccount, perpTradeHistory, position, connection);
      } catch (e) {
        console.log(e);
      }
    } else if (market === MarketType.BULL) {
      try {
        await tradingUtils.bullTrading(buyOrders, sellOrders, lowestAskingPrice, client, mangoGroup, mangoAccount, mangoCache, perpMarket, perpAccount, perpTradeHistory, position, connection);
      } catch (e) {
        console.log(e);
      }
    }

    await tradingUtils.sleep(constants.RELOAD_DELAY);
  }

}

async function test(){
  // const coingeckoClient: CoinGeckoClient = CoinGeckoClient.getInstance();

  // const candlesticks: Candlestick[] = await coingeckoClient.getCandlesticks();

  // console.log(candlesticks);

  // console.log(await coingeckoClient.getPrice());
}

// main();

test();