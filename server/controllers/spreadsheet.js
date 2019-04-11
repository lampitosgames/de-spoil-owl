const GoogleSpreadsheet = require('google-spreadsheet');
const async = require('async');
//const creds = require('../../client_secret.json');

require('dotenv').config();

//Create a document object using the ID of the spreadsheet - obtained from its URL.
let doc = new GoogleSpreadsheet('1Q0cwasFKsoKXlxDJDXTktMTSVU4Keu5iFSgsXYaVNvg');

let creds = {
  client_email: process.env.SHEETS_EMAIL,
  private_key: process.env.SHEETS_SECRET
};
// Authenticate with the Google Spreadsheets API.
doc.useServiceAccountAuth(creds, function (err) {

  // Get all of the rows from the spreadsheet.
  doc.getRows(1, function (err, rows) {
    console.dir(rows);
  });
});