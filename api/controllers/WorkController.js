/**
 * WorkController
 *
 * @description :: Server-side logic for managing works
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var populateElementAndTask = function(work, workers){
	var promise = require('promised-io/promise');
	var Deferred = promise.Deferred;
	var deferred = new Deferred();
	promise
	.all([	promise
			.all(	(work
					.element || [])
					.map(function(element){
						return Element.findOne({
							id : element.id
						})
						.populateAll()
						.then(function(data){
							return data;
						})
						.catch(function(err){
							return deferred.reject(err);
							//return next(err);
						});
					})
			)
			.then(function(elements){
				return elements;
			}),
			promise
			.all(	(work
					.task || [])
					.map(function(task){
						return Task.findOne({
							id : task.task
						})
						.populateAll()
						.then(function(data){
							data.value = task.value;
							return { 
								element: task.element,
									task: data
								};
						})
						.catch(function(err){
							return deferred.reject(err);
							//return next(err);
						});
					})
			)
			.then(function(tasks){
				return tasks;
			})
	])
	.then(function(data){
		work = _.clone(work);
		work.element = data[0];
		work.task = data[1];
		work.element = work.element.map(function(element){
			delete element.task;
			return _.clone(element);	
		});

		work.task.map(function(task){
			var i = 0;
			for(; i < work.element.length ; i++){
				 if(work.element[i].id == task.element){
				 	break;
				 }
			}
			if(i < work.element.length ){
				work.element[i].task = work.element[i].task || [];
				work.element[i].task.push(_.clone(task));
			}
		});
		delete work.task;

		deferred.resolve({
			work : work,
			workers : workers
		});
	});

	return deferred;
};


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
			populateElementAndTask(work, workers)
			.then(function(data){
				Material
				.find()
				.populateAll()
				.then(function(materials){
					materials = _.clone(materials);
					data.work.material =	(data.work.material || [])
											.map(function(material){
												var item = _.find(materials, function(item){ return item.id == material.id });
												materials = _.without(materials, item);
												item.quantity = material.quantity;
												item.date = material.date;
												return item;
											});

					data.materials = materials;
					return res.view(data);
				})
				.catch(function(err){
					return next(err);
				})
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
			populateElementAndTask(work, workers)
			.then(function(data){
				Material
				.find()
				.populateAll()
				.then(function(materials){
					materials = _.clone(materials);
					data.work.material =	(data.work.material || [])
											.map(function(material){
												var item = _.find(materials, function(item){ return item.id == material.id });
												materials = _.without(materials, item);
												item.quantity = material.quantity;
												item.date = material.date;
												return item;
											});

					data.materials = materials;
					return res.view(data);
				})
				.catch(function(err){
					return next(err);
				})
			})
		})
		.catch(function(err){
			return next(err);
		});
	},

	"checkTask" : function(req, res, next){
		var data = req.params.all();
		Work.findOne({
			id : data.id
		})
		.then(function(foundWork){
			if(!foundWork) return res.send(404);
			var task = _.find(foundWork.task, function(task){
				return task.element == data.element && task.task == data.task;
			})
			task.value = data.value;
			foundWork.save()
			.then(function(){
				return res.json(_.clone(task));
			})
			.catch(function(err){
				return next(err);
			})
		})
		.catch(function(err){
			return next(err);
		})
	},
	"updateElementTask" : function(req, res, next){
		var data = req.params.all();
		data.task = data.task || [];
		data.element = data.element || [];
		if(_.isObject(data.task)){
			data.task = _.values(data.task)
		}
		if(_.isObject(data.element)){
			data.element = _.values(data.element)
		}
		Work.findOne({
			id : data.id
		})
		.populate("element")
		.then(function(foundWork){
			if(!foundWork) return res.send(404);
			foundWork.element.map(function(element){


				var index = _.indexOf(data.element, element.id );
				if(index<0){
					foundWork.element.remove(element.id);
				}else{
					 data.element = _.without(data.element, element.id);
				}
			});
			data.element.map(function(element){
				foundWork.element.add(element);
			});
			foundWork.task = 	data
								.task
								.map(function(task){
									return 	_
											.find(foundWork.task , function(oldTask){ 
												return oldTask.element == task.element && oldTask.task == task.task 
											}) || task;
								});
			foundWork
			.save()
			.then(function(){
				return res.json({
					success : true,
					work : foundWork
				})	
			})
			.catch(function(err){
				return next(err);
			})

			
		})
		.catch(function(err){
			return next(err);
		})	
	}
};

