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
			type: 'string',
			required: true,
			maxLength: 128,
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
	beforeCreate : function(values, next){
		values.type = values.type.toLowerCase();
		ElementType.findOneByName(values.type)
		.then(function(element){
			if(!element){
				ElementType.create({
					name : values.type
				})
				.then(function(){})
				.catch(function(err){
					console.error(err);
				});
			}
		})
		.catch(function(err){
			console.error(err);
		});
		next();
	},
};

