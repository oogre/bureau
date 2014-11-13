/**
* WorkSchedule.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		worker : {
			model : 'worker',
			required : true,
		},
		work : {
			model : 'work',
			required : true,
		},
		started : {
			type : 'datetime',
			required : true,
		},
		stoped : {
			type : 'datetime'
		}
	}
};

