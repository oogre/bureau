/*
	peoples passing through are [*]
*/

module.exports = function(req, res, next){

	req.session.location = {
		controller : req.options.controller,
		action : req.options.action,
	}

	next();
};
