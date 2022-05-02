export class Price {

    private coin!: string;
    private price!: number;
    private marketCap!: number;
    private volume24H!: number;
    private change24H!: number;
    private lastUpdatedAt!: number;

    public constructor(){}

    public setCoin(coin: string){
        this.coin = coin;
    }

    public getCoin() {
        return this.coin;
    }

    public setPrice(price: number){
        this.price = price;
    }

    public getPrice() {
        return this.price;
    }

    public setMarketCap(marketCap: number){
        this.marketCap = marketCap;
    }

    public getMarketCap() {
        return this.marketCap;
    }

    public setVolume24H(volume24H: number){
        this.volume24H = volume24H;
    }

    public getVolume24H() {
        return this.volume24H;
    }

    public setChange24H(change24H: number){
        this.change24H = change24H;
    }

    public getChange24H() {
        return this.change24H;
    }

    public setLastUpdatedAt(lastUpdatedAt: number){
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public getLastUpdatedAt() {
        return this.lastUpdatedAt;
    }
}