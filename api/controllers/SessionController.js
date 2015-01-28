/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
"use strict";
	/*global module : false */
	/*global require : false */
	

var bcrypt = require("bcrypt");

module.exports = {
	"new" : function(req, res){
		res.view();
	},

	"create" : function(req, res, next){

		if(!req.param("email") || !req.param("password")){
			req.session.flash = {
				err : {
					error : "userEmailPasswordRequiredError",
					data : null
				}
			};
			res.status(403);
			return res.json(req.session.flash);
			return res.redirect("/session/new");
		}
		Worker.findOne()
		.where(
			{email : req.param("email")
		})
		.then(function(worker){
			if(!worker){
				req.session.flash = {
					err : {
						error : "noAccountError",
						data : {
							email : req.param("email")
						}
					}
				};
				res.status(404);
				return res.json(req.session.flash);
				return res.redirect("/session/new");
			}
			bcrypt.compare(req.param("password"), worker.encryptedPassword, function(err, valid){
				if(err)next(err);
				if(!valid){
					req.session.flash = {
						err : {
							error : "userEmailPasswordMismatchError",
							data : {
								email : req.param("email")
							}
						}
					};
					res.status(404);
					return res.json(req.session.flash);
					return res.redirect("/session/new");
				}
				worker.signin(req.session, function (err, onlineUser){
					if(err) return next(err);
					res.status(200);
					return res.json(onlineUser);

					if(onlineUser.role.id >= 99){
						return res.redirect("work/index/");
					}else{
						return res.redirect("worker/show/"+onlineUser.id);
					}
				});
			});
		})
		.catch(function(err){
			return next(err);
		});
	},
	"destroy" : function(req, res, next){
		Worker.findOne({
			id : req.session.worker.id
		})
		.then(function(worker){
			if(worker){
				worker.signout(req.session, function (err){
					if(err)return next(err);
					return res.redirect("/");
				});
			}else{
				req.session.destroy();
				return res.redirect("/");
			}
		})
		.catch(function(){
			req.session.destroy();
			return res.redirect("/");
		});
	}
};

