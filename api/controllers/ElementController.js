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

		var whereShop = req.param("shop") && "undefined" != req.param("shop") ? {id : req.param("shop")} : {};
		

		ElementType.find()
		.exec(function foundElementTypes(err, elementTypes){
			if(err) return next(err);
			Shop.find(whereShop)
			.sort("brand asc")
			.exec(function foundShops(err, shops){
				if(err) return next(err);
				Group.find()
				.exec(function foundGroups(err, groups){
					if(err) return next(err);
					return res.view({
						elementTypes : elementTypes,
						shops : shops,
						groups : groups
					});
				});
			});
		});
	} 
};

