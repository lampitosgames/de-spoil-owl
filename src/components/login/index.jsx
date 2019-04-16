import React from 'react';
import { Redirect } from 'react-router';
import './login.scss';
import Utils from '../../utils';

const initialState = {
  username: "",
  password: "",
  loggedIn: false
}

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.handleLogin = this.handleLogin.bind(this);
    this.usernameChange = this.usernameChange.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
  }

  handleLogin(e) {
    e.preventDefault();
    const body = {
      "username": this.state.username,
      "password": this.state.password,
    };
    Utils.post('/login', body).then(() => {
      this.setState({ loggedIn: true });
      Utils.trigger.login();
    }).catch((res) => {
      //TODO: Handle error
      console.dir(res);
    });
  }

  usernameChange(e) {
    this.setState({ username: e.target.value });
  }

  passwordChange(e) {
    this.setState({ password: e.target.value });
  }

  render() {
    if (this.state.loggedIn) {
      return <Redirect to="/"/>;
    } else {
      return (
        <form onSubmit={this.handleLogin} className="loginForm">
          <label>Username: <input type="text" value={this.state.username} placeholder="username" onChange={this.usernameChange}/></label>
          <label>Password: <input type="password" value={this.state.password} placeholder="password" onChange={this.passwordChange}/></label>
          <input type="submit" value="Sign In"/>
        </form>
      );
    }
  }
}