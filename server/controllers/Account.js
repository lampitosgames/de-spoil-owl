const models = require('../models');

const { Account } = models;

const login = (req, res) => {
  const username = `${req.body.username}`;
  const password = `${req.body.password}`;
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields required to log in' });
  }
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ message: 'Wrong username or password!' });
    }
    req.session.account = Account.AccountModel.toAPI(account);
    res.cookie('loggedInAs', req.session.account.username, { signed: true, httpOnly: true });
    return res.status(204).end();
  });
};

const logout = (req, res) => {
  req.session.destroy();
  return res.status(204).end();
};

const signup = (req, res) => {
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.password}`;
  req.body.pass2 = `${req.body.password2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ message: 'Password and confirmation do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };
    const newAccount = new Account.AccountModel(accountData);
    newAccount.save().then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      res.status(204).end();
    }).catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use' });
      }
      return res.status(400).json({ error: 'An error occurred' });
    });
  });
};

// TODO: Add a deleteAccount endpoint
// TODO: Add account settings

const getToken = (_req, _res) => {
  const req = _req;
  const res = _res;
  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };
  res.json(csrfJSON);
};

module.exports = {
  login,
  logout,
  signup,
  getToken,
};
