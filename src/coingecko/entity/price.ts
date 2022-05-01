class Price {

    private coin: string;
    private price: number;
    private marketCap: number;
    private volume24H: number;
    private change24H: number;
    private lastUpdatedAt: number;

    constructor(coin: string, price: number, marketCap: number, volume24H: number, change24H: number, lastUpdatedAt: number) {
        this.coin = coin;
        this.price = price;
        this.marketCap = marketCap;
        this.volume24H = volume24H;
        this.change24H = change24H;
        this.lastUpdatedAt = lastUpdatedAt;
    }

    getCoin() {
        return this.coin;
    }

    getPrice() {
        return this.price;
    }

    getMarketCap() {
        return this.marketCap;
    }

    getVolume24H() {
        return this.volume24H;
    }

    getChange24H() {
        return this.change24H;
    }

    getLastUpdatedAt() {
        return this.lastUpdatedAt;
    }
}