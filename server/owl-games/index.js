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
  isValidMatch,
  getStageWeekDay
} = require('./owl-game.js');
const { buildGameDataFromSpreadsheet } = require('./refresh-raw-data.js');
const owlMetadata = require('./owl-metadata.json');

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
          dayObj["Games"] = dayObj["Games"].map((shortName) => {
            return new OwlMatch({
              swd: swd,
              shortName: shortName,
              dateString: dateString
            });
          });
        })
      });
    });
  });
  return sched;
})();

// When the server starts, no videos have been loaded
const videos = {};
let matches = {};

const makeVideoObject = (_rawData) => {
  // 3 different regex expressions to identify the type of video
  const gameReg = /(Game)\s[0-9]/g;
  const matchReg = /(Full\sMatch\s\|)/g;
  const watchpReg = /(Watchpoint:)/g;

  if (gameReg.test(_rawData.title)) {
    return new OwlGame(_rawData);
  }
  if (matchReg.test(_rawData.title)) {
    //Format raw data for insertion into schedule
    let thisSWD = getStageWeekDay(_rawData.title);
    const thisTeams = _rawData.title.split(' | ')[1].split(' vs. ');
    thisTeam1 = owlMetadata.teams.longToShort[thisTeams[0]];
    thisTeam2 = owlMetadata.teams.longToShort[thisTeams[1]];
    matches[thisMatch.title] = thisMatch;
    //TODO: I definitely need to create a duplicate OwlMatch here
    //  reason being that I need it to be in the videos array with the
    //  spreadsheet title. Maybe make a seprate type of object/data structure
    //  for this? 
    return thisMatch;
  }
  if (watchpReg.test(_rawData.title)) {
    return new OwlWatchpoint(_rawData);
  }
  return null;
};

const findAllMatchGames = (_match) => {
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

  // Ensure there are at least 5 games, even for matches that only have 3.
  const fakeGameData = {
    title: '',
    video: _match.video,
    thumb: _match.thumb,
  };
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
  buildGameDataFromSpreadsheet(Object.values(videos)).then((rawDataArr) => {
    matches = {};
    rawDataArr.forEach((rawData) => {
      const thisVid = makeVideoObject(rawData);
      videos[thisVid.title] = thisVid;
    });
    Object.values(matches).forEach((match) => {
      findAllMatchGames(match);
      // Ensure that the match's data was built correctly
      if (!isValidMatch(match)) {
        // If it was not built correctly, delete it
        delete matches[match.title];
      }
    });
  });
};

const getMatches = () => matches;

module.exports = { regenGameData, getMatches };