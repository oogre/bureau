/**
 * MaterialController
 *
 * @description :: Server-side logic for managing materials
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	"new" : function(req, res, next){
		Unit
		.find()
		.then(function(unit){
			res.view({
				units : unit
			});
		})
		.catch(function(err){
			return next(err);
		})
	},

	"index" : function(req, res, next){
		var where = req.param("where") && "undefined" != req.param("where") ? JSON.parse(req.param("where")) : null;
		var limit = req.param("limit") && "undefined" != req.param("limit") ? JSON.parse(req.param("limit")) : null;
		var sort = req.param("sort") && "undefined" != req.param("sort") ? JSON.parse(req.param("sort")) : null;
		var skip = req.param("skip") && "undefined" != req.param("skip") ? JSON.parse(req.param("skip")) : null;

		Material.find()
		.where(where)
		.sort(sort)
		.limit(limit)
		.skip(skip)
		.populateAll()
		.exec(function foundWorks(err, materials){
			if(err) next(err);
			return res.view({
				sort : sort,
				materials : materials
			});
		});
	}
};

