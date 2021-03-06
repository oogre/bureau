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
			if(!work) return res.redirect("/work/index");
			
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
	},
	finder : function(req, res, next){
		var from = req.param("from") && "undefined" != req.param("from") ? new Date(parseInt(req.param("from"))) : null;
		var to = req.param("to") && "undefined" != req.param("to") ? new Date(parseInt(req.param("to"))) : null;
		var worker = req.param("worker") && "undefined" != req.param("worker") ? req.param("worker") : null;
		var where = {
			or : [
				{
					rendezvous: {
						'>=' : from,
						'<=' : to
					}
				},
				{
					deadLine: {
						'>=' : from,
						'<=' : to
					}
				},
				{
					createdAt: {
						'>=' : from,
						'<=' : to
					}
				},
				{
					updatedAt: {
						'>=' : from,
						'<=' : to
					}
				},
				{	
					closedAt :{
						'>=' : from,
						'<=' : to	
					}
				}
			]
		};
		Work.find()
		.where(where)
		.populate("type")
		.populate("wiki")
		.populate("shop")
		.populate("worker")
		.then(function(works){
			return res.json({
				success : 1, 
				result : _.chain(works).clone().filter(function(work){
							work.worker = work.worker || [];
							return  worker 
									? 
										_.contains( work.worker.map(function(_worker){
												return _worker.id
										}), worker) 
									: 
										true;
						})
						.value()
						.map(function(work){
							var classValue = function(){
								if(work.closedAt)
									return "event-success";
								else if(!work.rendezvous)
									return "event-important";
								else
									switch(work.type.name){
										case "installation":
										return "event-info";
										case "maintenance":
										return "event-special";
										case "dépannage":
										return "event-warning"
									}
							}();
							return {
								id : work.id,
								url: "/work/edit/"+work.id,
								title : work.type.name+" "+work.shop.brand+" "+_(work.wiki[0].description).chain().unescapeHTML().stripTags().truncate(25).value(),
								class: classValue,
								start : work.rendezvous ? new Date(work.rendezvous).valueOf() : new Date(work.deadLine).valueOf(),
								end : (work.rendezvous ? new Date(work.rendezvous).valueOf() : new Date(work.deadLine).valueOf())+((work.time||1)*60*60*1000)
							}
						})
			});
		})
		.catch(function(err){
			return next(err);
		})
	},

	"print" : function(req, res, next){
		Work.findOne()
		.where({ 
			id : req.param("id")
		})
		.populateAll()
		.then(function foundShop(work){
			var _work = Material
			.find()
			.populateAll()
			.then(function(materials){
				materials = _.clone(materials);
				work.material =	(work.material || [])
								.map(function(material){
									var item = _.find(materials, function(item){ return item.id == material.id });
									materials = _.without(materials, item);
									item.quantity = material.quantity;
									item.date = material.date;
									return item;
								});
				return work;
			}).catch(function(err){
				return err;
			});
			return [_work];
		})
		.spread(function(work){
			var data = populateElementAndTask(work, null)
			.then(function(data){
				return data;
			})
			return [data];
		})
		.spread(function(data){
			var work = data.work;

			var pdfWork = new sails.config.pdf({
				type : "work",
				dest : "public/files/works",
				filename : work.id+".pdf",
				line : {
					height : 9,
					padding : 2,
					margin : 5
				},
				page : {
					margins : {
						left : 15,
						right : 15,
						bottom : 50,
						top : 50
					},
					col : 7
				},
				stroke : {
					bold : 2,
					thin : 0.2
				},
				fill : {
					grey : "#dedede",
					black : "#000000"
				}
			})
			.footer([{
				size : 1.75,
					text : [{
						align : "left",
						value : "Atelier\n\nrue des technologies 2ter\nB-4432 Alleur"
					}]
				},{
					size : 1.75,
					text : [{
						align : "left",
						value : "Siège Social\n\nrue Emille Vendervelde 59\nB-4431 Loncin"
					}]
				},{
					size : 1.75,
					text : [{
						align : "left",
						value : "Téléphone & Fax\n\nFixe : 04 366.13.18\nFax : 04 239.20.89"
					}]
				},{
					size : 1.75,
					text : [{
						align : "left",
						value : "Internet\n\nMail : info@atelierdufroid.be\nSite : www.atelierdufroid.be"
					}]
				}
			],function position (doc){
				return {
					x : doc.page.margins.left,
					y : doc.page.height-50
				}
			})
			.header([],function position (doc){
				return {
					x : doc.page.margins.left,
					y : 5
				}
			})
			.title([{
					size : 1,
					text : [{
						align : "center",
						value : "/",
						folio : true
					}]
				},{
					size : 4,
					text : [{
						align : "center",
						value : "Fiche de travail : " + work.type.name
					}]
				}, {
					size : 2,
					text : [{
						align : "center",
						value : work.id
					}]
				}
			], function position (doc){
				return {
					x : doc.page.margins.left,
					y : doc.page.margins.top
				}
			})
			.row([{
					size :4, 
					text : [{ 
						align : "left",
						value : "Client : "
					},{
						align : "center",
						value : work.shop.name
					}]
				},{
					size : 3,
					text : [{ 
						align : "left",
						value : "Date rapport : "
					},{
						align : "center",
						value : (function(){
							var date = new Date(work.closedAt);
							return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
			
						})()
					}]
				}
			])
			.row([{
					size :4, 
					text : [{ 
						align : "left",
						value : "Adresse : "
					},{
						align : "center",
						value : _(work.shop.addres +", " + work.shop.zipcode + " " + work.shop.city).titleize()
					}]
				}
			])
			.row([{
					size :4, 
					text : [{ 
						align : "left",
						value : "Personne de contact : "
					},{
						align : "center",
						value : work.shop.contact && work.shop.contact[0] ? work.shop.contact[0].name : "x"
					}]
				}
			])
			.row([{
					size :4, 
					text : [{ 
						align : "left",
						value : "Nom technicien : "
					},{
						align : "center",
						value : work.signature_adf.name
					}]
				}
			])
			.moveBottom(5)
			.line()
			.row([{
					size :7, 
					text : [{
						align : "center",
						value : "Heures prestées par technicien"
					}]
				}
			])
			.row([{
					size :3, 
					text : [{
						align : "center",
						value : "Nom technicien"
					}]
				},{
					size :1, 
					text : [{
						align : "center",
						value : "Heure arrivée"
					}]
				},{
					size :1, 
					text : [{
						align : "center",
						value : "Heure départ"
					}]
				},{
					size :1, 
					text : [{
						align : "center",
						value : "Temps déplac."
					}]
				},{
					size :1, 
					text : [{
						align : "center",
						value : "Heure prest."
					}]
				}
			]);
			work.worker
			.map(function(worker){
				_.filter( work.schedule, function(schedule){ return schedule.worker == worker.id })
				.map(function(schedule, n){
					pdfWork.row([{
									size :3, 
									text : [{
										align : "center",
										value : _(worker.firstname +" "+worker.lastname).titleize()
									}]
								},{
									size : 1, 
									text : [{
										align : "center",
										value : (function(){
											var started = new Date(schedule.started);
											return started.getHours()+":"+started.getMinutes();
										})()
									}]
								},{
									size : 1, 
									text : [{
										align : "center",
										value : (function(){
											var stoped = new Date(schedule.stoped);
											return stoped.getHours()+":"+stoped.getMinutes();
										})()
									}]
								},{
									size : 1, 
									text : [{
										align : "center",
										value : (function(){
											return _.pad(Math.floor(work.route/(60*60)), 2, "0") + ":"+ _.pad((Math.round(work.route/60))%60, 2, "0");
										})()
									}]
								},{
									size : 1, 
									text : [{
										align : "center",
										value : (function(){
											var started = new Date(schedule.started);
											var stoped = new Date(schedule.stoped);
											var worked = ((stoped - started)/1000);
											return _.pad(Math.floor(worked/(60*60)), 2, "0") + ":"+ _.pad((Math.round(worked/60))%60, 2, "0");
										})()
									}]
								}]
					);
				});
			});
			pdfWork
			.moveBottom(5)
			.line()
			.row([{
					size : 7, 
					text : [{
						align : "center",
						value : "Matériaux"
					}]
				}
			])
			.row([{
					size : 1, 
					text : [{
						align : "center",
						value : "Quantité"
					}]
				},{
					size : 6, 
					text : [{
						align : "center",
						value : "Description"
					}]
				}
			]);
			work.material
			.map(function(material){
				if(material.quantity>0){
					pdfWork.row([{
										size : 1, 
										text : [{
											align : "center",
											value : material.quantity + (material.unit ? (" " + material.unit.shortname)  : "")
										}]
									},{
										size : 6, 
										text : [{
											align : "center",
											value : material.name
										}]
									}
					]);
				}
			});
			pdfWork
			.moveBottom(5)
			.line()
			.row([{
					size :7, 
					text : [{
						align : "center",
						value : "Travaux réalisées : constatation, cause, action prise, remarque"
					}]
				}
			]);
			work.wiki
			.map(function(wiki){
				pdfWork.row([{
								size : 7, 
								text : (function(){
									return [{
										align : "center",
										value : wiki.name
									}].concat( 	wiki.description
												.split("<img")
												.map(function(elem, n){
													if(n%2==1){
														elem = elem.split("src=")[1].split(" ")[0];
														elem = elem.substr(2, elem.length-3);
														return {
															align : "center",
															value : {
																src : elem,
																param : {
																	fit : [100, 100]
																}
															}
														}
													}
													else{
														return { 
															align : "center",
															value : _(elem.replace(/<\/p>|<\/br>|<br>/g, "\n")).stripTags()
														}
													}
												}))
								})()
							}
				]);
			});
			pdfWork
			.moveBottom(5)
			.line()
			.row([{
					size :7, 
					text : [{
						align : "center",
						value : "Signature pour accord heures, matériaux, outillage"
					}]
				}
			])
			.row([{
					size : 3, 
					text : [{
						align : "center",
						value : "Client"
					}]
				},{
					size : 2, 
					text : [{
						align : "center",
						value : "Atelier du froid"
					}]
				},{
					size : 2, 
					text : [{
						align : "center",
						value : "Contrôle Management"
					}]
				}
			])
			.row([{
					size : 3, 
					text : [{
						align : "left",
						value : "Nom : "
					},{
						align : "center",
						value : work.signature_client.name
					}]
				},{
					size : 2, 
					text : [{
						align : "left",
						value : "Nom : "
					},{
						align : "center",
						value : work.signature_adf.name
					}]
				},{
					size : 2, 
					text : [{
						align : "left",
						value : "Management : "
					},{
						align : "center",
						value : (function(){
							var date = new Date();
							return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
						})()
					}]
				}
			])
			.row([{
					size : 3, 
					text : [{
						align : "left",
						value : "Signature : "
					},{
						align : "center",
						value : {
							src : work.signature_client.signature.substr(1),
							param : {
								fit : [100, 100]
							}
						}
					}]
				},{
					size : 2, 
					text : [{
						align : "left",
						value : "Signature : "
					},{
						align : "center",
						value : {
							src : work.signature_adf.signature.substr(1),
							param : {
								fit : [100, 100]
							}
						}
					}]
				},{
					size : 2, 
					text : [{
						align : "left",
						value : "Signature : "
					},{
						align : "center",
						value : {
							src : work.signature_adf.signature.substr(1),
							param : {
								fit : [100, 100]
							}
						}
					}]
				}
			]);

			if(work.type.name == "maintenance"){
				(work.element||[])
				.map(function(element){
					pdfWork
					.addPage()
					.row([{
							size : 4, 
							text : [{
								align : "left",
								value : "Date de l'entretien : "
							},{
								align : "center",
								value : "."
							}]
						},{
							size : 3, 
							text : [{
								align : "left",
								value : (function(){
									var date = new Date(work.rendezvous);
									return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
								})()
							},{
								align : "center",
								value : "."
							}]
						}
					])
					.row([{
							size : 4, 
							text : [{
								align : "left",
								value : "Magasin : "
							},{
								align : "center",
								value : "."
							}]
						},
						{
							size : 3, 
							text : [{
								align : "left",
								value : work.shop.name
							},{
								align : "center",
								value : "."
							}]
						}
					])
					.row([{
							size : 4, 
							text : [{
								align : "left",
								value : "N°de la société : "
							},{
								align : "center",
								value : "."
							}]
						},{
							size : 3, 
							text : [{
								align : "left",
								value : work.shop.id
							},{
								align : "center",
								value : "."
							}]
						}
					])
					.row([{
							size : 4, 
							text : [{
								align : "left",
								value : "N° technicien : "
							},{
								align : "center",
								value : "."
							}]
						},{
							size : 3, 
							text : [{
								align : "left",
								value : work.worker.map(function(worker){return worker.id}).join(", ")
							},{
								align : "center",
								value : "."
							}]
						}
					])
					.row([{
							size : 4, 
							text : [{
								align : "left",
								value : "Elément"
							},{
								align : "center",
								value : "."
							}]
						},{
							size : 3, 
							text : [{
								align : "left",
								value : element.name
							},{
								align : "center",
								value : "."
							}]
						}
					])
					.moveBottom(5)
					.line();
					(element.task||[])
					.map(function(elem){
						pdfWork
						.row([{
								size : 4, 
								text : [{
									align : "left",
									value : elem.task.name
								},{
									align : "center",
									value : "."
								}]
							},{
								size : 3, 
								text : [{
									align : "left",
									value : _.isString(elem.task.value) && elem.task.value!=="true" ? elem.task.value : (elem.task.value === "true" ? "V" : "X" )
								},{
									align : "center",
									value : "."
								}]
							}
						]);
					});
					(element.wiki||[])
					.map(function(wiki){


						console.log(new Date(wiki.createdAt));
						console.log(new Date(work.closedAt));
						console.log(new Date(wiki.createdAt) - new Date(work.closedAt));
						console.log("");
						console.log(new Date(wiki.createdAt));
						console.log(new Date(work.rendezvous));
						console.log(new Date(wiki.createdAt) - new Date(work.rendezvous));
						console.log("");
						console.log("");
						if( new Date(wiki.createdAt) - new Date(work.rendezvous) >= 0 && new Date(wiki.createdAt) - new Date(work.closedAt) >= 0){
							pdfWork.row([{
											size : 7, 
											text : (function(){
												return [{
													align : "center",
													value : wiki.name
												}].concat( 	wiki.description
															.split("<img")
															.map(function(elem, n){
																if(n%2==1){
																	elem = elem.split("src=")[1].split(" ")[0];
																	elem = elem.substr(2, elem.length-3);
																	return {
																		align : "center",
																		value : {
																			src : elem,
																			param : {
																				fit : [100, 100]
																			}
																		}
																	}
																}
																else{
																	return { 
																		align : "center",
																		value : _(elem.replace(/<\/p>|<\/br>|<br>/g, "\n")).stripTags()
																	}
																}
															}))
											})()
										}
							]);
						}
					});				
				})
			}

			pdfWork.end();
			return res.json({
				success : true, 
				url : pdfWork.getUrl()
			});
		})
		.catch(function(err){
			return next(err);
		});
	}
};

