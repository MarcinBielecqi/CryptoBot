import { AccelerationBands, ATR, BollingerBandsWidth, CG, MAD, SMA, StochasticOscillator, FasterSMA, BollingerBands } from 'trading-signals';
import { FasterMovingAverageTypes, MovingAverageTypes } from 'trading-signals';
import { HighLowClose, HighLowCloseNumber, StochasticResult, BandsResult } from 'trading-signals';
import { BigSource } from 'big.js';
import { Slayer } from 'slayer';

export default class Data {
    binance = undefined;
    interval = "3m"
    constructor(binance) {
        this.binance = binance;
    }

    async candlesticks(limit) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.binance.candlesticks("BTCUSDT", that.interval, (error, ticks, symbol) => {
                if (error) {
                    console.error(error);
                    resolve([]);
                }
                else {
                    resolve(ticks);
                }
            }, { limit: limit }
            );
        });
    }

    async normalize(signals) {
        let that = this;
        return new Promise((resolve, reject) => {

        });
    }
    async getVectors() {
        var that = this;


        let candlesticks = await that.candlesticks(100);
        let spikes = await that.getSpikes(candlesticks);
        let signals = await that.getSignals(candlesticks);
        let vectors = await that.normalize(signals);
        console.log(spikes);
        // crossValidate = new Brain.CrossValidate(Brain.NeuralNetwork, { hiddenLayers: that.hiddenLayers });

        // that.mainBrain.train(data, that.trainingOptions);

        // crossValidate.train(data, that.trainingOptions);
        // that.mainBrain = crossValidate.toNeuralNetwork()
    }

    async getSpikes(candlesticks) {
        var that = this,
            slayer = Slayer(),
            maxPrice = candlesticks.sort((a, b) => { return b.price - a.price })[0].price;

        var data = candlesticks.sort((a, b) => { return b.closeTime - a.closeTime }).map((element) => {
            return [
                element.closeTime,
                element.price,
                maxPrice - element.price
            ];
        });

        slayer.config.minPeakDistance = 30;
        return new Promise((resolve, reject) => {
            Promise.all([
                slayer.y((item) => item[1]).x((item, i) => item[0]).fromArray(data),
                slayer.y((item) => item[2]).x((item, i) => item[0]).fromArray(data)
            ]).then((spikes) => {
                resolve({
                    max: spikes[0].map(spike => { return { openTime: spike.x } }),
                    min: spikes[1].map(spike => { return { openTime: spike.x } })
                });
            }).catch((err) => {
                resolve({});
            });
        });
    }

    async getSignals(rawData) {

        let abands = new AccelerationBands(3, 5, SMA);
        let atr = new ATR(3, SMA);
        // let bbw = new BollingerBandsWidth
        let cg = new CG(3, 10);
        let mad = new MAD(3);
        let sma = new SMA(3);
        let stoch = new StochasticOscillator(3, 10, 30);

        return await rawData.map(async (candlestick) => {

            try {
                let highLowClose: HighLowCloseNumber = { high: candlestick[2], low: candlestick[3], close: candlestick[4] };
                abands.update(highLowClose);
                atr.update(highLowClose);
                // bbw.update(highLowClose.close);
                cg.update(highLowClose.close);
                mad.update(highLowClose.close);
                sma.update(highLowClose.close);
                stoch.update(highLowClose);
                let abandsResult = await abands.getResult().valueOf() as BandsResult;
                let stochResult = await stoch.getResult().valueOf() as StochasticResult;
                return {
                    openTime: candlestick[0],
                    closeTime: candlestick[6],
                    price: parseFloat(candlestick[4]),
                    abandLower: abandsResult.lower.toNumber(),
                    abandMiddle: abandsResult.middle.toNumber(),
                    abandUpper: abandsResult.upper.toNumber(),
                    atr: atr.getResult().toNumber(),
                    // bbw: bbw.getResult().toNumber(),
                    cg: cg.getResult().toNumber(),
                    mad: mad.getResult().toNumber(),
                    sma: sma.getResult().toNumber(),
                    stochD: stochResult.stochD.toNumber(),
                    stochK: stochResult.stochK.toNumber()
                }
            } catch (error) {
                console.log(error);
                return {};
            }

        });
    }
}

