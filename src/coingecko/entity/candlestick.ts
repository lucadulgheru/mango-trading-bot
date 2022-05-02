export class Candlestick {

    private time: Date;
    private open: number;
    private high: number;
    private low: number;
    private close: number;

    constructor(time: Date, open: number, high: number, low: number, close: number) {
        this.time = time;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
    }

    public getTime() {
        return this.time;
    }

    public getOpen() {
        return this.open;
    }

    public getHigh() {
        return this.high;
    }

    public getLow() {
        return this.low;
    }

    public getClose() {
        return this.close;
    }

}