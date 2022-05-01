import promiseRetry from "promise-retry";
import { Connection } from "@solana/web3.js";
import { modifyPerpOrder, placePerpOrder } from "./mangoUtils";
import { USDC_PRICE_REFERENCE, SOL_QUANTITY, USER_KEYPAIR, NUMBER_OF_TRADES } from "./constants";
import { MangoAccount, MangoCache, MangoClient, MangoGroup, PerpAccount, PerpMarket, PerpOrder } from "@blockworks-foundation/mango-client";
import { TradeSide } from "./types";

export async function bearTrading(buyOrders: PerpOrder[], sellOrders: PerpOrder[], highestBiddingPrice: number, client: MangoClient, mangoGroup: MangoGroup, mangoAccount: MangoAccount, mangoCache: MangoCache, perpMarket: PerpMarket, perpAccount: PerpAccount, perpTradeHistory: [], position: number, connection: Connection) {

  if (sellOrders.length !== 0) {
    for (let i = 0; i < sellOrders.length; i++) {
      const order = sellOrders[i];
      const priceDifference = highestBiddingPrice - order.price;
      if (priceDifference >= 3) {
        const tradePrice: number = highestBiddingPrice + (USDC_PRICE_REFERENCE * (i + 1));
        console.log("SELL order is outdated. Recalculating and updating. Order ID = " + order.orderId);
        console.log(`Updating SELL order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
        await modifyPerpOrder(client, mangoGroup, mangoAccount, mangoCache, perpMarket, USER_KEYPAIR, order, order.side, tradePrice, SOL_QUANTITY);
      }
    }
  }

  if (buyOrders.length === 1) {
    const order = buyOrders[0];
    const breakEvenPrice = perpAccount.getBreakEvenPrice(mangoAccount, perpMarket, perpTradeHistory).toNumber();
    if (order.size !== position && order.price !== breakEvenPrice) {
      const tradePrice: number = breakEvenPrice - USDC_PRICE_REFERENCE;
      console.log("BUY order is outdated. Recalculating and updating. Order ID = " + order.orderId);
      console.log(`Updating BUY order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
      await modifyPerpOrder(client, mangoGroup, mangoAccount, mangoCache, perpMarket, USER_KEYPAIR, order, order.side, tradePrice, position);
    }

  }

  if (position === 0 && sellOrders.length === 0) {
    for (let i = 0; i < NUMBER_OF_TRADES; i++) {
      const tradePrice: number = highestBiddingPrice + (USDC_PRICE_REFERENCE * (i + 1));
      console.log(`Placing SELL order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
      await placePerpOrder(client, mangoGroup, mangoAccount, perpMarket, TradeSide.SELL, tradePrice, SOL_QUANTITY, connection);
    }
  } else if (position !== 0 && buyOrders.length === 0) {
    const breakEvenPrice: number = perpAccount.getBreakEvenPrice(mangoAccount, perpMarket, perpTradeHistory).toNumber();
    const tradePrice: number = breakEvenPrice - USDC_PRICE_REFERENCE;
    console.log(`Placing BUY order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
    await placePerpOrder(client, mangoGroup, mangoAccount, perpMarket, TradeSide.BUY, tradePrice, position, connection);
  }
}

export async function bullTrading(buyOrders: PerpOrder[], sellOrders: PerpOrder[], lowestAskingPrice: number, client: MangoClient, mangoGroup: MangoGroup, mangoAccount: MangoAccount, mangoCache: MangoCache, perpMarket: PerpMarket, perpAccount: PerpAccount, perpTradeHistory: [], position: number, connection: Connection) {

  if (buyOrders.length !== 0) {
    for (let i = 0; i < buyOrders.length; i++) {
      const order = buyOrders[i];
      const priceDifference = lowestAskingPrice - order.price;
      if (priceDifference >= 0.5) {
        const tradePrice: number = lowestAskingPrice - (USDC_PRICE_REFERENCE * (i + 1));
        logTradeUpdate(TradeSide.BUY, tradePrice);
        await modifyPerpOrder(client, mangoGroup, mangoAccount, mangoCache, perpMarket, USER_KEYPAIR, order, TradeSide.BUY, tradePrice, SOL_QUANTITY);
      }
    }
  }

  if (sellOrders.length === 1) {
    const order = sellOrders[0];
    const breakEvenPrice = perpAccount.getBreakEvenPrice(mangoAccount, perpMarket, perpTradeHistory).toNumber();
    const tradePrice = breakEvenPrice + USDC_PRICE_REFERENCE;
    if (order.size !== position && order.price !== tradePrice) {
      logTradeUpdate(TradeSide.SELL, tradePrice);
      await modifyPerpOrder(client, mangoGroup, mangoAccount, mangoCache, perpMarket, USER_KEYPAIR, order, order.side, tradePrice, position);
    }
  }

  if (position === 0 && buyOrders.length === 0) {
    for (let i = 0; i < NUMBER_OF_TRADES; i++) {
      const tradePrice: number = lowestAskingPrice - (USDC_PRICE_REFERENCE * (i + 1));
      logTrade(TradeSide.BUY, tradePrice, position);
      await placePerpOrder(client, mangoGroup, mangoAccount, perpMarket, TradeSide.BUY, tradePrice, SOL_QUANTITY, connection);
    }
  } else if (position !== 0 && sellOrders.length === 0) {
    const breakEvenPrice: number = perpAccount.getBreakEvenPrice(mangoAccount, perpMarket, perpTradeHistory).toNumber();
    const tradePrice: number = breakEvenPrice + USDC_PRICE_REFERENCE;
    logTrade(TradeSide.SELL, tradePrice, position);
    await placePerpOrder(client, mangoGroup, mangoAccount, perpMarket, TradeSide.SELL, tradePrice, position, connection);
  }
}

export async function getTransactionConfirmation(txid: string, connection: Connection) {
  const res = await promiseRetry(
    async (retry) => {
      let txResult = await connection.getTransaction(txid, {
        commitment: "confirmed",
      });
      if (!txResult) {
        const error = new Error("Transaction was not confirmed");
        retry(error);
        return;
      }
      return txResult;
    },
    {
      retries: 40,
      minTimeout: 500,
      maxTimeout: 1000,
    }
  );
  // if (res.meta.err) {
  //   throw new Error("Transaction failed");
  // }
  return txid;
};

export async function sleep(delay: number) {
  return await new Promise(f => setTimeout(f, delay * 1000)).then(() => console.log(`Sleeping for ${delay} seconds.`));
}

function logTradeUpdate(side: TradeSide, tradePrice: number) {
  console.log(`${side} order is outdated. Recalculating and updating.`);
  console.log(`Updating ${side} order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
}

function logTrade(side: TradeSide, tradePrice: number, position: number) {
  console.log(`Placing ${side} order. Price = \$${tradePrice} | Quantity = ${position} SOL`);
}