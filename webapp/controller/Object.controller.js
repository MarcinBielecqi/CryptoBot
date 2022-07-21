sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
	"use strict";

	return BaseController.extend("sap.ui.demo.worklist.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			}
			);
		},

		plot: function (plotData) {
			var data = plotData.data, lastBuy = plotData.lastBuy,
				layout = {
					paper_bgcolor: 'rgba(0,0,0,0)',
					plot_bgcolor: 'rgba(0,0,0,0)',
					title: 'Price',
					autosize: true,
					yaxis: { title: '', gridcolor: '#2e2e2e', type: 'log', side: 'right' },
					yaxis2: { title: 'Price', gridcolor: '#2e2e2e', },
					yaxis3: { title: 'Trades', gridcolor: '#2e2e2e', type: 'log', side: 'right' },
					xaxis: {
						gridcolor: '#2e2e2e',
						type: 'date'
					}
				};
			// if (lastBuy.y0 && lastBuy.y1) layout.shapes = [lastBuy];
			try {
				Plotly.deleteTraces('divPlotId', 0);
			} catch (error) {
				//not yet
			}
			try {
				Plotly.newPlot('divPlotId', data, layout);
			} catch (error) {
				//not yet
			}
		},

		prepareData: function (data, deal) {
			var lines = Object.keys(data[0]).map(value => {
				var line = {
					x: data.map(element => { return element.timeStamp }),
					y: data.map(element => {
						if (element[value] && element[value][0]) {
							return element[value][0]
						} else {
							return element[value]
						}
					}),

					name: value,
					line: {},
					type: 'scatter'
				};
				if (line.name !== 'currentPrice') { line.visible = 'legendonly'; line.line = { opacity: 0.3 } } else { line.line = { color: 'Blue', opacity: 0.9 } }
				if (line.name.includes('Price') || line.name.includes('open') || line.name.includes('high') || line.name.includes('low')) { line.yaxis = 'y2' } else if (line.name.includes('Trade')) { line.yaxis = 'y3' };
				return line
			}).filter(line => { return line !== undefined }).filter(line => {
				return line.name !== 'timeStamp' && !line.y.includes(null)
			});

			var spikeMax = {
				x: data.filter(element => { return element.spike === 'MAX' }).map(element => { return element.timeStamp }),
				y: data.filter(element => { return element.spike === 'MAX' }).map(element => { return element.currentPrice }),
				name: 'Spikes',
				marker: {
					color: 'Green',
					opacity: 0.9,
					size: 4
				},
				visible: 'legendonly',
				mode: 'markers',
				type: 'scatter',
				yaxis: 'y2'
			}, spikeMin = {
				x: data.filter(element => { return element.spike === 'MIN' }).map(element => { return element.timeStamp }),
				y: data.filter(element => { return element.spike === 'MIN' }).map(element => { return element.currentPrice }),
				name: 'Minimum',
				marker: {
					color: 'Red',
					opacity: 0.9,
					size: 4
				},
				visible: 'legendonly',
				mode: 'markers',
				type: 'scatter',
				yaxis: 'y2'
			}, brainSpikeMax = {
				x: data.filter(element => { return element.brainSpike === 'MAX' }).map(element => { return element.timeStamp }),
				y: data.filter(element => { return element.brainSpike === 'MAX' }).map(element => { return element.currentPrice }),
				name: 'TESTSpikes',
				marker: {
					color: 'Green',
					opacity: 0.9,
					size: 8
				},
				mode: 'markers',
				type: 'scatter',
				yaxis: 'y2'
			}, brainSpikeMin = {
				x: data.filter(element => { return element.brainSpike === 'MIN' }).map(element => { return element.timeStamp }),
				y: data.filter(element => { return element.brainSpike === 'MIN' }).map(element => { return element.currentPrice }),
				name: 'TESTMinimum',
				marker: {
					color: 'Red',
					opacity: 0.9,
					size: 8
				},
				mode: 'markers',
				type: 'scatter',
				yaxis: 'y2'
			}, sell = {
				x: deal.sell.map(element => { return element.transactTime }),
				y: deal.sell.map(element => { return element.price }),
				name: 'sell',
				marker: {
					color: 'Green',
					symbol: 'cross',
					opacity: 0.9,
					size: 8
				},
				mode: 'markers',
				type: 'scatter',
				yaxis: 'y2'
			}, buy = {
				x: deal.buy.map(element => { return element.transactTime }),
				y: deal.buy.map(element => { return element.price }),
				name: 'buy',
				marker: {
					color: 'Red',
					symbol: 'cross',
					opacity: 0.9,
					size: 8
				},
				mode: 'markers',
				type: 'scatter',
				yaxis: 'y2'
			};
			// , lastBuy = {
			// 	type: 'line',
			// 	name: 'Last Buy',
			// 	x0: data[0].timeStamp,
			// 	y0: buy.y[buy.y.length - 1],
			// 	x1: data[data.length - 1].timeStamp,
			// 	y1: buy.y[buy.y.length - 1],
			// 	layer: 'below',
			// 	line: {
			// 		color: 'gray',
			// 		width: 8,
			// 		opacity: 0.3,
			// 		dash: 'dot'
			// 	},
			// 	yaxis: 'y2'
			// };

			return { data: lines.concat([spikeMax, spikeMin, brainSpikeMax, brainSpikeMin, buy, sell]) }
		},





		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		getChart: function (pair) {
			var that = this;
			//ajax call
			$.ajax({
				url: 'http://localhost:3002/getChart',
				method: 'POST',
				data: { pair: pair },
			}).done(function (data) {
				//if we have a successful post request ...
				if (data.success) {
					that.plot(that.prepareData(data.message.data, data.message.deal));
					var oModel = new sap.ui.model.json.JSONModel()
					oModel.setData(data.message.data.map(element => {
						return {
							timeStamp: element.timeStamp,
							currentPrice: element.currentPrice,
							vector: element.vector[0]
						};
					}));
					that.setModel(oModel, "oDataModel");
				}
			}).fail(function () {
				//do nothing ....
				console.log('failed...');
				return null;
			});
		},

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		onEvaluate: function () {
			var oData = this.getModel("oDataModel").getData();
			var dataMatrix = [];

			for (var i = 0; i < 50; i++) {
				for (var j = 0; j < 50; j++) {
					dataMatrix.push(
						{
							position: { i, j },
							profit: this.estimateProfit(oData, this.getTresh(oData, i, j))
						}
					);
				}
			}

			var sortedProfit = dataMatrix.sort(function (a, b) {
				return b.profit - a.profit
			})

			var max = sortedProfit[0];
			debugger;
		},

		estimateProfit: function (oData, tresh) {

			var buyPrice = null,
				startQuote = 1;

			oData.filter((element) => {
				return element.vector >= tresh.maxTresh || element.vector <= tresh.minTresh;
			}).sort(function (a, b) {
				return b.timeStamp - a.timeStamp
			}).forEach((element, index, array) => {
				if (element.vector <= tresh.minTresh && !buyPrice) {
					buyPrice = element.currentPrice;
				} else if (element.vector >= tresh.maxTresh && buyPrice) {
					startQuote = startQuote * element.currentPrice / buyPrice;
					buyPrice = null;
				}
			});

			return startQuote;
		},

		getTresh: function (oData, iMax, iMin) {

			var sortedData = oData.sort(function (a, b) {
				return b.vector - a.vector
			})

			return {
				maxTresh: sortedData[iMax].vector,
				minTresh: sortedData[oData.length - 1 - iMin].vector,
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getChart(sObjectId)
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("Objects", {
					ObjectID: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.ObjectID,
				sObjectName = oObject.Name;

			oViewModel.setProperty("/busy", false);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		}

	});

});