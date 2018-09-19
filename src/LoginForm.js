import React, { Component } from 'react';
import './LoginForm.css'

class LoginForm extends Component {

	constructor(props) {
		super(props);
		this.state = {
			inputUsername: "",
			inputPassword: ""
		}
	}

	onChangeUsername = (ev) => {
		this.setState({
			inputUsername: ev.target.value
		})
	};

	onChangePassword = (ev) => {
		this.setState({
			inputPassword: ev.target.value
		})
	};

	onSubmitForm = (ev) => {
		ev.preventDefault();
//		alert(`Welcome ${this.state.inputUsername}`)

		fetch('http://localhost:8000/api/login', {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username: this.state.inputUsername, password: this.state.inputPassword })
		})
			.then(res => res.json())
			.then(console.log);
	};

	render() {
		return (
			<div className="LoginForm">
				<form onSubmit={this.onSubmitForm}>
					<div>
						<input name="inputUsername" className="LoginForm-input" onChange={this.onChangeUsername} type="text" placeholder="Email Address" />
					</div>
					<section>
						<input name="inputPassphrase" className="LoginForm-input" onChange={this.onChangePassword} type="password" placeholder="Password" />
					</section>
					<section>
						<button type="submit" className="LoginForm-submit">Log in</button>
					</section>
				</form>
			</div>
		);
	}
}

export default LoginForm;