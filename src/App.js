import React, { Component } from 'react';
import logo from './logo.svg';
import LoginForm from './LoginForm';
import './App.css';

class App extends Component {
	render() {
        return (
            <div className="App">
                <header className="App-header">
	                <img src={logo} className="App-logo" alt="logo" />
                </header>

	            <div className="App-form">
		            <LoginForm />
                </div>
            </div>
        );
	}
}

export default App;
