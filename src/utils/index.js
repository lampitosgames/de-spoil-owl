const csrf = {
  token: "",
  isValid: false,
  account: {}
};

const isLoggedIn = () => {
  return csrf.isValid;
}
//Custom event listeners
const loginChangeListeners = [];
const logoutChangeListeners = [];
const on = {
  login: (callback) => {
    loginChangeListeners.push(callback);
  },
  logout: (callback) => {
    logoutChangeListeners.push(callback);
  }
}
const trigger = {
  login: () => {
    loginChangeListeners.forEach(list => list());
  },
  logout: () => {
    logoutChangeListeners.forEach(list => list());
  }
}

/**
 * Make a get request
 * @param  {string} url  endpoint URL
 * @param  {Object} data data to send with the request
 * @return {Promise}     Promise that resolves when the request complests
 */
const get = (url, data) => new Promise((resolve, reject) => {
  // Create the full URL and encode any variables into a querystring
  const fullURL = `${url}?${Object.keys(data).map(key => `${key}=${data[key]}`).join('&')}`;
  // Build the request
  const xhr = new XMLHttpRequest();
  xhr.open('get', fullURL);
  xhr.addEventListener('load', () => {
    // On load, grab the response (if it exists) and resolve or reject the promise
    // based on the status code
    let response = { message: '' };
    if (xhr.responseText && xhr.responseText[0] === "{") {
      response = JSON.parse(xhr.responseText);
    }
    if (xhr.status === 200 || xhr.status === 204) {
      resolve(response);
    } else {
      reject(xhr);
    }
  });
  // On an actual request error (the server didn't send anything back), reject the promise
  xhr.addEventListener('error', (err) => { reject(err); });
  xhr.send();
});

/**
 * Make a post request
 * @param  {string} url  endpoint URL
 * @param  {Object} body JSON-encodeable body object
 * @return {Promise}     Promise that resolves when the request completes
 */
const post = (url, body) => new Promise((resolve, reject) => {
  // Build the request
  const xhr = new XMLHttpRequest();
  xhr.open('post', url);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.setRequestHeader('CSRF-Token', csrf.token);
  xhr.addEventListener('load', () => {
    // On load, grab the response (if it exists) and resolve or reject the promise based
    // on the status code
    let response = { message: '' };
    if (xhr.responseText) {
      response = JSON.parse(xhr.responseText);
    }
    if (xhr.status === 201 || xhr.status === 204) {
      resolve(response);
    } else {
      reject(xhr);
    }
  });
  // On an actual request error (the server didn't send anything back), reject the promise
  xhr.addEventListener('error', (err) => { reject(err); });
  // Send the request with a json-encoded body
  xhr.send(JSON.stringify(body));
});


const validateToken = () => {
  return get('/checkToken', {}).then((result) => {
    csrf.isValid = true;
    csrf.account = result.account;
    trigger.login();
  }).catch((err) => {
    csrf.isValid = false;
    trigger.logout();
  });
}

module.exports = { on, trigger, get, post, csrf, validateToken, isLoggedIn };