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
    return res.status(500).json({ message: 'An error occured', error: err });
  });
};

const removeMatch = (req, res) => {
  SavedMatch.SavedMatchModel.deleteMatch(req.session.account._id, req.body.title, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
    return res.sendStatus(204);
  });
};

const getSavedMatches = (req, res) => {
  SavedMatch.SavedMatchModel.findByOwner(req.session.account._id, (err, doc) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err });
    }
    const savedMatches = {};
    doc.forEach((match) => {
      const thisMatch = SavedMatch.SavedMatchModel.toAPI(match);
      savedMatches[thisMatch.title] = thisMatch;
    });
    return res.status(200).json(savedMatches);
  });
};

const getAllMatches = (req, res) => {
  if (getMatches() !== {}) {
    return res.json(getMatches());
  }
  return res.json({ error: 'No matches found' });
};

module.exports = {
  saveMatch,
  removeMatch,
  getAllMatches,
  getSavedMatches,
};
