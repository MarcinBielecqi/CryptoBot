import { AccelerationBands, ATR, BollingerBandsWidth, CG, MAD,SMA, StochasticOscillator ,FasterSMA } from 'trading-signals';
import { Slayer } from 'Slayer';
import { HighLowCloseNumber} from 'trading-signals/dist/util';

export default class Data {

    findSpikes(rawData) {
        console.log(rawData);
        var that = this,
            slayer = Slayer(),
            maxPrice = rawData.sort((a, b) => { return b[4] - a[4] })[0][4];

        var data = rawData.sort((a, b) => { return b[6] - a[6] }).map((element) => {
            return [
                element[6],
                parseFloat(element[4]),
                // parseFloat(maxPrice - element[4])
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

    signals(rawData) {
        console.log(rawData);
        // let abands = new AccelerationBands(3, 5, new FasterSMA( ));
        let atr = new ATR(3);
        // let bbw = new BollingerBandsWidth
        // let cg = new CG(3);
        let mad = new MAD(3);
        let sma = new SMA(3);
        // let stoch = new STOCH(3);

        return rawData.map(candlestick => {

            try {
                // abands.update( candlestick[2], candlestick[3], candlestick[4] );
                atr.update(candlestick[4]);
                // bbw.update(candlestick[4]);
                // cg.update(candlestick[4]);
                mad.update(candlestick[4]);
                sma.update(candlestick[4]);
                // stoch.update(candlestick[4]);
                return {
                    openTime: candlestick[0],
                    closeTime: candlestick[6],
                    lastPrice: candlestick[4],
                    // abands: abands.getResult().valueOf(),
                    atr: atr.getResult().valueOf(),
                    // bbw: bbw.getResult().valueOf(),
                    // cg: cg.getResult().valueOf(),
                    mad: mad.getResult().valueOf(),
                    sma: sma.getResult().valueOf(),
                    // stoch: stoch.getResult().valueOf()
                }
            } catch (error) {
                console.log(error);
                return {};
            }

        });
    }
  }

