'use strict';

var ajax =  require('../../ajax'),
	util = require('../../util');

var updateContainer = function (data) {
	var $availabilityMsg = $('#pdpMain .availability .availability-msg');
	var message; // this should be lexically scoped, when `let` is supported (ES6)
	var p = {
			pdpMain: $("#pdpMain"),
			addToCart: $("#add-to-cart"),
        	addAllToCart: $("#add-all-to-cart"),
        	inventoryContainer: $(".inventory")
		};
		p.pdpForm = p.pdpMain.find("form.pdpForm");
		var q = p.pdpMain.find("div.availability");
	
		if (!data) {
			$availabilityMsg.html(Resources.ITEM_STATUS_NOTAVAILABLE);
	        p.addToCart.removeAttr("disabled");
	        p.addToCart.show();
	        q.find(".availability-qty-available").html();
	        q.find(".availability-msg").show();
			return;
		} else {
	        p.addToCart.attr("disabled", "disabled");
	        var t = null;
	        var w = q.find(".availability-msg").html("");
	        
	        if (data.levels.IN_STOCK > 0) {
	            t = w.find(".in-stock-msg");
	            if (t.length === 0) {
	                t = $("<p/>").addClass("in-stock-msg").appendTo(w)
	            }
	           if (data.levels.PREORDER == 0 && data.levels.BACKORDER == 0 && data.levels.NOT_AVAILABLE == 0) {
	                
	                if (data.maxQtyMsg.length === 0 && !data.hasOwnProperty("decimalError")) {
	                    t.text(data.inStockDefaultMsg);
	                    p.addToCart.removeAttr("disabled");
	                    p.addToCart.show();
	                    p.inventoryContainer.show()
	                    
	                } else {
	                    t = w.find(".not-available-msg");
	                    if (t.length === 0) { 
	                        t = $("<p/>").addClass("not-available-msg").appendTo(w)
	                    }
	                    var u = data.hasOwnProperty("decimalError") ? data.decimalError : data.maxQtyMsg;
	                    t.text(u).show();
	                }
	            } else {
	                t.text(data.levels.inStockMsg)
	            } 
	        }
	        if (data.levels.PREORDER > 0) {
                t = w.find(".preorder-msg");
                if (t.length === 0) {
                    t = $("<p/>").addClass("preorder-msg").appendTo(w)
                }
                if (data.levels.IN_STOCK == 0 && data.levels.BACKORDER == 0 && data.levels.NOT_AVAILABLE == 0) {
                    t.text(data.levels.resources.PREORDER)
                } else {
                    t.text(data.preOrderMsg)
                }
            }
            if (data.levels.BACKORDER > 0) {
                t = w.find(".backorder-msg");
                if (t.length === 0) {
                    t = $("<p/>").addClass("backorder-msg").appendTo(w)
                }
                if (data.levels.IN_STOCK == 0 && data.levels.PREORDER == 0 && data.levels.NOT_AVAILABLE == 0) {
                    t.text(data.levels.BACKORDER)
                } else {
                    t.text(data.backOrderMsg)
                }
            }
            if (data.inStockDate != "") {
                t = w.find(".in-stock-date-msg");
                if (t.length === 0) {
                    t = $("<p/>").addClass("in-stock-date-msg").appendTo(w)
                }
                t.text(String.format(data.levels.IN_STOCK_DATE, data.inStockDate))
            }
            if (data.levels.NOT_AVAILABLE > 0) {
                t = w.find(".not-available-msg");
                if (t.length === 0) {
                    t = $("<p/>").addClass("not-available-msg").appendTo(w)
                }
                if (data.levels.PREORDER == 0 && data.levels.BACKORDER == 0 && data.levels.IN_STOCK == 0) {
                    t.text(data.levels.NOT_AVAILABLE)
                } else {
                    t.text(data.levels.REMAIN_NOT_AVAILABLE)
                }
            }
            return
		}
		p.addToCart.attr("disabled", "disabled");
        q.find(".availability-msg").hide();
        var v = q.find(".availability-qty-available");
        if (v.length === 0) {
            v = $("<span/>").addClass("availability-qty-available").appendTo(q)
        }
        v.text(data.inStockMsg).show();
        var v = q.find(".availability-qty-available");
        if (v.length === 0) {
            v = $("<span/>").addClass("availability-qty-available").appendTo(q)
        }
        v.text(data.backorderMsg).show()
	 p.pdpMain.find("form.pdpForm input[name='Quantity']").trigger("change");
	
};

var getAvailability = function () {
	ajax.getJson({
		url: util.appendParamsToUrl(Urls.getAvailability, {
			pid: $('#pid').val(),
			Quantity: $(this).val()
		}) ,
		callback: updateContainer
	});
};

module.exports = function () {
	$('#pdpMain').on('change keyup', '.pdpForm input[name="Quantity"]', getAvailability);
};
