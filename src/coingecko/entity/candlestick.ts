class Candlestick {

    private time: number;
    private open: number;
    private high: number;
    private low: number;
    private close: number;

    constructor(time: number, open: number, high: number, low: number, close: number) {
        this.time = time;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
    }

    getTime() {
        return this.time;
    }

    getOpen() {
        return this.open;
    }

    getHigh() {
        return this.high;
    }

    getLow() {
        return this.low;
    }

    getClose() {
        return this.close;
    }

}