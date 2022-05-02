import { Candlestick } from "./entity/candlestick";
import { Price } from "./entity/price";
import * as geckoConstants from "./constants";
import { PriceResponse } from "./types";

export class ObjectMapper{
    public static instance: ObjectMapper;

    private constructor(){}

    public static getInstance(): ObjectMapper{
        if(!ObjectMapper.instance){
            ObjectMapper.instance = new ObjectMapper();
        }
        return ObjectMapper.instance;
    }

    // TODO add error handling
    public priceResponseToObject(responseObject: PriceResponse) {

        let price: Price = new Price();

        price.setCoin(geckoConstants.COINGECKO_SOLANA_ID);
        price.setPrice(responseObject[geckoConstants.COINGECKO_SOLANA_ID][geckoConstants.COINGECKO_USD_ID]);
        price.setChange24H(responseObject[geckoConstants.COINGECKO_SOLANA_ID]["usd_24h_change"]);

        return price;
    }

    // TODO add error handling
    public ohlcResponseToObject(responseObject: [number, number, number, number, number]): Candlestick{
        return new Candlestick(
            this.timestampToDate(responseObject[0]),
            responseObject[1],
            responseObject[2],
            responseObject[3],
            responseObject[4],
        );
    }

    private timestampToDate(timestamp: number): Date{
        return new Date(timestamp);
    }
}