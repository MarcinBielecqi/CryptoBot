// import Brain from 'brain.js';

export default class Trainer {
    tresh = { brainSellTresh: 0.99, brainBuyTresh: 0.01 }
    mainBrain = undefined
    data = undefined
    timerInterval = /*10 * 24 * 60 * 60 */ 1000
    hiddenLayers = [16, 8, 4]
    trainingOptions = { iterations: 300, log: details => { console.log(details) } }

    constructor(timerInterval, data) {
        this.data = data;
        this.timerInterval = timerInterval;
    }

    async trainerLoop() {
        var that = this;
        while (true) {
            try {
                await that.timer();
                await that.trainBrain([]);
            } catch (error) {
                console.error('trainerLoop error');
            }
        }
    }

    timer() {
        let that = this;
        return new Promise(res => {
            setTimeout(res, that.timerInterval)/*ms*/
        });
    }


    async trainBrain(data) {
        var that = this;
        console.log('trainBrain');

        that.data.getVectors()

        // crossValidate = new Brain.CrossValidate(Brain.NeuralNetwork, { hiddenLayers: that.hiddenLayers });

        // that.mainBrain.train(data, that.trainingOptions);

        // crossValidate.train(data, that.trainingOptions);
        // that.mainBrain = crossValidate.toNeuralNetwork()
    }

    getBrain() {
        return this.mainBrain;
    }

}

