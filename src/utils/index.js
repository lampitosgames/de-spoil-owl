//STATE STORAGE
const csrf = {
  token: "",
  isValid: false,
  isLoggedIn: false,
  account: {}
};
let allMatches = {};
let watchLaterMatches = {};


const isLoggedIn = () => {
  return csrf.isLoggedIn;
}
//Custom event listeners
const loginChangeListeners = {};
const logoutChangeListeners = {};
const matchesUpdateListeners = {};
const on = {
  login: (listenerKey, callback) => {
    loginChangeListeners[listenerKey] = callback;
  },
  logout: (listenerKey, callback) => {
    logoutChangeListeners[listenerKey] = callback;
  },
  matchesUpdate: (listenerKey, callback) => {
    matchesUpdateListeners[listenerKey] = callback;
  }
}
const trigger = {
  login: () => {
    csrf.isLoggedIn = true;
    Object.values(loginChangeListeners).forEach(list => list());
  },
  logout: () => {
    csrf.isLoggedIn = false;
    Object.values(logoutChangeListeners).forEach(list => list());
  },
  matchesUpdate: () => {
    Object.values(matchesUpdateListeners).forEach(list => list());
  }
}
const unsubscribe = {
  login: (listenerKey) => {
    delete loginChangeListeners[listenerKey];
  },
  logout: (listenerKey) => {
    delete logoutChangeListeners[listenerKey];
  },
  matchesUpdate: (listenerKey) => {
    delete matchesUpdateListeners[listenerKey];
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

const fetchWatchLaterMatches = () => {
  return get('/getSavedMatches', {}).then((savedMatches) => {
    watchLaterMatches = savedMatches;
    trigger.matchesUpdate();
  }).catch((err) => console.error(err));
}
on.login("watch-later", fetchWatchLaterMatches);

const fetchAllMatches = () => {
  return get('/allMatches', {}).then((games) => {
    allMatches = games;
    trigger.matchesUpdate();
  }).catch((err) => console.error(err));
}

const getAllMatches = () => allMatches;
const getWatchLaterMatches = () => watchLaterMatches;

const validateToken = () => {
  return get('/checkToken', {}).then((result) => {
    if (!result.validToken) {
      csrf.isValid = false;
      trigger.logout();
    } else {
      csrf.isValid = true;
      csrf.account = result.account;
      trigger.login();
    }
    return result;
  }).catch((err) => console.error(err));
}

export default {
  csrf,
  allMatches,
  watchLaterMatches,
  on,
  trigger,
  unsubscribe,
  get,
  post,
  validateToken,
  isLoggedIn,
  getWatchLaterMatches,
  fetchWatchLaterMatches,
  getAllMatches,
  fetchAllMatches
};