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
		},

		toJSON: function(){
			var  obj = this.toObject();
			delete obj.password;
			delete obj.confirmation;
			delete obj.encryptedPassword;
			delete obj._csrf;
			return obj;
		},

		cleanSession : function(){
			var  obj = this.toObject();
			delete obj._csrf;
			return obj;
		},

		initSession : function(session){
			var birthDate = new Date()
			var deathDate = new Date(birthDate.getTime() + sails.config.session.cookie.maxAge);
			session.cookie.expires = deathDate;
			session.authenticated = true;
			session.worker = this.cleanSession();
			this.online = true;
			return this;
		},

	    destroySession : function(session){
	      this.online = false;
	      session.destroy();
	      return this;
	    },

		signin : function(session, next){
			this
			.initSession(session)
			.save(function saved(err, worker){
				if(err){
					worker.destroySession(session);
					return callback(err); 
				}
				return next(null, worker);
			});
		},

		signout : function (session, next){
			this
			.destroySession(session)
			.save(function saved(err, worker){
				if(err){
					return next(err);
				}
				return next(null, worker);
			});
		}
	},
	beforeCreate : function(values, next){
		_.keys(values).map(function(key){
			return values[key] = values[key].toLowerCase ? values[key].toLowerCase() : values[key];
		});

		values.id = require('shortid').generate();
		values.password = values.id;

		

		

		encryptPassword(values.password)
		.then(function(encryptedPassword){
			values.encryptedPassword = encryptedPassword;
			return next();
		}, function(err){
			return next(err)
		})
	},

	beforeUpdate : function(values, next){
		if(values.password){
			encryptPassword(values.password)
			.then(function(encryptedPassword){
				values.encryptedPassword = encryptedPassword;
				return next();
			}, function(err){
				return next(err)
			})
		}else{
			return next();
		}
	}
};

var encryptPassword = function(password){
	var promise = require('promised-io/promise');
	var deferred = new promise.Deferred();
	require("bcrypt")
	.hash(password, 10, function passwordEncrypted(err, encryptedPassword){
		if(err) {
			deferred.reject(err);
		}
		deferred.resolve(encryptedPassword);
	});

	return deferred;
};

