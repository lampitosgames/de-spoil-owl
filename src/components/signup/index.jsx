import React from 'react';
import { Redirect } from 'react-router';
import './signup.scss';
import Utils from '../../utils';

const initialState = {
  username: "",
  password: "",
  password2: "",
  createdAccount: false
}

export default class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.handleSignup = this.handleSignup.bind(this);
    this.usernameChange = this.usernameChange.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.password2Change = this.password2Change.bind(this);
  }

  handleSignup(e) {
    e.preventDefault();
    const body = {
      "username": this.state.username,
      "password": this.state.password,
      "password2": this.state.password2,
    };
    //Ensure they have a valid auth token
    Utils.get('/getToken', {}).then((result) => {
      // Save the token
      Utils.csrf.token = result.csrfToken;
      //Sign up
      Utils.post('/signup', body).then(() => {
        //After they sign up, log them in and change the local state so the route refreshes
        Utils.post('/login', body).then(() => {
          Utils.trigger.login();
          this.setState({ createdAccount: true });
        });
      });
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

  password2Change(e) {
    this.setState({ password2: e.target.value });
  }

  render() {
    if (this.state.createdAccount) {
      return <Redirect to = "/" / >
    } else {
      return ( <
        form onSubmit = { this.handleSignup } className = "signupForm" >
        <
        label > Username: < input type = "text"
        value = { this.state.username } placeholder = "username"
        onChange = { this.usernameChange }
        /></label >
        <
        label > Password: < input type = "password"
        value = { this.state.password } placeholder = "password"
        onChange = { this.passwordChange }
        /></label >
        <
        label > Password: < input type = "password"
        value = { this.state.password2 } placeholder = "confirm password"
        onChange = { this.password2Change }
        /></label >
        <
        input type = "submit"
        value = "Sign Up" / >
        <
        /form>
      );
    }
  }
}