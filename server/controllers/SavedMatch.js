const models = require('../models');

const { SavedMatch } = models;

const saveMatch = (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: 'Title is required to save a match' });
  }
  const matchData = {
    title: req.body.title,
    owner: req.session.account._id,
  };
  const newMatch = new SavedMatch.SavedMatchModel(matchData);
  return newMatch.save().then(() => {
    res.status(201).json({ message: 'Match saved successfully' });
  }).catch((err) => {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Match already saved.' });
    }
    return res.status(400).json({ message: 'An error occured', error: err });
  });
};

module.exports = { saveMatch };
