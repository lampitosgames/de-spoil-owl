const mongoose = require('mongoose');
const { getMatches } = require('../owl-games');

mongoose.Promise = global.Promise;

let SavedMatchModel = {};

const convertId = mongoose.Types.ObjectId;

const SavedMatchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

SavedMatchSchema.statics.toAPI = doc => getMatches()[doc.title];

SavedMatchSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };
  return SavedMatchModel.find(search).select({ title: 1, owner: 1 }).exec(callback);
};

SavedMatchSchema.statics.deleteMatch = (ownerId, title, callback) => {
  const search = {
    owner: convertId(ownerId),
    title,
  };
  return SavedMatchModel.deleteOne(search).exec(callback);
};

SavedMatchModel = mongoose.model('SavedMatch', SavedMatchSchema);

module.exports = { SavedMatchModel, SavedMatchSchema };
