const mongoose = require('mongoose');

const User = new mongoose.Schema({
	userId: {
		type: String,
		minlength: 1
	},
	displayName: String,
	email: String,
	permissions: {
		type: [{
			type: String,
			enum: ['configure', 'administer', 'notified', 'canada']
		}]
	},
	lastLogin: Date,
	loginAttributes: Object,
	loginLocation: String,
	loginLocationType: String,
	loginLocationTypeId: String,
	ldapLocation: String
});

module.exports = User;