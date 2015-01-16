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
		.populateAll()
		.exec(function foundElements(err, elements){
			if(err) next(err);
			return res.view({
				elements : elements
			});
		});
	},
	"show" : function(req, res, next){
		Element.findOne()
		.where({ 
			id : req.param("id")
		})
		.populateAll()
		.then(function (element){
			if(!element) return res.redirect("/element/index");

			return [element]
		})
		.spread(function (element){
			var tasks = Task.find()
						.populateAll()
						.then(function foundTasks(tasks){
							return _.groupBy(tasks, function(task){
								return task.elementType != undefined ? task.elementType.name : "-";
							});
						})
						.catch(function(err){
							return next(err);
						});
			return [element, tasks];
		})
		.spread(function (element, tasks){
			return res.view({
				element : element,
				tasks : tasks
			});
		})
		.catch(function(err){
			return next(err);
		});
	},
	"new" : function(req, res, next){

		var whereShop = req.param("shop") && "undefined" != req.param("shop") ? {id : req.param("shop")} : {};
		
		ElementType.find()
		.then(function foundElementTypes(elementTypes){
			return [elementTypes];
		})
		.spread(function (elementTypes){
			var shops = 	Shop.find(whereShop)
							.sort("brand asc")
							.then(function foundShops(shops){
								return shops;
							})
							.catch(function(err){
								return next(err);
							});
			return [elementTypes, shops];
		})
		.spread(function (elementTypes, shops){
			var tasks = Task.find()
						.populateAll()
						.then(function foundTasks(tasks){
							return _.groupBy(tasks, function(task){
								return task.elementType != undefined ? task.elementType.name : "-";
							});
						})
						.catch(function(err){
							return next(err);
						});
			return [elementTypes, shops, tasks];
		})
		.spread(function (elementTypes, shops, tasks){
			return res.view({
						elementTypes : elementTypes,
						shops : shops,
						tasks : tasks
					});
		})
		.catch(function(err){
			return next(err);
		});
	},
	"create" : function(req, res, next){
		var data = req.params.all();

		data.elementType = data.elementType.toLowerCase();
		data.task = data.task || [];
		data.wiki = data.wiki || [];
		ElementType.findOneByName(data.elementType)
		.then(function(foundElementType){
			var elementType = foundElementType;
			if(!foundElementType){
				elementType = 
				ElementType
				.create({
					name : data.elementType
				})
				.then(function(newElementType){
					return newElementType
				})
				.catch(function(err){
					return next(err);
				});
			}
			return [elementType];
		})
		.spread(function(elementType){
			var promise = require('promised-io/promise');
			var Deferred = promise.Deferred;

			promise
			.all(	data
					.task
					.map(function(task){
						if(_.isString(task)){
							return Task.findOne({
								id : task
							})
							.then(function(foundTask){
								return foundTask;
							}).catch(function(err){
								return next(err);
							});
						}
						else if(_.isObject(task)){
							return Task.create(task)
							.then(function(newTask){
								newTask.link = task.link;
								return newTask;
							}).catch(function(err){
								return next(err);
							});
						}
					})
			)
			.then(function(tasks){
				tasks.map(function(task){
					if(task.link){
						task.elementType = elementType.id;
						task.save();
						delete task.link;
					}
				});

				promise
				.all(	data
						.wiki
						.map(function(wiki){
							if(_.isString(wiki)){
								return Wiki.findOne({
									id : wiki
								})
								.then(function(foundWiki){
									return foundWiki;
								}).catch(function(err){
									return next(err);
								});
							}
							else if(_.isObject(wiki)){
								return Wiki.create(wiki)
								.then(function(newWiki){
									return newWiki;
								}).catch(function(err){
									return next(err);
								});
							}
						})
				)
				.then(function(wikis){
					Element.create({
						name : data.name.toLowerCase(),
						serial : data.name,
						type: elementType.id,
						task: tasks.map(function(task){return task.id}),
						owner: data.owner,
						wiki: wikis.map(function(wiki){return wiki.id}),
					})
					.then(function(newElement){
						return res.json(newElement);
					})
					.catch(function(err){
						return next(err);
					});
				});
			});
		})
		.catch(function(err){
			console.error(err);
		});
	},
	"substructureUpdate" : function(req, res, next){
		var elements = JSON.parse(req.param("elements"));
		var setElementSubstructure = function(elements){
			if(elements){
				elements.map(function(element){
					if(element){
						return Element.findOneById(element.id)
						.then(function(foundElement){
							if(element.substructure){
								foundElement.substructure = element.substructure.map(function(e){return e.id});
							}else{
								foundElement.substructure = [];
							}
							foundElement
							.save()
							.then(function(){
								setElementSubstructure(element.substructure);	
							})
							.catch(function(error){
								console.error(error);
							})
							
						})
						.catch(function(error){
							console.error(error);
						})
					}
				});
			}
		}

		setElementSubstructure(	elements );
		

		return res.json({
			success : true
		});
	},

	"find" : function(req, res, next){
		var where = req.param("where") && "undefined" != req.param("where") ? JSON.parse(req.param("where")) : null;
		var limit = req.param("limit") && "undefined" != req.param("limit") ? JSON.parse(req.param("limit")) : null;
		var sort = req.param("sort") && "undefined" != req.param("sort") ? JSON.parse(req.param("sort")) : null;
		var skip = req.param("skip") && "undefined" != req.param("skip") ? JSON.parse(req.param("skip")) : null;

		Element.find()
		.where(where)
		.sort(sort)
		.limit(limit)
		.skip(skip)
		.populateAll()
		.then(function foundElements(elements){
			return res.json(elements);
		})
		.catch(function(err){
			return next(err);
		});
	}
};

