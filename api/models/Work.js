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
				[
					{
						value : TRUE || FALSE || input type text,
						element_id
						task_id
					}
				]
			*/ 
		},

		material : {
			type : "array"
			/*
				[
					{
						id
						quantity :
						date : 
					}
				]

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
			type: 'datetime' // => array [datetime]
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
		signature_client : {
			type: 'object'
		},
		signature_adf : {
			type: 'object'
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

