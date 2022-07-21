sap.ui.define(["sap/ui/core/Control"], function (Control) {
	"use strict";
	return Control.extend("sap.ui.demo.worklist.control.SmartBotChart", {
		"metadata": {
			"properties": {},
			"events": {},
			"aggregations": {
				"FixFlex": {
					"type": "sap.ui.layout.FixFlex",
					"multiple": false
				}
			}
		},
		init: function () { 

		},
		renderer: function (oRm, oControl) {
			oControl.getFixFlex().getFlexContent().sId = oControl.getFixFlex().getFixContent()[0].getHeaderText();
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("smartBotChart");
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<ul");
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("FixFlex"));
			oRm.write("</ul>");
			oRm.write("</div>");
		},
		onAfterRendering: function (evt) { }
	});
});




// sap.ui.define([
//     "sap/ui/core/Control",
//     "sap/viz/ui5/controls/VizFrame"
// ], function (Control, VizFrame) {
//     "use strict";
//     return Control.extend("sap.ui.demo.worklist.control.SmartBotChart", {
//         metadata: {
//             defaultAggregations : 'vizFrame',
// 			aggregations : {
// 				vizFrame : {type : "sap.viz.ui5.controls.VizFrame", multiple: false, visibility : "hidden"},
// 			},
//         },

//         init: function () {
//             var x = {
//                 vizProperties: {
//                     plotArea: {
//                         callout: {
//                             top: [{
//                                 dataContext: [{
//                                     Month: "7/1/2016"
//                                 }]
//                             }]
//                         },
//                         dataPointStyle: {
//                             "rules":
//                                 [
//                                     {
//                                         "dataContext": { "Month": "7/1/2016" },
//                                         "properties": {
//                                             "dataLabel": true
//                                         }
//                                     }
//                                 ],
//                             "others":
//                             {
//                                 "properties": {
//                                     "dataLabel": false
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         },

// 		renderer : function (oRM, oControl) {
// 			oRM.write("<div");
// 			oRM.writeControlData(oControl);
// 			oRM.addClass("smartBotChart");
// 			oRM.writeClasses();
// 			oRM.write(">");
// 			oRM.renderControl(oControl.getAggregation("vizFrame"));
// 			oRM.write("</div>");
// 		}
//     });
// });