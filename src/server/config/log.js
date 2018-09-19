const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf } = format;
const moment = require('moment');
const config = require('./config');

function now() {
	return moment().format();
}

let consoleLogLevel = config.consoleLogLevel;

if(config.isLocal) {
	consoleLogLevel = 'debug';
}
const loggerFormat = printf(info => {
	return `${now()} ${info.level}: ${info.message}`;
});


module.exports = createLogger({
	format: combine(
		timestamp(),
		colorize(),
		loggerFormat
	),
	transports: [new transports.Console()]
});


if(config.normalizeLogError) {
	let oldError = module.exports.error;
	module.exports.error = function () {
		let args = Array.prototype.slice.call(arguments); //make it an array
		args.forEach((arg, idx) => {
			if (!(arg instanceof Error)) {
				return;
			}

			//make an error nicely serializable/loggable with all the relevant info
			args[idx] = serializeError(arg);
		});

		oldError.apply(this, args);
	};
}

module.exports.serializeError = serializeError;

// stolen from https://github.com/sindresorhus/serialize-error/blob/master/index.js
// Make a value ready for JSON.stringify() / process.send()
function serializeError(value) {
	if (typeof value === 'object') {
		let serialized = destroyCircular(value, []);

		if (typeof value.name === 'string') {
			serialized.name = value.name;
		}

		if (typeof value.message === 'string') {
			serialized.message = value.message;
		}

		if (typeof value.stack === 'string') {
			serialized.stack = value.stack;
		}

		return serialized;
	}

	// People sometimes throw things besides Error objects, so...
	if (typeof value === 'function') {
		// JSON.stringify discards functions. We do to, unless a function is thrown directly.
		return '[Function: ' + (value.name || 'anonymous') + ']';
	}

	return value;
}

// https://www.npmjs.com/package/destroy-circular
function destroyCircular(from, seen) {
	let to;
	if (Array.isArray(from)) {
		to = [];
	} else {
		to = {};
	}

	seen.push(from);

	Object.keys(from).forEach(function (key) {
		let value = from[key];

		if (typeof value === 'function') {
			return;
		}

		if (!value || typeof value !== 'object') {
			to[key] = value;
			return;
		}

		if (seen.indexOf(from[key]) === -1) {
			to[key] = destroyCircular(from[key], seen.slice(0));
			return;
		}

		to[key] = '[Circular]';
	});

	return to;
}