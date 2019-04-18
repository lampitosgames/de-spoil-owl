const path = require('path');
const controllers = require('./controllers');
const mid = require('./middleware');

const accountRouter = (app) => {
  // Login endpoint
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  // Signup endpoint
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  // Logout endpoint
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  // Account settings Endpoint
  app.post('/accountSettings', mid.requiresSecure, mid.requiresLogin, controllers.Account.accountSettings);
  // Delete account endpoint
  app.post('/deleteAccount', mid.requiresSecure, mid.requiresLogin, controllers.Account.deleteAccount);
};

const router = (app) => {
  // Call other router functions
  accountRouter(app);

  // Is the user authenticated?
  app.get('/checkToken', mid.requiresSecure, (req, res) => {
    if (!req.session.account) {
      return res.status(200).json({ validToken: false });
    }
    return res.status(200).json({ account: req.session.account, validToken: true });
  });
  // Endpoint to get a generated csrf token
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  // Endpoint for users to save a match to their "watch later" playlist
  app.post('/saveMatch', mid.requiresSecure, mid.requiresLogin, controllers.SavedMatch.saveMatch);
  // Endpoint to fetch all matches on the server
  // TODO: Pagination
  app.get('/allMatches', mid.requiresSecure, controllers.SavedMatch.getAllMatches);
  // Client-side will handle react routing.  Any non-api path will resolve to index.html
  app.get('*', mid.requiresSecure, (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
};

module.exports = router;