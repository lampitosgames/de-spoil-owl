import React from 'react';
import ReactDOM from 'react-dom';
import Utils from './utils';
import './index.scss';
import App from './App';

const getToken = () => {
  // Get a CSRF token from the server
  Utils.get('/getToken', {}).then((result) => {
    // Save the token
    Utils.csrf.token = result.csrfToken;
    Utils.validateToken();
    // Render the app
    ReactDOM.render(<App />, document.getElementById('root'));
  }).catch(err => console.dir(`Failed to get csrf token: ${err}`));
};

document.addEventListener('DOMContentLoaded', () => {
  getToken();
});
