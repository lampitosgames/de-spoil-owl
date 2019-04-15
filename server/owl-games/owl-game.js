const owlMetadata = require('./owl-metadata.json');
// Useful Regex
const numReg = /[0-9]/g;
const stageReg = /(Stage\s[0-9])/g;
const weekReg = /(Week\s[0-9])/g;
const dayReg = /(Day\s[0-9])/g;
const playoffReg = /(Stage\s[0-9]\sPlayoffs)/g;
const finalsReg = /(Stage\s[0-9]\sFinals)/g;

const toNum = _str => parseInt(_str.match(numReg)[0]);

const handleSWDForPlayoffs = (_title, _finalString) => {
  const swdArr = [-1, -2, -1];
  // Get the stage number
  swdArr[0] = toNum(_finalString);
  // Attempt to get the day number (won't always have one)
  const thisDay = _title.match(dayReg);
  if (thisDay !== null) {
    swdArr[2] = toNum(thisDay[0]);
  }
  return swdArr;
};

const getStageWeekDay = (_title) => {
  // Stage, Week, Day values for this title
  // -1 means it was not specified
  // For the week param, -2 means playoff or final
  const swdArr = [-1, -1, -1];

  // Check for the case that this game is a stage playoff/final
  const isPlayoff = _title.match(playoffReg);
  const isFinal = _title.match(finalsReg);
  if (isPlayoff !== null) {
    return handleSWDForPlayoffs(_title, isPlayoff[0]);
  }
  if (isFinal !== null) {
    return handleSWDForPlayoffs(_title, isFinal[0]);
  }

  // Get the stage, week, and day from the title
  const thisStage = _title.match(stageReg);
  const thisWeek = _title.match(weekReg);
  const thisDay = _title.match(dayReg);
  // If the title has a stage, week, or day...set the proper value in swdArr
  if (thisStage !== null) {
    swdArr[0] = toNum(thisStage[0]);
  }
  if (thisWeek !== null) {
    swdArr[1] = toNum(thisWeek[0]);
  }
  if (thisDay !== null) {
    swdArr[2] = toNum(thisDay[0]);
  }
  return swdArr;
};

class OwlGame {
  constructor(_rawData) {
    this.title = _rawData.title;
    this.video = _rawData.video;
    this.thumb = _rawData.thumb;
    this.gameDate = getStageWeekDay(this.title);
    this.parentMatch = null;
    // Get the teams
    const teams = this.title.split(' ');
    this.team1 = teams[2];
    this.team2 = teams[4];
  }

  setParentMatch(_parent) {
    this.parent = _parent;
  }
}

class OwlMatch {
  constructor(_rawData) {
    this.title = _rawData.title;
    this.video = _rawData.video;
    this.thumb = _rawData.thumb;
    this.gameDate = getStageWeekDay(this.title);
    this.games = [];
    // Get the teams
    const teams = this.title.split(' | ')[1].split(' vs. ');
    this.team1 = owlMetadata.teams.longToShort[teams[0]];
    this.team2 = owlMetadata.teams.longToShort[teams[1]];
  }

  addGame(_game) {
    _game.setParentMatch(this);
    this.games.push(_game);
  }
}

class OwlWatchpoint {
  constructor(_rawData) {
    this.title = _rawData.title;
    this.video = _rawData.video;
    this.thumb = _rawData.thumb;
    this.gameDate = getStageWeekDay(this.title);
  }
}

module.exports = { OwlGame, OwlMatch, OwlWatchpoint };
