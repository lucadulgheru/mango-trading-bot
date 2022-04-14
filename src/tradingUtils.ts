import promiseRetry from "promise-retry";
import { Connection } from "@solana/web3.js";
import { modifyPerpOrder, placePerpOrder } from "./mangoUtils";
import { USDC_PRICE_REFERENCE, SOL_QUANTITY, USER_KEYPAIR, NUMBER_OF_TRADES } from "./constants";

export function bearTrading() {

}

export async function bullTrading(buyOrders, sellOrders, lowestAskingPrice, client, mangoGroup, mangoAccount, mangoCache, perpMarket, perpAccount, perpTradeHistory, position) {
    if (buyOrders.length != 0) {
        for (const order of buyOrders) {
          const priceDifference = order.price - lowestAskingPrice;
          if (priceDifference <= -3 || priceDifference >= 3) {
            const tradePrice: number = lowestAskingPrice - USDC_PRICE_REFERENCE;
            console.log("BUY order is outdated. Recalculating and updating. Order ID = " + order.orderId);
            console.log(`Updating BUY order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
            await modifyPerpOrder(client, mangoGroup, mangoAccount, mangoCache, perpMarket, USER_KEYPAIR, order, order.side, tradePrice, SOL_QUANTITY);
          }
        }
      }
  
      if (sellOrders.length != 0) {
        const breakEvenPrice = perpAccount.getBreakEvenPrice(mangoAccount, perpMarket, perpTradeHistory).toNumber();
        for (const order of buyOrders) {
          const priceDifference = order.price - breakEvenPrice;
          if (priceDifference <= -3 || priceDifference >= 3) {
            const tradePrice: number = breakEvenPrice + USDC_PRICE_REFERENCE;
            console.log("SELL order is outdated. Recalculating and updating. Order ID = " + order.orderId);
            console.log(`Updating SELL order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
            await modifyPerpOrder(client, mangoGroup, mangoAccount, mangoCache, perpMarket, USER_KEYPAIR, order, order.side, tradePrice, SOL_QUANTITY);
          }
        }
      }
  
      if (buyOrders.length == 0 && position == 0) {
        for (let i = 1; i <= NUMBER_OF_TRADES; i++) {
          const tradePrice: number = lowestAskingPrice - (USDC_PRICE_REFERENCE * i);
          console.log(`Placing BUY order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
          await placePerpOrder(client, mangoGroup, mangoAccount, perpMarket, "buy", tradePrice, SOL_QUANTITY);
        }
      }
  
      if (position !== 0) {
        const breakEvenPrice: number = perpAccount.getBreakEvenPrice(mangoAccount, perpMarket, perpTradeHistory).toNumber();
        const tradePrice: number = breakEvenPrice + USDC_PRICE_REFERENCE;
        console.log(`Placing SELL order. Price = \$${tradePrice} | Quantity = ${SOL_QUANTITY} SOL`);
        await placePerpOrder(client, mangoGroup, mangoAccount, perpMarket, "sell", tradePrice, position);
      }
}

export async function getTransactionConfirmation(txid: string, connection: Connection) {
    const res = await promiseRetry(
        async (retry, attempt) => {
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
    if (res.meta.err) {
        throw new Error("Transaction failed");
    }
    return txid;
};

export async function sleep(delay: number) {
    console.log(`Sleeping for ${delay} seconds.`);
    await new Promise(f => setTimeout(f, delay * 100));
}