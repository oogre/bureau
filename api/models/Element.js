/**
* Element.js
*
* @description :: Un élément (element) défini un objet frigorifique ex: évaporateur, condensateur, chambre froide, chambre de pousse,  
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	attributes : {
		name : {
			type: 'string',
			required: true,
			maxLength: 128,
		},

		serial : {
			type: 'string',
			maxLength: 128,
		},

		type : {
			model : 'elementType',
			required: true,
		},
		
		group : {
			model:'group'
		},
		
		owner : {
			model : 'shop',
			required: true
		}
	},
};

