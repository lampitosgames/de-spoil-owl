import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.scss';
import { withAuth } from './components/auth-wrapper';
import Login from './components/login';
import Signup from './components/signup';

const Home = () => <h2>Home</h2>;

/*
Code to determine if the user is logged in:
componentDidMount() {
  Utils.get('/checkToken', {}).then((res) => {
    User is logged in
  }).catch((err) => {
    User is not logged in
  });
}
 */

const initialState = {
  loggedIn: false,
};

class AppRouter extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={withAuth(Login, false)} />
          <Route exact path="/signup" component={withAuth(Signup, false)} />
        </div>
      </Router>
    );
  }
}

export default AppRouter;