/*
	peoples passing through are [Admin, Owner]
*/

module.exports = function(req, res, next){
	if(req.session.worker){
		var isOwner = req.session.worker.id === req.param("id");
		var isAdmin = req.session.worker.role == 100;
		
		if( isOwner || isAdmin ){
			return next();
		}else{
			return res.forbidden();;
		}
	}
	else{
		return res.forbidden();;
	}
};