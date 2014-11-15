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
				shops : shops
			});
		});
	},

	"new" : function(req, res, next){
		return res.view();
	},

	"edit" : function(req, res, next){
		Shop.findOne()
		.where({ 
			id : req.param("id")
		})
		.populateAll()
		.then(function foundShop(shop){
			if(!shop) return res.redirect("/shop/index");
			return res.view({
				shop : shop
			});
		})
		.catch(function(err){
			return next(err);
		});
	},

	"show" : function(req, res, next){
		Shop.findOne()
		.where({ 
			id : req.param("id")
		})
		.populateAll()
		.then(function (shop){
			if(!shop) return res.redirect("/shop/index");
			return res.view({
				shop : shop
			});
		})
		.catch(function(err){
			return next(err);
		});
	},

	"checkVat" : function(req, res, next){
	
		if(!req.param("countryCode") || "undefined" == req.param("countryCode") || !req.param("num") || "undefined" == req.param("num")){
			return res.json({
					success : false,
					message : "unvalid_param"
				});
		}

		var country = req.param("countryCode").trim().toUpperCase();
		var vatnum = req.param("num").trim();

		var url = 'http://ec.europa.eu/taxation_customs/vies/viesquer.do?ms='+country+'&iso='+country+'&vat='+vatnum+'&name=&companyType=&street1=&postcode=&city=&requesterMs='+country+'&requesterIso='+country+'&requesterVat='+vatnum+'&BtnSubmitVat=Verify';
		var request = require('request');
			request(url, function (err, response, body) {
			if(err){
				return res.json({
					success : false,
					message : "error"
				});
			}

			if (response.statusCode != 200) {
				return res.json({
					success : false,
					message : "api_unreachable"
				});
			}
			try{
			  	var vatResponseFormTable = body.split("<table id=\"vatResponseFormTable\">")[1].split("</table>")[0];
			  	var name = vatResponseFormTable.split("<td class=\"labelStyle\">Name</td>")[1].split("</td>")[0].split("<td>")[1].trim();
			  	var addres = vatResponseFormTable.split("<td class=\"labelStyle\">Address</td> ")[1].split("</td>")[0].split("<td>")[1].trim();

			  	var zipcode = addres.split("<br />")[1].split(" ")[0].trim();
			  	var city = addres.split("<br />")[1].split(zipcode)[1].trim();
			  	addres = addres.split("<br />")[0].trim();
			  	street = addres.split(/\d{1,4}/g)[0].trim();
			  	numero = addres.split(street)[1].trim()
				return res.json({
					success : true,
					data : {
						tva : country+vatnum,
						name : name.toLowerCase(),
						street : street.toLowerCase(),
						numero : numero.toLowerCase(),
						zipcode : zipcode.toLowerCase(),
						city : city.toLowerCase()
					}
				});
			}catch(e){
				return res.json({
					success : false,
					message : "non_valid_VAT"
				});
			}
		});
	}
};

