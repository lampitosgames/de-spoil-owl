import React from 'react';
import { Redirect } from 'react-router';
import Utils from '../../utils';

const initialState = {
  oldPassword: "",
  newPassword: "",
  newPassword2: "",
  loggedOut: false
}

export default class AccountSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.oldPasswordChange = this.oldPasswordChange.bind(this);
    this.newPasswordChange = this.newPasswordChange.bind(this);
    this.newPassword2Change = this.newPassword2Change.bind(this);
    this.handleSettingsUpdate = this.handleSettingsUpdate.bind(this);
  }

  componentDidMount() {
    Utils.on.logout(() => this.setState({ loggedOut: true }));
  }

  oldPasswordChange(e) {
    this.setState({ oldPassword: e.target.value })
  }

  newPasswordChange(e) {
    this.setState({ newPassword: e.target.value });
  }

  newPassword2Change(e) {
    this.setState({ newPassword2: e.target.value });
  }

  handleSettingsUpdate() {

  }

  render() {
    if (this.state.loggedOut) {
      return <Redirect to="/"/>
    } else {
      return (
        <div>
          <h3 className="accountSettingsTitle">Account Settings</h3>
          <form onSubmit={this.handleSettingsUpdate} className="accountSettingsForm">
            <label>Old Password: <input type="password" value={this.state.oldPassword} placeholder="old password" onChange={this.oldPasswordChange}/></label>
            <label>New Password: <input type="password" value={this.state.newPassword} placeholder="new password" onChange={this.newPasswordChange}/></label>
            <label>Confirm: <input type="password" value={this.state.newPassword2} placeholder="confirm password" onChange={this.newPassword2Change}/></label>
            <input type="submit" value="Sign In"/>
          </form>
        </div>
      );
    }
  }
}