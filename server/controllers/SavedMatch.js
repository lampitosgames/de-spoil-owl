const models = require('../models');
const { getMatches } = require('../owl-games');
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

const getAllMatches = (req, res) => {
  if (getMatches() !== {}) {
    return res.json(getMatches());
  } else {
    return res.json({ error: "No matches found" });
  }
}

module.exports = { saveMatch, getAllMatches };