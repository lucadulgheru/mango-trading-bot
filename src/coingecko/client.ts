import { fetch } from "cross-fetch";
import { Candlestick } from "./entity/candlestick";
import * as geckoConstants from './constants';
import { ObjectMapper } from "./objectMapper";
import { Price } from "./entity/price";

export class CoinGeckoClient{

    private static instance: CoinGeckoClient;
    private objectMapper: ObjectMapper = ObjectMapper.getInstance();
    private ohlcEndpoint: string = geckoConstants.COINGECKO_BASE_API_PATH + 
                                   geckoConstants.COINGECKO_API_VERSION + 
                                   geckoConstants.COINGECKO_ENDPOINT_COINS + 
                                   `/${geckoConstants.COINGECKO_SOLANA_ID}` + 
                                   geckoConstants.COINGECKO_ENDPOINT_OHLC +
                                   `?vs_currency=${geckoConstants.COINGECKO_USD_ID}` +
                                   `&days=${geckoConstants.COINGECKO_CANDLE_DAYS}`;
    private priceEndpoint: string = geckoConstants.COINGECKO_BASE_API_PATH + 
                                    geckoConstants.COINGECKO_API_VERSION + 
                                    geckoConstants.COINGECKO_ENDPOINT_SIMPLE + 
                                    geckoConstants.COINGECKO_ENDPOINT_PRICE +
                                    `?ids=${geckoConstants.COINGECKO_SOLANA_ID}` +
                                    `&vs_currencies=${geckoConstants.COINGECKO_USD_ID}` +
                                    "&include_24hr_change=true";

    private constructor(){}

    public static getInstance(): CoinGeckoClient{
        if(!CoinGeckoClient.instance){
            CoinGeckoClient.instance = new CoinGeckoClient();
        }
        return CoinGeckoClient.instance;
    }

    // TODO add error handling
    public async getCandlesticks(): Promise<Candlestick[]>{
        const response = await (await fetch(
            this.ohlcEndpoint
        )).json();

        let candlesticks: Candlestick[] = [];

        for(const candlestick of response){
            candlesticks.push(
                this.objectMapper.ohlcResponseToObject(candlestick)
            );
        }

        return candlesticks;
    }

    // TODO add error handling
    public async getPrice(): Promise<Price>{
        const response = await (await fetch(
            this.priceEndpoint
        )).json();

        return this.objectMapper.priceResponseToObject(response);
    }
}