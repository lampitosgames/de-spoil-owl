/**
 * This file exposes two functions with identical functionality, one is async and the other is not
 * It will fetch raw spreadsheet data and return anything newly added since the server started
 */

const GoogleSpreadsheet = require('google-spreadsheet');
const async = require('async');
require('dotenv').config();

const initialState = {
  doc: null,
  sheet: null,
  // An array of data objects from the spreadsheet
  rawRowData: [],
  // Passed-in array of data objects the server already knows about
  existingRows: [],
};
let state = initialState;

// Uses the sheets API to create the spreadsheet object in JS
const setupDoc = (_step) => {
  // Create a document object using the ID of the spreadsheet - obtained from its URL.
  state.doc = new GoogleSpreadsheet('1Q0cwasFKsoKXlxDJDXTktMTSVU4Keu5iFSgsXYaVNvg');
  _step();
};

// Setup google sheets AUTH using env variables
const setupAuth = (_step) => {
  const creds = {
    client_email: process.env.SHEETS_EMAIL,
    private_key: process.env.SHEETS_SECRET,
  };
  state.doc.useServiceAccountAuth(creds, _step);
};

// Get info about the worksheet, print that it has loaded, and save the individual worksheet
// so we don't have to pass in the worksheet index every time
const getInfoAndWorksheets = (_step) => {
  state.doc.getInfo((_err, _info) => {
    console.log(`Loaded doc: ${_info.title}`);
    const [localSheet] = _info.worksheets;
    state.sheet = localSheet;
    _step();
  });
};

const getNewRows = (_step) => {
  state.sheet.getRows({}, (_err, _rows) => {
    // Map the rows to get only the data we care about
    const rawRowData = _rows.map(r => ({
      title: r.title,
      video: r.video,
      thumb: r.thumb,
    }));

    // Ensure all videos are unique, video types we want, and new on the server
    const nameMap = new Map();
    rawRowData.forEach((row) => {
      // Ensure uniqueness of incoming data (ignore duplicate rows that sometimes sneak in)
      if (nameMap.has(row.title)) { return; }
      nameMap.set(row.title, true);

      // Check with regex to make sure its something we want
      const shouldKeepRegex = /(Watchpoint:)|(Game\s[0-9])|(Full\sMatch)/g;
      if (!shouldKeepRegex.test(row.title)) { return; }

      // Check and see if this title is already in our ordered list of rows
      if (!state.existingRows.every(eRow => eRow.title !== row.title)) { return; }

      // Push the unique, new row into the state
      state.rawRowData.push(row);
    });
    _step();
  });
};

/**
 * Builds game data from the google drive spreadsheet. Returns array of new data the server does
 * not know about.
 * @param  {Array} _existingRows Array of OWL game data. Must have a .title property to compare against
 * @return {Array}               Array of new-to-the-server data from the spreadsheet (new items
 *                               that weren't in the existingRows list)
 */
const buildGameDataFromSpreadsheet = _existingRows => new Promise((resolve, reject) => {
  // Initialize state
  state = initialState;
  state.existingRows = _existingRows;
  //Execute async events in series
  async.series([
    setupDoc,
    setupAuth,
    getInfoAndWorksheets,
    getNewRows,
  ], (_err) => {
    //When the async series is done, if there is an error
    if (_err) {
      //Reject because of error
      reject(_err);
    } else {
      //Pass in final result to the resolve method of the promise
      resolve(state.rawRowData);
    }
  });
});

module.exports = { buildGameDataFromSpreadsheet };