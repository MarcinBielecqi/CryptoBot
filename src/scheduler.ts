import Binance from "node-binance-api";
import Data from "./data";
import Trainer from "./trainer";
import Dealer from "./dealer";
const Settings = require("../settings/settings");

export class Scheduler {
  binance = new Binance().options({
    APIKEY: Settings.API_KEY,
    APISECRET: Settings.API_SECRET,
  });
  data = new Data(this.binance);
  trainer = new Trainer(2000, this.data);
  dealer = new Dealer(1000, this.data, this.trainer);


  run() {
    // this.dealer.dealerLoop();
    this.trainer.trainerLoop();
  }
}
