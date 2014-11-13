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
		.exec(function foundWorks(err, works){
			if(err) next(err);
			return res.view({
				works : works
			});
		});
	}
};

