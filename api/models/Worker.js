/**
* Worker.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes: {
		
		firstname:{
			type:"String",
			required: true
		},
		lastname:{
			type:"String",
			required: true
		},
		adress:{
			type:"String",
		},
		city:{
			type:"String",
		},
		zipcode:{
			type:"String",
		},
		country:{
			type:"String",
		},
		phone:{
			type:"String",
			required: true	
		},
		email :{
			type: "String",
			email: true,
			required: true
		},
		encryptedPassword:{
			type:"String"
		},
		role: {
			model : 'role',
			required : true
		},
		online : {
			type: "boolean",
			defaultsTo: false
		},
		team : {
			type : 'integer',
			defaultsTo: 0
		},
		wiki : {
			collection : 'wiki',
			via : "id"
		}
	},
	beforeCreate : function(values, next){
		_.keys(values).map(function(key){
			return values[key] = values[key].toLowerCase ? values[key].toLowerCase() : values[key];
		});

		values.id = require('shortid').generate();
		values.password = values.id;

		var promise = require('promised-io/promise');

		var encryptPassword = function(password){
			var deferred = new promise.Deferred();
			require("bcrypt")
			.hash(values.password, 10, function passwordEncrypted(err, encryptedPassword){
				if(err) {
					deferred.reject(err);
				}
				deferred.resolve(encryptedPassword);
			});

			return deferred;
		};

		encryptPassword(values.password)
		.then(function(encryptedPassword){
			values.encryptedPassword = encryptedPassword;
			return next();
		}, function(err){
			return next(err)
		})
	}
};

