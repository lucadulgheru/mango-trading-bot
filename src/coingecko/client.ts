import { fetch } from "cross-fetch";
import * as geckoConstants from './constants';

class CoinGeckoClient{

    private static instance: CoinGeckoClient;
    private ohlcEndpoint: string = geckoConstants.COINGECKO_BASE_API_PATH + 
                                   geckoConstants.COINGECKO_API_VERSION + 
                                   geckoConstants.COINGECKO_ENDPOINT_COINS + 
                                   geckoConstants.COINGECKO_SOLANA_ID + 
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

    // TODO complete here
    public async getCandlesticks(){
        const response = await fetch(
            this.ohlcEndpoint
        );
    }

    // TODO complete here
    public async getPrice(){
        const response = await fetch(
            this.priceEndpoint
        );
    }
}