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
} = require('./owl-game.js');
const { buildGameDataFromSpreadsheet } = require('./refresh-raw-data.js');
// const owlMetadata = require('./owl-metadata.json');

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
    const thisMatch = new OwlMatch(_rawData);
    matches[thisMatch.title] = thisMatch;
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
      game.gameDate[0] === _match.gameDate[0]
      && game.gameDate[1] === _match.gameDate[1]
      && game.team1 === _match.team1
      && game.team2 === _match.team2
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
