const config = require('./config/config');
const path = require('path');
const loginController = require('./controllers/login/loginController');

module.exports.http = (app) => {
	app.post('/api/login', loginController.loginSubmit);
	app.get('/api/logout', loginController.logout);

};
