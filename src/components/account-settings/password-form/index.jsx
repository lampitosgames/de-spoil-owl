import React from 'react';
import Utils from '../../../utils';

const initialState = {
  oldPassword: "",
  newPassword: "",
  newPassword2: "",
  account: {
    username: "",
    _id: "",
  },
  formType: "update-password",
}

export default class PasswordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.state.account = Utils.csrf.account;

    this.oldPasswordChange = this.oldPasswordChange.bind(this);
    this.newPasswordChange = this.newPasswordChange.bind(this);
    this.newPassword2Change = this.newPassword2Change.bind(this);
    this.handlePasswordUpdate = this.handlePasswordUpdate.bind(this);
  }

  oldPasswordChange(e) {
    this.setState({ oldPassword: e.target.value });
  }

  newPasswordChange(e) {
    this.setState({ newPassword: e.target.value });
  }

  newPassword2Change(e) {
    this.setState({ newPassword2: e.target.value });
  }

  handlePasswordUpdate(e) {
    e.preventDefault();
    const passUpdateData = {
      username: this.state.account.username,
      oldPassword: this.state.oldPassword,
      newPassword: this.state.newPassword,
      newPassword2: this.state.newPassword2,
      formType: this.state.formType
    };
    this.props.dispatchSettingsChange(passUpdateData);
  }

  render() {
    return (
      <form onSubmit={this.handlePasswordUpdate} className="accountSettingsForm">
        <label>Old Password: <input type="password" value={this.state.oldPassword} placeholder="old password" onChange={this.oldPasswordChange}/></label>
        <label>New Password: <input type="password" value={this.state.newPassword} placeholder="new password" onChange={this.newPasswordChange}/></label>
        <label>Confirm: <input type="password" value={this.state.newPassword2} placeholder="confirm password" onChange={this.newPassword2Change}/></label>
        <input type="submit" value="Change Password"/>
      </form>
    );
  }
}