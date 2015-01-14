/**
 * WorkerController
 *
 * @description :: Server-side logic for managing workers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	"index" : function(req, res, next){
		var where = req.param("where") && "undefined" != req.param("where") ? JSON.parse(req.param("where")) : null;
		var limit = req.param("limit") && "undefined" != req.param("limit") ? JSON.parse(req.param("limit")) : null;
		var sort = req.param("sort") && "undefined" != req.param("sort") ? JSON.parse(req.param("sort")) : null;
		var skip = req.param("skip") && "undefined" != req.param("skip") ? JSON.parse(req.param("skip")) : null;

		Worker.find()
		.where(where)
		.sort(sort)
		.limit(limit)
		.skip(skip)
		.populateAll()
		.then(function foundShops(workers){
			return res.view({
				sort : sort,
				workers : workers
			});
		})
		.catch(function(err){
			return next(err);
		});
	},

	"new" : function(req, res, next){

		Role.find()
		.where({
			id : {
				'!' : 100
			}
		})
		.then(function(roles){
			return [roles]
		})
		.spread(function (roles){
			return res.view({
				roles : roles
			});
		})
		.catch(function(err){
			return next(err);
		})
	},

	"edit" : function(req, res, next){
		Worker.findOne()
		.where({ 
			id : req.param("id")
		})
		.populateAll()
		.then(function foundShop(worker){
			if(!worker) return res.redirect("/worker/index");


			var roles = Role.find()
						.then(function(roles){
							return roles
						});
			return [worker, roles];
		})
		.spread(function (worker, roles){
			return res.view({
				worker : worker,
				roles : roles
			});
		})
		.catch(function(err){
			return next(err);
		});
	},

	"show" : function(req, res, next){
		Worker.findOne()
		.where({ 
			id : req.param("id")
		})
		.populateAll()
		.then(function foundShop(worker){

			if(!worker) return res.redirect("/worker/index");
			return res.view({
				worker : worker
			});
		})
		.catch(function(err){
			return next(err);
		});
	}
};

