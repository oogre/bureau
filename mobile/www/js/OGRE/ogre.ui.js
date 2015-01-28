(function(){
	"use strict";
	/*global _ : false */
	/*global $ : false */
	/*global OOGRE : false */

	window.OOGRE = window.OOGRE || {};
	window.OOGRE.UI = {
		view : function(name, data){
			$("#content")
			.empty()
			.append(OOGRE.JST("/"+name, data));
			OOGRE.fire("controllerChange", OOGRE.setController(name));
			return this;
		},
		html : function(parent, name, data){
			$(parent)
			.empty()
			.append(window.OOGRE.JST("/"+name, data));
			return this;
		},
		canvas : {
			toBlob : function(canvas){
				var blobBin = atob(canvas.toDataURL("image/png").split(",")[1]);
				var array = [];
				for(var i = 0; i < blobBin.length; i++) {
					array.push(blobBin.charCodeAt(i));
				}
				return new Blob([new Uint8Array(array)], {type: "image/png"});
			}
		},
		table : {
			filter : function(table, input, selectors){
				var $input = $(input);
				var $table = $(table);
				if(!_.isArray(selectors)) throw new Error("UNKNOW selectors");
				$input
				.on("keyup", function(){
					var needle = $(this).val();
					if(needle){
						needle = needle.toLowerCase();
						var toShow = [];
						var toHide = [];
						selectors
						.map(function(selector){ 
							toHide = 	toHide
										.concat(	$table
													.find("tbody td[data-db-row-name='"+selector+"']:not([data-db-row-value*='"+needle+"'])")
													.parent()
													.toArray() );
							toShow = 	toShow
										.concat(	$table
													.find("tbody td[data-db-row-name='"+selector+"'][data-db-row-value*='"+needle+"']")
													.parent()
													.toArray() );
						});
						toHide
						.map(function(elem){
							$(elem).hide();
						});
						toShow.map(function(elem){
							$(elem).show();
						});
					}
					else{
						$table
						.find("tbody tr")
						.show();
					}
				});
			}
		},
		loader : function(button){
			var $button = $(button);
			var _classes = {
				"default" : "btn-default",
				loading : "btn-primary",
				success : "btn-success",
				error : "btn-danger"
			};
			var _spinner = {
				html : "<i class='fa fa-spinner fa-spin' ></i><i>&nbsp; </i>",
				selector : "i.fa.fa-spinner.fa-spin"
			};
			return {	
				start : function(){
					$button
					.removeClass(_classes.default)
					.removeClass(_classes.success)
					.removeClass(_classes.error)
					.addClass(_classes.loading)
					.prepend(_spinner.html);
				},	
				stop : function(){
					$button
					.removeClass(_classes.default)
					.removeClass(_classes.loading)
					.removeClass(_classes.error)
					.addClass(_classes.success)
					.find(_spinner.selector)
					.remove();
				},	
				error : function(){
					$button
					.removeClass(_classes.default)
					.removeClass(_classes.success)
					.removeClass(_classes.loading)
					.addClass(_classes.error)
					.find(_spinner.selector)
					.remove();
				}
			};
		},
		errorMessage : function(message){
			message = 	(function(jsonString){
							if(!jsonString)
								return false;
							try{
								return JSON.parse(jsonString);
							}catch(e){
								return false;
							}
						}(message.responseText));

			if(!message || !message.invalidAttributes) return false;

			var invalidAttributes = _.keys(message.invalidAttributes);
			invalidAttributes
			.map(function(invalidAttribute){
				$("[name='"+invalidAttribute+"']")
				.parent()
				.addClass("has-error");
			});
		},
		dropdown : function(input){
			var $self = input;
			var $list = $($self.attr("data-toggle-target"));
			var _eHandler = new window.OOGRE.eventsHandler(["select", "inputFeed", "inject"]);
			var _closeList = function(){
				$list
				.empty()
				.hide();
				$self
				.removeClass("open");
			};
			var _openList = function(){
				$list
				.show();
				$self
				.addClass("open");
			};
			var _keyAction = function(keyCode){
				if(keyCode == 40){
					if($list.children("li.active").next("li").length>0){

						$list
						.children("li.active")
						.next("li")
						.children("a")
						.focus();
					}else{
						$list
						.children("li:first-child")
						.children("a")
						.focus();
					}
				}
				else if(keyCode == 38){
					if($list.children("li.active").prev("li").length>0){
						$list.children("li.active").prev("li").children("a").focus();
					}else{
						$self.focus();
					}
				}
			};
			var _updateList = function(data){
				$list
				.empty()
				.append( _eHandler.trigger("inject", data).join("") );
				if($list.is(":empty")){
					_closeList();
				}
				else{
					$self
					.on("blur", function(){
						setTimeout(function(){
							if($list.children("li.active").length === 0){
								_closeList();
							}
						}, 500);
					});
					$list
					.children("li")
					.on("mouseover", function(){
						$(this)
						.children("a")
						.focus();
					})
					.on("click", function(){
						var event = {
							origin : $(this).children("a"),
							target : $self
						};
						_eHandler.trigger("select", event);
						_closeList();
						return false;
					})
					.children("a")
					.on("mouseover focus", function(){
						$(this)
						.parent()
						.addClass("active");
					})
					.on("blur", function(){
						$(this)
						.parent()
						.parent()
						.children("li.active")
						.removeClass("active");
						setTimeout(function(){
							if($list.children("li.active").length === 0 && !$self.is(":focus")){
								_closeList();
							}
						}, 500);
					})
					.on("keyup", function(event){
						if(event.keyCode === 40 || event.keyCode === 38){
							_keyAction(event.keyCode);
						}
					})
					.on("click keyup", function(event){
						if(event.keyCode === 13 || event.keyCode === undefined){
							
							_eHandler.trigger("select", {
								origin : $(this),
								target : $self
							});
							_closeList();
							return false;
						}
					});
					_openList();
				}
			};

			$self
			.on("keyup", function(event){
				var value = $(this).val()||"";

				if(!value){
					_closeList();
				}
				else if(event.keyCode === 40 || event.keyCode === 38){
					_keyAction(event.keyCode);
				}
				else{
					_eHandler.trigger("inputFeed", {
						value : value,
						target : $self
					});
				}
			});

			return {
				on : function(event, action){
					_eHandler.on(event, action);
					return this;
				},
				update : function(data){
					_updateList(data);
					return this;
				}
			};
		}
	};
}());