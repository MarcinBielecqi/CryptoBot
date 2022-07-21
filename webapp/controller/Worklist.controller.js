sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.worklist.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.getAllPairs();
		},

		onReload: function () {
			this.getAllPairs();
		},

		onShowNonZero: function () {
			var oModel = this.getModel("oAllCurrenciesModel");
			var oBufferModel = this.getModel("oBufferModel");
			oModel.setData(oBufferModel.getData().filter(element => {
				return element.accountBalances.baseAssetAvailable > 0;
			}));
		},

		onShowProfit: function () {
			var oModel = this.getModel("oAllCurrenciesModel");
			var oBufferModel = this.getModel("oBufferModel");
			oModel.setData(oBufferModel.getData().filter(element => {
				return element.evaluatedProfit > 1;
			}));
		},

		onSelectAll: function () {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(this.getView().getModel("oAllCurrenciesModel").getData().map(element => { var newElement = element; newElement.enabled = true; return newElement }));
			this.setModel(oModel, "oAllCurrenciesModel");
		},

		formatLastUpdate: function (lastUpdate) {
			if (!lastUpdate) return ''
			else {
				var tm = new Date() - lastUpdate,
					h = Math.floor(tm / 1000 / 60 / 60),
					m = Math.floor(tm / 1000 / 60) % 60,
					s = Math.floor(tm / 1000) % 60;
				return [h, m, s].map(myNumber => {
					return myNumber.toLocaleString('en-US', {
						minimumIntegerDigits: 2,
						useGrouping: false
					})
				}).join(":") + ' ago'
			}
		},

		rangeSliderChange: function (event) {
			this.getChart();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},


		onItemPress: function (oEvent) {
			var stableCoin = oEvent.getSource().getParent().mAggregations.cells[3].getTitle();
			var crypto = oEvent.getSource().getParent().mAggregations.cells[5].getTitle();
			this.getRouter().navTo("object", {
				objectId: crypto + stableCoin
			});
		},

		setAllVizProperties: function (oModel) {
			var oComboBoxSpikes = this.getView().byId('comboBoxSpikes')
			var vizProperties = {
				plotArea: {
					callout: { top: [] },
					dataPointStyle: { "rules": [], "others": { "properties": { "dataLabel": false } } }
				}
			};

			var aElements = $("div[id*='__frame']"),
				aControls = [];

			for (let index = 0; index < aElements.length; index++) {
				aControls.push(sap.ui.getCore().byId(aElements[index].id));
			}

			switch (oComboBoxSpikes.getSelectedKey()) {
				case "max_spike":
					var spike = 'spike',
						side = 'MAX';
					break;
				case "min_spike":
					var spike = 'spike',
						side = 'MIN';
					break;
				case "max_brain_spike":
					var spike = 'brainSpike',
						side = 'MAX';
					break;
				case "min_brain_spike":
					var spike = 'brainSpike',
						side = 'MIN';
					break;
				default:
					var spike = '',
						side = '';
					break;
			}

			aControls.forEach(frame => {
				var currencyPair = frame.getParent().getFixContent()[0].getHeaderText(),
					aCurrencyCollection = oModel.getProperty("/currencyCollection");

				aCurrencyCollection.filter(element => { return element.currencyPair === currencyPair }).forEach(element => {
					var aDataContextSpike = element.chart.filter(element => { return element[spike] === side }).map(element => { return { Time: element.timeStamp } });
					var aRulesSpike = element.chart.filter(element => { return element[spike] === side }).map(element => {
						return {
							"dataContext": { "Time": element.timeStamp },
							"properties": {
								"dataLabel": true
							},
							"displayName": oComboBoxSpikes.getSelectedText()
						}
					});

					vizProperties.plotArea.callout.top = [{ dataContext: aDataContextSpike }]
					vizProperties.plotArea.dataPointStyle["rules"] = aRulesSpike;

					frame.setVizProperties(vizProperties);
				});


			});
		},



		onSubmit: function () {
			try {
				var that = this;
				//ajax call
				$.ajax({
					url: 'http://localhost:3002/setEnable',
					method: 'POST',
					data: { enabled: this.getView().getModel('oAllCurrenciesModel').getProperty('/').filter(element => { return element.enabled }).map(element => { return element.currencyPair }).join() },
				}).done(function (data) {
					console.log('ok');
					return;
				}).fail(function () {
					//do nothing ....
					console.log('failed...');
					return;
				});
			} catch (error) {
				console.log('failed...');
				return;
			}
		},

		getAllPairs: function () {
			var that = this;
			var oTable = this.getView().byId('idProductsTable');

			oTable.setBusy(true);
			//ajax call
			$.ajax({
				url: 'http://localhost:3002/getAllPairs',
				method: 'GET'
			}).done(function (data) {
				//if we have a successful post request ...
				if (data.success) {
					var oModel = new sap.ui.model.json.JSONModel()
					var oBufferModel = new sap.ui.model.json.JSONModel()
					oBufferModel.setData(data.message.map(element => {
						var newElement = element;
						newElement.accountBalances.baseAssetAvailable = element.accountBalances.baseAssetAvailable * element.currentPrice;
						return newElement;
					}));
					oModel.setData(oBufferModel.getData());
					that.setModel(oBufferModel, "oBufferModel");
					that.setModel(oModel, "oAllCurrenciesModel");
					oTable.setBusy(false);
					return;
				}
			}).fail(function () {
				//do nothing ....
				oTable.setBusy(false);
				console.log('failed...');
				return;
			});
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ObjectID")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});