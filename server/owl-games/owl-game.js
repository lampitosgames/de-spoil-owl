const owlMetadata = require('./owl-metadata.json');
// Useful Regex
const numReg = /[0-9]/g;
const stageReg = /(Stage\s[0-9])/g;
const weekReg = /(Week\s[0-9])/g;
const dayReg = /(Day\s[0-9])/g;
const playoffReg = /(Stage\s[0-9]\sPlayoffs)/g;
const finalsReg = /(Stage\s[0-9]\sFinals)/g;
const gameNumberReg = /(Game\s)[0-9]/g;

const toNum = _str => parseInt(_str.match(numReg)[0], 10);

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

/**
 * Tests to see if a match's data was built successfully. Data is entered by humans so
 * error will always creep in. Filter it out
 * @param  {OwlMatch}  _match a built OwlMatch object to test
 * @return {Boolean}          whether or not the match was built correctly
 */
const validateMatch = (_match) => {
  // Valid until proven otherwise
  let isValid = true;
  // Ensure it exists
  isValid = _match !== null && _match !== undefined;
  // Does the match have a title, video, and thumbnail?
  _match.hasMatchData = _match.title !== "" && _match.video !== "" && _match.thumb !== "";
  // Are there at least 5 child games?
  _match.hasGameData = _match.games.length >= 5;
};

const validateTeamString = (_team) => {
  //London is abbreviated LDN or LON.  Always use LON
  if (_team === "LDN") { _team = "LON"; }
  //CHD => CDH
  if (_team === "CHD") { _team = "CDH"; }
  return _team;
}

class OwlGame {
  constructor(_rawData) {
    this.title = _rawData.title;
    this.video = _rawData.video;
    this.thumb = _rawData.thumb;
    this.gameDate = getStageWeekDay(this.title);
    this.parentMatch = "";
    // Get the teams
    [, , this.team1, , this.team2] = this.title.split(' ');
    //Pass teams through validator
    this.team1 = validateTeamString(this.team1);
    this.team2 = validateTeamString(this.team2);
    // Get the game number
    const [titleMatch] = this.title.match(gameNumberReg);
    this.gameNumber = toNum(titleMatch.split(' ')[1]);
  }

  setParentMatch(_parent) {
    this.parentMatch = _parent.title;
  }
}

class OwlMatch {
  constructor(_rawData) {
    //Init empty fields that will be set later
    this.title = "";
    this.video = "";
    this.thumb = "";
    this.games = [];
    //For ordering matches in a particular day
    this.matchNum = _rawData.matchNum;
    //Initially has no VOD data. Gets injected later
    this.hasMatchData = false;
    this.hasGameData = false;
    //Parse the date string YYYY-MM-DD
    this.dateString = _rawData.dateString;
    //Has the match happened yet?
    this.isFutureMatch = (new Date(this.dateString)) > Date.now();
    //Get the stage, week, day to set as the game date
    this.gameDate = getStageWeekDay(_rawData.swd);
    //Pass teams through validator
    this.team1 = validateTeamString(this.team1);
    this.team2 = validateTeamString(this.team2);
    //Separate teams
    [this.team1, this.team2] = _rawData.shortName.split("@");
    //Create the display title from the team names
    this.displayTitle = owlMetadata.teams.shortToLong[this.team1] + " vs. " + owlMetadata.teams.shortToLong[this.team2] + " | " + _rawData.swd;
    this.shortName = _rawData.shortName;
  }

  injectMatchVodData(sheetMatchData) {
    this.title = sheetMatchData.title;
    this.video = sheetMatchData.video;
    this.thumb = sheetMatchData.thumb;
    this.isFutureMatch = false;
    this.hasMatchData = true;
  }

  addGame(_game) {
    _game.setParentMatch(this);
    this.games.push(_game);
  }
}

class SheetMatchData {
  constructor(_rawData) {
    this.title = _rawData.title;
    this.video = _rawData.video;
    this.thumb = _rawData.thumb;
    this.gameDate = getStageWeekDay(this.title);
    const teams = this.title.split(' | ')[1].split(/\s*(vs\.)\s*/);
    this.team1 = owlMetadata.teams.longToShort[teams[0]];
    this.team2 = owlMetadata.teams.longToShort[teams[2]];
    let week = this.gameDate[1] < 0 ? "Playoffs" : " Week " + this.gameDate[1];
    let swd = "Stage " + this.gameDate[0] + week + " Day " + this.gameDate[2];
    this.displayTitle = owlMetadata.teams.shortToLong[this.team1] + " vs. " + owlMetadata.teams.shortToLong[this.team2] + " | " + swd;
    this.shortName = this.team1 + "@" + this.team2;
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

module.exports = {
  OwlGame,
  OwlMatch,
  SheetMatchData,
  OwlWatchpoint,
  validateMatch,
  getStageWeekDay
};