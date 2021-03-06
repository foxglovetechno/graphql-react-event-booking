import React, { Component } from 'react';
import AuthContext from '../../context/AuthContext';
import './Auth.css';

class AuthComponent extends Component {
	constructor(props) {
		super(props);
		this.emailEl = React.createRef();
		this.passwordEl = React.createRef();
	}

	state = {
		isLogin: true
	};

	static contextType = AuthContext;

	submitHandler = event => {
		event.preventDefault();
		const email = this.emailEl.current.value;
		const password = this.passwordEl.current.value;

		if (email.trim().length === 0 || password.trim().length === 0) {
			return;
		}

		let requestBody = {
			query: `
				query {
					login(email:"${email}",password:"${password}"){
						userId
						token
						tokenExpiration
					}
				}
			`
		};

		if (!this.state.isLogin) {
			//passing dynamic data
			requestBody = {
				query: `
				mutation CreateUser($email:String!,$password:String!) {
					createUser(userInput:{email:$email,password:$password}){
						_id
						email
					}
				}
			`,
				variables: {
					email: email,
					password: password
				}
			};
		}

		fetch('http://localhost:8000/api', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed!');
				}
				return res.json();
			})
			.then(resData => {
				console.log(resData);
				if (resData.data.login.token) {
					const { token, userId, tokenExpiration } = resData.data.login;
					this.context.login(token, userId, tokenExpiration);
				}
			})
			.catch(err => console.log(err));
	};

	switchModeHandler = () => {
		this.setState(prevState => {
			return { isLogin: !prevState.isLogin };
		});
	};

	render() {
		return (
			<form className="auth-form" onSubmit={this.submitHandler}>
				<div className="form-control">
					<label htmlFor="email">E-mail</label>
					<input type="email" id="email" ref={this.emailEl} />
				</div>
				<div className="form-control">
					<label htmlFor="password">Password</label>
					<input type="password" id="password" ref={this.passwordEl} />
				</div>
				<div className="form-actions">
					<button type="submit">Submit</button>
					<button type="button" onClick={this.switchModeHandler}>
						Switch to {this.state.isLogin ? 'SignUp' : 'Login'}
					</button>
				</div>
			</form>
		);
	}
}

export default AuthComponent;
