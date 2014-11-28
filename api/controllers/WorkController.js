/**
 * WorkController
 *
 * @description :: Server-side logic for managing works
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	"index" : function(req, res, next){
		var where = req.param("where") && "undefined" != req.param("where") ? JSON.parse(req.param("where")) : null;
		var limit = req.param("limit") && "undefined" != req.param("limit") ? JSON.parse(req.param("limit")) : null;
		var sort = req.param("sort") && "undefined" != req.param("sort") ? JSON.parse(req.param("sort")) : null;
		var skip = req.param("skip") && "undefined" != req.param("skip") ? JSON.parse(req.param("skip")) : null;

		Work.find()
		.where(where)
		.sort(sort)
		.limit(limit)
		.skip(skip)
		.populateAll()
		.exec(function foundWorks(err, works){
			if(err) next(err);
			return res.view({
				sort : sort,
				works : works
			});
		});
	},

	"new" : function(req, res, next){
		Shop.find()
		.populateAll()
		.then(function foundShops(shops){
			var workTypes = WorkType.find()
							.then(function(workTypes){
								return workTypes;
							});
			return [shops, workTypes];
		})
		.spread(function (shops, workTypes){
			var workers = 	Worker.find()
							.then(function(workers){
								return workers;
							});
			return [shops, workTypes, workers];
		})
		.spread(function(shops, workTypes, workers){
			return res.view({
				shops : shops,
				workTypes : workTypes,
				workers : workers
			});
		})
		.catch(function(err){
			return next(err);
		});
	},

	"edit" : function(req, res, next){
		Work.findOne()
		.where({ 
			id : req.param("id")
		})
		.populateAll()
		.then(function foundWork(work){
			if(!work) return res.redirect("/work/index");
			return res.view({
				work : work
			});
		})
		.catch(function(err){
			return next(err);
		});
	},

	"show" : function(req, res, next){
		Work.findOne()
		.where({ 
			id : req.param("id")
		})
		.populateAll()
		.then(function (work){
			if(!work) return res.redirect("/work/index");
			var workers = 	Worker.find()
							.where({
								id: {
									"!" : work.worker.map(function(worker){ return worker.id })
								}
							})
							.then(function(workers){
								return workers;
							});
			return [work, workers];
		})
		.spread(function (work, workers){
			return res.view({
				work : work,
				workers : workers
			});
		})
		.catch(function(err){
			return next(err);
		});
	},
};

