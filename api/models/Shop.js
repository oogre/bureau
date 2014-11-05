/**
* Shop.js
*
* @description :: Un magasin (shop) définit un lieu de travail via un nom de magasin (name), une marque (brand), un lieu (city), une adresse (addres). Cet objet peut possèder des éléments frigorifiques et des groups d'éléments frigorifique.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		name : {
			type: 'string',
			required: true,
			maxLength: 128
		},

		brand : {
			type: 'string',
			required: true,
			maxLength: 128
		},

		element : {
			collection:'element',
			via: 'owner'
		},

		group : {
			collection:'group',
			via: 'owner'
		},

		contacts :{
			type: 'array'
		},

		tva :{
			type: 'string',
			maxLength: 32,
		},

		addres :{
			type: 'string',
			maxLength: 64,
		},

		zipcode :{
			type: 'string',
			maxLength: 16,
		},

		city :{
			type: 'string',
			maxLength: 32,
		},

		country :{
			type: 'string',
			maxLength: 32,
		},

		location : {
			type : "object"
		}
	},

	beforeCreate : function(values, next){
		if(values.addres && values.zipcode && values.city && values.country){
			var addres = values.addres+"+"+values.zipcode+"+"+values.city+"+"+values.country;
			var location = sails.config.google.geocode(addres, function(location){
				values.location = location;
				return next();
			}, function(message){
				console.log(message);
				return next();
			});
		}else{
			return next();
		}
	},
	beforeUpdate : function(values, next){
		if(values.addres && values.zipcode && values.city && values.country){
			var addres = values.addres+"+"+values.zipcode+"+"+values.city+"+"+values.country;
			var location = sails.config.google.geocode(addres, function(location){
				values.location = location;
				return next();
			}, function(message){
				console.log(message);
				return next();
			});
		}else{
			return next();
		}
	}
};

