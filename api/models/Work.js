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
			collection : 'element',
			via : "id"
		},
		task : {
			type : "array"
			/*
			 	when an element's task is done push its reference here.
				[{ 
					element_id
					task_id
				},{
					element_id
					task_id
				}]
			*/ 
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
		rendezvous : {
			type: 'datetime'
		},
		time : {
			// theorical time needed to finish it in hour
			type: 'int'
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
	beforeCreate : function(values, next){
		next();
	}
};

