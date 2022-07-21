import Binance from "node-binance-api";

const Settings = require("../settings/settings");

export class Scheduler {
  binance = new Binance().options({
    APIKEY: Settings.API_KEY,
    APISECRET: Settings.API_SECRET,
  });

  run() {
    let that = this;
    that.binance.candlesticks("BTCUSDT", "3m", (error, ticks, symbol) => {
      if (error) console.error(error);
      else console.log(ticks);
    }, { limit: 1000 }
    );
  }
}
