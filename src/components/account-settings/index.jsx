import React from 'react';
import { Redirect } from 'react-router';
import PasswordForm from './password-form';
import Utils from '../../utils';

const initialState = {
  loggedOut: false,
  listenerKey: "account-settings"
}

export default class AccountSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.dispatchSettings = this.dispatchSettings.bind(this);
  }

  componentDidMount() {
    Utils.on.logout(this.state.listenerKey, () => this.setState({ loggedOut: true }));
  }

  componentWillUnmount() {
    Utils.unsubscribe.logout(this.state.listenerKey);
  }

  dispatchSettings(updateData) {
    Utils.post('/accountSettings', updateData).then(() => {
      console.dir("updated password");
    }).catch((err) => console.error(err));
  }

  render() {
    if (this.state.loggedOut) {
      return <Redirect to="/"/>
    } else {
      return (
        <div>
          <h3 className="accountSettingsTitle">Account Settings</h3>
          <PasswordForm dispatchSettingsChange={this.dispatchSettings}/>
        </div>
      );
    }
  }
}