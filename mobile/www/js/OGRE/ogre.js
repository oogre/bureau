window.OOGRE = function(){
	"use strict";
	/*global _ : false */
	/*global JST : false */

	var _debug = true;
	var _mobile = (typeof(undefined) !== typeof(cordova));
	var _logged = JSON.parse(window.localStorage.getItem("user")) || false;
	var _controller = "";

	var EventsHandler = function(){
		var _events = [];
		var _actions = {};
		return {
			addEvent : function(event){
				if(!_.contains(_events, event)){
					_events.push(event);
				}
				return this;
			},
			on : function(event, action){
				if(_.contains(_events, event)){
					_actions[event] = _actions[event]||[];
					_actions[event].push(action);
				}
				else{
					throw new Error("UNKNOW EVENT : "+event);
				}
				return this;
			},
			fire : function(eventName, data){
				if(_.isArray(_actions[eventName])){
					return _actions[eventName]
					.map(function(action){
						return action(data);
					});
				}
				else{
					throw new Error("UNKNOW EVENT : "+event);
				}
				return this;
			},
			flush : function(eventName){
				if(_.isArray(_actions[eventName])){
					_actions[eventName] = [];
				}
				else{
					throw new Error("UNKNOW EVENT : "+event);
				}
				return this;
			}
		};
	};

	var _log = function(data){
		if(_debug){
			window.console.log(data);
		}
	};
	

	return _.extend({
		log : _log,
		debug : _debug,
		mobile : _mobile,
		isLogged : function(){
			return _logged||false;
		},
		setLogged : function(data){
			if(_.isObject(data)){
				_logged = data;
				window.localStorage.setItem("user", JSON.stringify(data));
				window.OOGRE.fire("loginChange", data);
			}
		},
		getController : function(){
			return _controller;
		},
		setController : function(template){
			var tmp = template.split("/");
			if(tmp.length>1){
				_controller = tmp[0];
			}else{
				_controller = "index";
			}
			return _controller;
		},
		EventsHandler : EventsHandler,
		UI : window.OOGRE.UI,
		JST : function(template, object){
			object = object || {};

			if(this.data){
				object._csrf = this.data._csrf;
			}
			if(!JST["www/templates"+template+".ejs"]) throw new Error("UNKNOW template "+template+" : 'www/templates"+template+".ejs'");
			return JST["www/templates"+template+".ejs"](object);
		},
	}, new EventsHandler());
};




