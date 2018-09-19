const mongoose = require('mongoose');
const User = require('./schemas/User');

module.exports = mongoose.model('User', User);