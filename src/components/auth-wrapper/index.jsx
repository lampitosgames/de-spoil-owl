import React from 'react';
import { Redirect } from 'react-router-dom';
import Utils from '../../utils';

export const hasValidAuth = () => {
  return Utils.get('/checkToken', {});
}

export const withAuth = (ComponentToProtect, authNeeded) => {
  return class extends React.Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
      };
    }

    componentDidMount() {
      Utils.validateToken().then((res) => {
        if (!res.validToken) {
          this.setState({ loading: false, redirect: authNeeded });
        } else {
          this.setState({ loading: false, redirect: !authNeeded });
          Utils.csrf.account = res.account;
        }
      }).catch((err) => console.error(err));
    }

    render() {
      const { loading, redirect } = this.state;
      if (loading) {
        return null;
      }
      if (redirect && authNeeded) {
        return <Redirect to="/login"/>;
      }
      if (redirect && !authNeeded) {
        return <Redirect to="/" />
      }
      return (
        <React.Fragment>
          <ComponentToProtect {...this.props}/>
        </React.Fragment>
      );
    }
  }
}