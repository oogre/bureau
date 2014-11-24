/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	upload: function (req, res) {
		// e.g.
		// 0 => infinite
		// 240000 => 4 minutes (240,000 miliseconds)
		// etc.
		//
		// Node defaults to 2 minutes.
		//res.setTimeout(0);


		res.setTimeout(0);
		req.file('avatar')
		.upload(function whenDone(err, uploadedFiles) {
			if (err) return res.serverError(err);

			var fs = require('fs');

			var promise = require('promised-io/promise');
			var Deferred = promise.Deferred;
			promise
			.all(	uploadedFiles
					.map(function(file){
						file.author = req.param("author") ? req.param("author") : "000";
						file.dest = "public/files/"+file.author;
						file.dest = file.fd.split(".tmp/uploads")[0]+file.dest;
						file.src = "/public/files/"+file.author+"/"+file.filename;
						file.deferred = new Deferred();
						file.finish = function(){
							var _this = this;
							_this.dest += ("/"+_this.filename);
							fs.rename( _this.fd, _this.dest, function(err){
								if(err) console.warn(err);
								delete _this.finish;
								_this.deferred.resolve(_this);
							});
						};
						fs.exists(file.dest , function (exists) {
							if(!exists){
								fs.mkdir(file.dest, 0777, function(){;
									file.finish()
								});
							}
							file.finish();
						});
						return file;
					})
			)
			.then(function(array){
				return res.json(uploadedFiles);
			});
		});
	} 
};

