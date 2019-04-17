import React from 'react';
import { Link } from 'react-router-dom';
import './header.scss';
import Utils from '../../utils';

const initialState = {
  loggedIn: false
};

export default class Header extends React.Component {
  constructor() {
    super();
    this.state = initialState;
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    Utils.on.login(() => this.setState({ loggedIn: true }));
    Utils.on.logout(() => this.setState({ loggedIn: false }));
  }

  handleLogout() {
    Utils.get('/logout', {}).then(() => {
      Utils.trigger.logout();
    }).catch((err) => { console.dir(err); })
  }

  render() {
    return (
      <div>
        <Link to="/">All Games</Link>
        {this.state.loggedIn ? "" : <Link to="/login">Log In</Link>}
        {this.state.loggedIn ? "" : <Link to="/signup">Sign Up</Link>}
        {!this.state.loggedIn ? "" : <Link to="/watchLater">Watch Later</Link>}
        {!this.state.loggedIn ? "" : <Link to="/account">Account Settings</Link>}
        {!this.state.loggedIn ? "" : <a onClick={this.handleLogout}>Log Out</a>}
      </div>
    )
  }
}