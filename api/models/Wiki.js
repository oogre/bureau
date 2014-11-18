/**
* Wiki.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		name : {
			type: 'string',
			required: true,
			unique: true,
			maxLength: 64
		},
		description : {
			type: 'string',
			required: true,
			maxLength: 1024
		},
		author : {
			model : 'worker',
			//required : true
		}
	}
};

