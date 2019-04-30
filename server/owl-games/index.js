/*
Notes about data coming in from the Twitch/IFTTT API:
* No naming convention for season playoffs.  We'll have to work on that
* All abbreviated titles for stage playoffs are "Stage X Finals"
* Watchpoint during stage finals is "Stage X Finals | Day X"
* Full game titles "Stage X Playoffs | Day X"
* The actual final is titled "Stage X Final | Day X"
 */
const {
  OwlGame,
  OwlMatch,
  OwlWatchpoint,
  SheetMatchData,
  validateMatch,
  getStageWeekDay
} = require('./owl-game.js');
const { buildGameDataFromSpreadsheet } = require('./refresh-raw-data.js');
const owlMetadata = require('./owl-metadata.json');

// List of loaded videos from the excel spreadsheet
const videos = {};

// Easily iterateable flat object of matches. Created with fullSchedule
let matches = {};
//Full schedule built with real OWL schedule data. Immediately invoked function
// that builds the data structure that twitch data is injected into as it becomes
// available.
const fullSchedule = (() => {
  let sched = {
    ...require('./owl-schedule-2019.json')
  };
  //Allow expansion for future years. Will require new data to be entered
  let years = ["2019"];
  //For every season
  years.forEach((y) => {
    //For every stage
    let stages = Object.keys(sched[y]);
    stages.forEach((s) => {
      //For every week in the stage
      let weeks = Object.keys(sched[y][s]);
      weeks.forEach((w) => {
        //For every day in the week
        let days = Object.keys(sched[y][s][w]);
        days.forEach((d) => {
          //Get data from the current day
          let dayObj = sched[y][s][w][d];
          //pull out date string
          let dateString = dayObj["Date"];
          let swd = s + " " + w + " " + d;

          //Create an array of Match objects from the array of shorthand names
          let gamesObj = {};
          let matchNum = 1;
          dayObj["Games"].forEach((shortName) => {
            let thisMatch = new OwlMatch({ swd, shortName, dateString, matchNum: matchNum++ });
            gamesObj[shortName] = matches[thisMatch.displayTitle] = thisMatch;
          });
          dayObj["Games"] = gamesObj;
        })
      });
    });
  });
  return sched;
})();

const makeVideoObject = (_rawData) => {
  // 3 different regex expressions to identify the type of video
  const gameReg = /(Game)\s[0-9]/g;
  const matchReg = /(Full\sMatch\s\|)/g;
  const watchpReg = /(Watchpoint:)/g;

  if (gameReg.test(_rawData.title)) {
    return new OwlGame(_rawData);
  }
  if (matchReg.test(_rawData.title)) {
    const sheetData = new SheetMatchData(_rawData);
    let thisMatch = matches[sheetData.displayTitle];
    if (thisMatch !== undefined) {
      thisMatch.injectMatchVodData(sheetData);
      return thisMatch;
    }
  }
  if (watchpReg.test(_rawData.title)) {
    return new OwlWatchpoint(_rawData);
  }
  return null;
};

const findAllMatchGames = (_match) => {
  // If the match is a future game, we obviously don't have data for it yet
  if (_match.isFutureMatch) { return; }
  // If the match already has its games, return immediately
  if (_match.games.length > 0) { return; }

  // Loop through all videos to find this match's games
  Object.values(videos).forEach((game) => {
    // Only search owl games.  They're the only thing that can be children
    if (game.constructor.name !== 'OwlGame') { return; }
    if (
      game.gameDate[0] === _match.gameDate[0] &&
      game.gameDate[1] === _match.gameDate[1] &&
      game.team1 === _match.team1 &&
      game.team2 === _match.team2
    ) {
      _match.addGame(game);
    }
  });
  // If the match already has at least 5 games, return. No need to pad the data
  if (_match.games.length >= 5) { return; }
  // If there are less than 3 games, this match has incomplete metadata
  if (_match.games.length < 3) { return; }

  // Ensure there are at least 5 games, even for matches that only have 3
  const fakeGameData = {
    title: '',
    video: _match.video,
    thumb: _match.thumb,
  };
  //If the match doesn't have VOD data, replace the video and thumb attributes with those of the
  //first valid game
  if (!_match.hasMatchData) {
    fakeGameData.video = _match.games[0].video;
    fakeGameData.thumb = _match.games[0].thumb;
  }
  // Generate a date string, taking into account playoffs/finals
  let dateString = ` | Stage ${_match.gameDate[0]}`;
  dateString += _match.gameDate[1] > 0 ? ` Week ${_match.gameDate[1]}` : ' Finals';
  // If there are only three games, add a fourth
  if (_match.games.length === 3) {
    fakeGameData.title = `Game 4 ${_match.team1} @ ${_match.team2}${dateString}`;
    _match.addGame(new OwlGame(fakeGameData));
  }
  // If there are only 4 games, add a fifth
  if (_match.games.length === 4) {
    fakeGameData.title = `Game 5 ${_match.team1} @ ${_match.team2}${dateString}`;
    _match.addGame(new OwlGame(fakeGameData));
  }
};

const regenGameData = () => {
  //Re-fetch vod data
  buildGameDataFromSpreadsheet(Object.values(videos)).then((rawDataArr) => {
    //Create javascript objects from each VOD
    rawDataArr.forEach((rawData) => {
      const thisVid = makeVideoObject(rawData);
      if (thisVid !== null) {
        videos[thisVid.title] = thisVid;
      }
    });
    //After all new videos have been processed, re-check for new match data
    Object.values(matches).forEach((match) => {
      findAllMatchGames(match);
      validateMatch(match);
    });
  });
};

const getMatches = () => matches;
const getFullSchedule = () => fullSchedule;

module.exports = { regenGameData, getMatches, getFullSchedule };