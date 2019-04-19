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

const savedMatchRouter = (app) => {
  // Endpoint for users to save a match to their "watch later" playlist
  app.post('/saveMatch', mid.requiresSecure, mid.requiresLogin, controllers.SavedMatch.saveMatch);
  // Endpoint for users to remove a match from their "watch later" playlist
  app.post('/removeMatch', mid.requiresSecure, mid.requiresLogin, controllers.SavedMatch.removeMatch);
  //Endpoint to fetch all matches saved by a user
  app.get('/getSavedMatches', mid.requiresSecure, mid.requiresLogin, controllers.SavedMatch.getSavedMatches);
  // Endpoint to fetch all matches on the server
  // TODO: Pagination
  app.get('/allMatches', mid.requiresSecure, controllers.SavedMatch.getAllMatches);
}

const router = (app) => {
  // Call other router functions
  accountRouter(app);
  savedMatchRouter(app);

  // Is the user authenticated?
  app.get('/checkToken', mid.requiresSecure, (req, res) => {
    if (!req.session.account) {
      return res.status(200).json({ validToken: false });
    }
    return res.status(200).json({ account: req.session.account, validToken: true });
  });
  // Endpoint to get a generated csrf token
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  // Client-side will handle react routing.  Any non-api path will resolve to index.html
  app.get('*', mid.requiresSecure, (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
};

module.exports = router;