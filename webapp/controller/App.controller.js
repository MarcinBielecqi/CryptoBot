sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.demo.worklist.controller.App", {

		onInit: function () {
			var oModel = new sap.ui.model.json.JSONModel(), that = this;
			that.setModel(oModel, "oSettingsModel");
			that.getModel("oSettingsModel").setProperty("/hideZeros", false)
		}
	});
});