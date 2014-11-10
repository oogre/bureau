/**
 * ElementController
 *
 * @description :: Server-side logic for managing elements
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	"index" : function(req, res, next){
		var where = req.param("where") && "undefined" != req.param("where") ? JSON.parse(req.param("where")) : null;
		var limit = req.param("limit") && "undefined" != req.param("limit") ? JSON.parse(req.param("limit")) : null;
		var sort = req.param("sort") && "undefined" != req.param("sort") ? JSON.parse(req.param("sort")) : null;
		var skip = req.param("skip") && "undefined" != req.param("skip") ? JSON.parse(req.param("skip")) : null;

		Element.find()
		.where(where)
		.sort(sort)
		.limit(limit)
		.skip(skip)
		.populate('type')
		.exec(function foundElements(err, elements){
			if(err) next(err);
			return res.view({
				elements : elements
			});
		});
	},
	"new" : function(req, res, next){
		ElementType.find()
		.exec(function foundElementTypes(err, elementTypes){
			if(err) next(err);
			return res.view({
				elementTypes : elementTypes
			});
		});
	} 
};

