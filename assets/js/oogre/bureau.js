(function(){
	"use strict";
	/*global PASS:false */

	window.BUREAU = window.BUREAU || {};

	BUREAU.tools = {
		canvasToForm : function(canvas){
			var blobBin = atob(canvas.toDataURL("image/png").split(',')[1]);
			var array = [];
			for(var i = 0; i < blobBin.length; i++) {
    			array.push(blobBin.charCodeAt(i));
			}
			return new Blob([new Uint8Array(array)], {type: 'image/png'});
		},
		sortable : function(elem, callbackOndrop){
			var adjustment;
			$(elem).sortable({
				onDrop: function  (item, targetContainer, _super) {
					var clonedItem = $('<li/>').css({height: 0})
					item.before(clonedItem)
					clonedItem.animate({
						'height': item.height(),
						'width': item.width()
					})
					item.animate(clonedItem.position(), function  () {
						clonedItem.detach();
						_super(item);
						item.css({
		                    backgroundColor : "#"+adjustment.color
		                });
					});
					callbackOndrop(item);
				},
				onDragStart: function ($item, container, _super) {
					var offset = $item.offset();
					var pointer = container.rootGroup.pointer;

					adjustment = {
						width : $item.width(),
						height : $item.height(),
						left: pointer.left - offset.left,
						top: pointer.top - offset.top
					};
					_super($item, container);
				},
				onDrag: function ($item, position) {
					$item.css({
						width : adjustment.width,
						height : adjustment.height,
						left: position.left - adjustment.left,
						top: position.top - adjustment.top
					});
					$("ol#elements li.placeholder").css({
						width : adjustment.width,
						height : adjustment.height,
					});
				}
			});
		},

		realTime : function(){
			var _timers = [];
			var _value = moment.duration(0, "seconds");
			var _display = function(duration){};
			var _events = {
				"stop" : [],
				"start" : []
			};
			var _data = {};
			return {
				display : function(cb){
					_display = cb;
					return this;
				},
				inc : function(durationInSeconds){
					if(durationInSeconds){
						_value = _value.add(durationInSeconds, 'seconds');
						_display(_value);
					}
					return this;
				},
				data : function(name, data){
					if(_.isUndefined(name) || _.isNull(name)){
						return _data;
					}
					else if(_.isUndefined(data)){
						return _data[name];	
					}
					else{
						_data[name] = data;	
						return this;
					}
				},
				startTimer : function(multiTimer, disableEvent){
					multiTimer = multiTimer || _.isUndefined(multiTimer) || _.isNull(multiTimer) ? true : false; 
					var _this = this;
					if(multiTimer || _timers.length == 0){
						_timers.push( setInterval(function(){
								_this.inc(1);
							}, 1000)
						);
					}
					if(!disableEvent){
						this.fire("start");
					}

					return this;
				},
				stopTimer : function(){
					clearInterval(_timers[0]);
					_timers.shift();
					this.fire("stop");
					return this;
				},
				addEvent : function(name){
					_events[name] = [];
					return this;
				},
				fire : function(event, data){
					var _this = this;
					_.isArray(_events[event])&&
					_events[event]
					.map(function(cb){
						cb(_this, data);
					});
					return _this;
				},
				on : (function(type, cb){
					if(_.isFunction(cb) && _.isArray(_events[type])){
						_events[type].push(cb);
					}
					return this;
				})
			}
		},
		popover : function(){
			$('[data-toggle="popover"]').popover({
				trigger:'focus',
				html : true,
				title : "<i class='fa fa-info-circle'></i>&nbsp; Info"
			});
		},
		link : function(){
			if(document.referrer == window.location.href){
				$("a[href='/back'").addClass("hide");
			}


			$("a:not([href*=destroy])").on("click", function(){
				var href = $(this).attr("href")
				if(href == "/back"){
					href = document.referrer;
				}
				window.location.href = href;
				return false;
			});
		},

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
			}).fail(function(message){
				if(fail && jQuery.isFunction(fail)){
					fail(message);
				}
			});
		},
		parse : function(jsonString){
			if(!jsonString)return false;
			try{
				return JSON.parse(jsonString);
			}catch(e){
				return false;
			}
		},
		form : {
			submitWaiter: {
				start : function(elem){
					$(elem)
					.toggleClass("btn-default")
					.toggleClass("btn-primary")
					.prepend("<i class='fa fa-spinner fa-spin' ></i><i>&nbsp; </i>");
				},
				stop : function(elem){
					$(elem)
					.toggleClass("btn-default")
					.toggleClass("btn-primary")
					.find("i")
					.remove();
				},
				error : function(elem){
					$(elem)
					.toggleClass("btn-default")
					.toggleClass("btn-danger")
					.find("i")
					.first()
					.remove();
				}
			},
			submitErrorHandler : function(message){
				message = BUREAU.tools.parse(message.responseText);
				if(message && message.invalidAttributes){
					var invalidAttributes = Object.keys(message.invalidAttributes);
					invalidAttributes.map(function(invalidAttribute){
						$("[name='"+invalidAttribute+"']").parent().addClass("has-error");
					})
				}
			}
		},
		input : {
			focus : function(){
				$("input, select, textarea")
				.on("focus", function(){
					$(this)
					.parent()
					.find("label")
					.addClass("bg-primary")
				})
				.on("blur", function(){
					$(this)
					.parent()
					.find("label")
					.removeClass("bg-primary")
				});
			}
		},
		table : {
			filter : function(table, input, selectors){
				input.on("keyup", function(){
					var needle = $(this).val();
					console.log(needle);
					if(needle){
						needle = needle.toLowerCase();

						var toShow = [];
						var toHide = [];
						selectors
						.map(function(selector){ 
							toHide = 	toHide
										.concat(	table
													.find("tbody td[data-db-row-name='"+selector+"']:not([data-db-row-value*='"+needle+"'])")
													.parent()
													.toArray() );
							toShow = 	toShow
										.concat(	table
													.find("tbody td[data-db-row-name='"+selector+"'][data-db-row-value*='"+needle+"']")
													.parent()
													.toArray() );
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
		},
		substructure : function(children, getData, getNext){
			return 	$(children)
					.toArray()
					.map(function(child){
						var object = _.isFunction(getData) ? getData(child) : (_.isObject ? getData : {});
						object.substructure = BUREAU.tools.substructure( _.isFunction(getNext) ? getNext(child) : [], getData, getNext );
						return object;
					});
		},

		find : {
			element : function(where){
				return BUREAU.tools.api({
					url : "/element/find/?where="+JSON.stringify(where),
					type : "get",
				})
				.pipe(function(data){
					return $.Deferred().resolve(data);
				}, function(data){
					return $.Deferred().reject(data);
				});
			}
		}
	}

	$(document).on("ready", function(){
		_.mixin(_.str.exports());
		_.mixin({
			includeString: _.str.include,
			reverseString: _.str.reverse
		});

		BUREAU.tools.link();
	});
})();