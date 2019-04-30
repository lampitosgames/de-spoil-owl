import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.scss';
import { withAuth } from './components/auth-wrapper';
import Home from './components/home';
import WatchLater from './components/watch-later';
import Login from './components/login';
import Signup from './components/signup';
import AccountSettings from './components/account-settings';
import Header from './components/header';
import NotFound from './components/page-not-found';

const AppRouter = () => (
  <Router>
    <div className="app-wrapper">
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/watchLater" component={withAuth(WatchLater, true)} />
        <Route exact path="/login" component={withAuth(Login, false)} />
        <Route exact path="/signup" component={withAuth(Signup, false)} />
        <Route exact path="/account" component={withAuth(AccountSettings, true)} />
        <Route component={NotFound} />
      </Switch>
    </div>
  </Router>
);

export default AppRouter;