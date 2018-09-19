'use strict';
let jwt = require('jsonwebtoken');
let moment = require('moment');
const config = require('../config/config');
const audience = 'client.react.starter.com';
const issuer = 'server.react.starter.com';
const secret = config.jwt.key;
let lifetime = Number(config.jwt.lifetimeInSeconds || 86400);
let maxIdleTime = config.jwt.maxIdleTimeInSeconds || 7200;

class ClientAuthorizationToken {
	constructor(token) {
		let tempPayload = {
			user : {}
		};
		let iat = {};
		let exp = {};
		if (token) {
			tempPayload.user = token.payload.user;
			tempPayload.lastAccessDateTime = token.payload.lastAccessDateTime
				? token.payload.lastAccessDateTime
				: moment().format();
			iat = token.iat ? token.iat : moment().unix();
			exp = token.exp ? token.exp : iat + lifetime;
		} else {
			tempPayload.user = {};
			tempPayload.lastAccessDateTime = moment().format();
			iat = moment().unix();
			exp = iat + lifetime;
		}
		this.payload = jwt.sign({payload: tempPayload, iat: iat, exp: exp, aud: audience, iss: issuer}, secret);
	}

	static fromPayload(payload) {
		let t = jwt.verify(payload, secret, {ignoreExpiration: true});
		return new ClientAuthorizationToken(t);
	}
	getUser(){
		if (this.payload){
			let token = this.decrypt();
			return token.payload.user;
		}
	}
	refresh(){
		this.decrypt().lastAccessDateTime = moment();
	}
	decrypt(token) {
		return jwt.verify(this.payload, secret, {ignoreExpiration: true});
	}

	isExpired() {
		try {
			let t = jwt.verify(this.payload, secret);
			let now = moment();
			let lastAccess = moment(t.payload.lastAccessDateTime);
			let totalIdelTime = moment.duration(now.diff(lastAccess)).asSeconds();
			return (totalIdelTime>maxIdleTime);
		} catch (e) {
			if (e.name === 'TokenExpiredError') {
				log.info(e);
				return true
			}
			throw e;
		}
	}
}
module.exports = ClientAuthorizationToken;