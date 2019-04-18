import React from 'react';
import { Link } from 'react-router-dom';
import './header.scss';
import Utils from '../../utils';

const initialState = {
  loggedIn: false,
  listenerKey: "header",
};

export default class Header extends React.Component {
  constructor() {
    super();
    this.state = initialState;
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    Utils.on.login(this.state.listenerKey, () => this.setState({ loggedIn: true }));
    Utils.on.logout(this.state.listenerKey, () => this.setState({ loggedIn: false }));
  }

  componentWillUnmount() {
    Utils.unsubscribe.login(this.state.listenerKey);
    Utils.unsubscribe.logout(this.state.listenerKey);
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
        {!this.state.loggedIn ? "" : <div onClick={this.handleLogout}>Log Out</div>}
      </div>
    )
  }
}