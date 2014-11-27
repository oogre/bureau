/**
* Element.js
*
* @description :: Un élément (element) défini un objet frigorifique ex: évaporateur, condensateur, chambre froide, chambre de pousse,  
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes : {
		name : {
			type: 'string',
			required: true,
			maxLength: 128,
		},

		serial : {
			type: 'string',
			maxLength: 128,
		},

		type : {
			model : 'elementType'
		},

		substructure : {
			type : "Array"
		},

		task : {
			collection : 'task',
			via : "id"
		},
		
		owner : {
			model : 'shop',
			required: true
		},

		wiki : {
			collection : 'wiki',
			via : "id"
		}
	},
	/*
	beforeCreate : function(values, next){
		console.log(values);
		
	},
	afterCreate : function(values, next){
		console.log(JSON.stringify(values));
		next();
	}*/
};

