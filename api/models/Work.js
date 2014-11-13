/**
* Work.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		shop : {
			model : 'shop',
			required : true,
		},
		element : {
			model : 'element',
			required : true
		},
		type : {
			model : 'workType',
			required : true
		},
		worker : {
			collection : 'worker',
			via : "id"
		},
		route : {
			// seconds between HQ and shop
			type : "integer" 
		},
		schedule : {
			// worker schedule
			collection : 'workSchedule',
			via : "work"
		},
		deadLine : {
			type: 'datetime'
		},
		closedAt : {
			type: 'datetime'
		},
		wiki : {
			collection : 'wiki',
			via : "id"
		}
	},
	beforeUpdate : function(values, next){
		next();
	}
};

