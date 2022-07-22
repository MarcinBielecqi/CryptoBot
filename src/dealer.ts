
export default class Dealer {
    data = undefined
    trainer = undefined
    timerInterval = /*10 * 24 * 60 * 60 */ 2 * 1000

    constructor(timerInterval, data, trainer) {
        this.data = data;
        this.trainer = trainer;
        this.timerInterval = timerInterval;
    }

    async dealerLoop() {
        var that = this;
        while (true) {
            try {

                await that.timer();
                await that.doSth();
            } catch (error) {
                console.error('dealerLoop error');
            }
        }
    }

    timer() {
        let that = this;
        return new Promise(res => {
            setTimeout(res, that.timerInterval)/*ms*/
        });
    }

    async doSth() {
        console.log('dealer');
    }

}

