/**
 * ShopController
 *
 * @description :: Server-side logic for managing shops
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	"index" : function(req, res, next){
		var where = req.param("where") && "undefined" != req.param("where") ? JSON.parse(req.param("where")) : null;
		var limit = req.param("limit") && "undefined" != req.param("limit") ? JSON.parse(req.param("limit")) : null;
		var sort = req.param("sort") && "undefined" != req.param("sort") ? JSON.parse(req.param("sort")) : null;
		var skip = req.param("skip") && "undefined" != req.param("skip") ? JSON.parse(req.param("skip")) : null;

		Shop.find()
		.where(where)
		.sort(sort)
		.limit(limit)
		.skip(skip)
		.exec(function foundShops(err, shops){
			if(err) next(err);
			return res.view({
				sort : sort,
				controller : req.options.controller,
				action : req.options.action,
				shops : shops//JSON.stringify(shops.map(function(shop){return shop.toJSON()}))
			});
		});
	}
};

