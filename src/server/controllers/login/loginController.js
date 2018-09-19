const loginController = module.exports;
const User = require('../../models/User');
const config = require('../../config/config');
let AuthenticationToken = require('../../services/clientAuthorizationToken');

function UserNotFoundException() {
	this.name = 'InvalidCredentialsError';
}
UserNotFoundException.prototype = Object.create(Error.prototype);

loginController.login = (req, res) => {
	res.json({ allowBypassLogin: config.allowBypassLogin});
};

loginController.loginSubmit = (req, res) => {

	return Promise.try(function () {

		if (config.allowBypassLogin && req.body.username === 'A0000000') {
			return {
				attributes: [
					{type: 'uid', vals: ['A0000000']},
					{type: 'displayName', vals: [req.body.name || 'Charles Parr']}
				]
			};
		}

		if (config.allowBypassLogin) {
			return {
				attributes: [
					{type: 'uid', vals: [req.body.username]},
					{type: 'displayName', vals: [req.body.username]}
				]
			};
		}
	})
		.then(data => {
			log.info(`Response for username: ${req.body.username} at ${Date()}`);

			if (!data) throw new UserNotFoundException();

			let attributes = {};
			let desiredAttributes = ['uid', 'displayName', 'mail'];
			_.each(desiredAttributes, target => {
				let dataAttribute = _.find(data.attributes, {type: target});
				attributes[target] = dataAttribute ? _.first(dataAttribute.vals) : null;
			});
			return [User.findOne({userId: attributes.uid}), attributes, data.attributes];
		})
		.spread((user, parsedAttributes, rawAttributes) => {
			if (!user) { // first time login, create a new user
				user = new User({userId: parsedAttributes.uid});

				if (req.body.bypassLdap && req.body.username === 'A0000000' ) {
					user.permissions = ['administer'];
				}
			}

			user.displayName = parsedAttributes.displayName; // update everything on login
			user.email = parsedAttributes.mail;
			user.lastLogin = Date.now();
			user.loginAttributes = rawAttributes;

			return user.save();
		})
		.then(updatedUser => {

			req.session.authenticated = true;
			req.session.user = updatedUser.toObject();

			return updatedUser;
		})
		.then(user => {
			log.info(`Audit Event - login`, req.session);

			// return jwt
			res.json({
				username: user.userId,
				email: user.email,
				token: new AuthenticationToken({payload:{ user:user }})
			});

		})
		.catch(err => {
			log.error('login error', err);
			let errorMessage = 'Unknown login error';
			if (err.code === 'ENOTFOUND') {
				errorMessage = 'Could not reach authentication server — connect to the network and try again';
			}
			else if (err.name === 'NoSuchObjectError' || err.name === 'InvalidCredentialsError') {
				errorMessage = 'Invalid user ID or password';
			}

			res.status(400).json({
				allowBypassLogin: config.allowBypassLogin,
				error: errorMessage,
			});

		});
};

loginController.logout = (req, res) => {
	return Promise.try(() => {
		if (req.query.reset === 'true' && req.session.user) {
			return User.findByIdAndUpdate(req.session.user._id, {
				profile: null
			});
		}
	})
		.then(() => {
			req.session.destroy(function (err) {
				if (err) return log.error(err);
				res.json();
			});
		});
};