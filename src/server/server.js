'use strict';
const config = require('./config/config');
const app = Promise.promisifyAll(require('./express'));
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports.run = function (cb) {

	log.info('server - Starting "' + config.environment + '"');

	return connectToMongoose()
		.then(() => {
			app.listenAsync(config.express.port)
		})
		.then(() => log.info(`running on port ${config.express.port}`))
		.catch(err => {
			log.error(err);
			process.exit(10);
		});
};

function connectToMongoose() {

	let url = config.mongoDbConnectionString;
	let db = mongoose.connection;

	db.on('reconnected', function () {
		log.warn('MongoDB reconnected!');
	});
	db.on('disconnected', function () {
		log.warn('MongoDB disconnected!');
	});

	return mongoose.connect(url, { useNewUrlParser: true })
		.then(() => {
			log.info(`connected to ${url}`);
		})
}

process.on('SIGTERM', function () {
	endServer('SIGTERM')
});
process.on('SIGINT', function () {
	endServer('SIGINT')
});
function endServer(event) {
	log.info(`[*] Ending ${config.appName} server from ${event} event`);
	process.exit(0);
}