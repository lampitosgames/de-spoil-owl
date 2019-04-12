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
    // Ensure all videos are unique and new on the server
    const nameMap = new Map();
    rawRowData.forEach((row) => {
      // Ensure uniqueness of incoming data (ignore duplicate rows that sometimes sneak in)
      if (nameMap.has(row.title)) { return; }
      nameMap.set(row.title, true);

      // Check with regex to make sure its something we want
      const shouldNotKeepRegex = /((Player)\s(Q&A))|([0-9]{4}\s(Season))/g;
      if (shouldNotKeepRegex.test(row.title)) { return; }

      // Check and see if this title is already in our ordered list of rows
      if (!state.existingRows.every(eRow => eRow.title !== row.title)) {
        return;
      }

      // Push the unique, new row into the state
      state.rawRowData.push(row);
    });
    _step();
  });
};

const buildGameDataFromSpreadsheet = _existingRows => new Promise((resolve, reject) => {
  // Initialize state
  state = initialState;
  state.existingRows = _existingRows;

  async.series([
    setupDoc,
    setupAuth,
    getInfoAndWorksheets,
    getNewRows,
  ], (_err) => {
    if (_err) {
      reject(_err);
    } else {
      resolve(state.rawRowData);
    }
  });
});

module.exports = { buildGameDataFromSpreadsheet };
