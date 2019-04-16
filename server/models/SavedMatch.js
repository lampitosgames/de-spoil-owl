const mongoose = require('mongoose');

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

SavedMatchSchema.statics.toAPI = doc => ({
  title: doc.title,
  createdDate: doc.createdDate,
});

SavedMatchSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };
  return SavedMatchModel.find(search).select('name age height').exec(callback);
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
