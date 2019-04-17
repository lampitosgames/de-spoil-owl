import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.scss';
import { withAuth } from './components/auth-wrapper';
import Home from './components/home';
import Login from './components/login';
import Signup from './components/signup';
import AccountSettings from './components/account-settings';
import Header from './components/header';

const AppRouter = () => (
  <Router>
    <div>
      <Header />
      <Route exact path="/" component={Home} />
      <Route exact path="/login" component={withAuth(Login, false)} />
      <Route exact path="/signup" component={withAuth(Signup, false)} />
      <Route exact path="/account" component={withAuth(AccountSettings, true)} />
    </div>
  </Router>
);

export default AppRouter;