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
		.then(function foundElementTypes(elementTypes){
			Shop.find(whereShop)
			.sort("brand asc")
			.then(function foundShops(shops){
				return res.view({
					elementTypes : elementTypes,
					shops : shops,
				});
			})
			.catch(function(err){
				return next(err);
			});
		})
		.catch(function(err){
			return next(err);
		});
	} 
};

