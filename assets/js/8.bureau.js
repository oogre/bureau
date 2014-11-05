(function(){
	"use strict";
	/*global PASS:false */

	window.BUREAU = window.BUREAU || {};

	BUREAU.tools = {
		ajax : {
			json : function(request){
				request.dataType = "json";
				return $.ajax(request)
				.pipe(function(data){
					if(true === data.success){
						return $.Deferred().resolve(data.data);
					}else{
						return $.Deferred().reject(data.message);
					}
				}, function(data){
					return $.Deferred().reject(data);
				});
			}
		},
		checkTVA : function(tva, success, fail){
			return BUREAU.tools.ajax.json({
				url : "/shop/checkVat",
				data : {
					countryCode : tva.countryCode,
					num : tva.num
				}
			}).done(function(data){
				if(jQuery.isFunction(success)){
					success(data);
				}
			}).fail(function(){
				if(fail && jQuery.isFunction(fail)){
					fail();
				}
			});
		},
		api : function(request, success, fail){
			return $.ajax(request)
			.done(function(data){
				if(jQuery.isFunction(success)){
					success(data);
				}
			}).fail(function(){
				if(fail && jQuery.isFunction(fail)){
					fail();
				}
			});
		},
		input : {
			focus : function(){
				$("input")
				.on("focus", function(){
					$(this)
					.prev()
					.addClass("bg-primary")
				})
				.on("blur", function(){
					$(this)
					.prev()
					.removeClass("bg-primary")
				});
			}
		},
		table : {
			filter : function(table, input, selectors){
				input.on("keyup", function(){
					var needle = $(this).val();
					if(needle){
						needle = needle.toLowerCase();

						var toShow = [];
						var toHide = [];
						selectors.map(function(selector){ 
							toHide = toHide.concat(table.find("tbody [data-db-row-name='"+selector+"']:not([data-db-row-value*='"+needle+"'])")
							.parent()
							.toArray());

							toShow = toShow.concat(table.find("tbody [data-db-row-name='"+selector+"'][data-db-row-value*='"+needle+"']")
							.parent()
							.toArray());
						});
						
						toHide.map(function(elem){
							$(elem).addClass("hide");
						});
						toShow.map(function(elem){
							$(elem).removeClass("hide");
						});


					}else{
						table
						.find("tbody [data-db-row-name='id']")
						.removeClass("hide");
					}
				})
			}
		}
	}
})();