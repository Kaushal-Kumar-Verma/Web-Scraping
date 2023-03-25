const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

function getInfoFromScorecard(url) {
  // console.log("from scorecards.js ",url);

  // we have a url of a scorecard, we want to get html of that scorecard
  request(url, cb);
}

function cb(err, res, body) {
  if (err) {
    console.log(err);
  } else {
    getMatchDetails(body);
  }
}

function getMatchDetails(html) {
  // selectool contains html of ith scorecrad
  let selecTool = cheerio.load(html);

  //1. get venue
  //2. get date
  let desc = selecTool(".ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid");
  // console.log(desc.text());
  let descArr = desc.text().split(",");
  //   //Match (N), Abu Dhabi, Oct 25 2020, Indian Premier League
  // console.log(descArr);
  let dateOfMatch = descArr[2];
  let venueOfMatch = descArr[1];
  console.log(dateOfMatch);
  console.log(venueOfMatch);

  //   //3. get result

  let matchResEle = selecTool(
    ".ds-text-tight-m.ds-font-regular.ds-truncate.ds-text-typo-title"
  );
  // console.log(matchResEle.text());

  let matchResult = matchResEle.text();
  console.log(matchResult);

  //4. get team names
  let teamNames = selecTool(".ds-text-tight-l.ds-font-bold");
  // console.log(teamNames.text());

  let team1 = selecTool(teamNames[0]).text();
  let team2 = selecTool(teamNames[1]).text();
  console.log(team1);
  console.log(team2);

  //5. get innings

  let allBatsmenTables = selecTool(".ci-scorecard-table");
  console.log("number of batsmen tables are ->   ", allBatsmenTables.length);
  let htmlString = "";
  let count = 0;
  for (let i = 0; i < allBatsmenTables.length; i++) {
    htmlString = htmlString + selecTool(allBatsmenTables[i]).html();
    //let rows = selecTool(allColms)

    //Get the descendants(table rows ) of each element (table )
    let allrows = selecTool(allBatsmenTables[i]).find("tr");

    // for (let i = 0; i < allrows.length; i++) {
    //   //Check to see if any of the matched elements have the given className
    //   let row = selecTool(allrows[i]);
    //   let firstColmnOfRow =row.find("td")[0];
    //   if (selecTool(firstColmnOfRow).hasClass(".batsman-cell")) {
    //     //will be getting valid data
    //     count++;
    //     console.log("inside " + count);

    //     // name | runs | balls | 4's | 6's | sr
    //   }
    // }
    let BatsmanName;
    let BatsmanScore;
    let BatsmanSr;
    let BatsmanBall;
    for (let j = 1; j < allrows.length - 5; j++) {
      if (selecTool(allrows[j]).hasClass("ds-text-tight-s")) {
        let cols = selecTool(allrows[j]).find("td");

        BatsmanName = selecTool(cols[0]).text().trim();
        //.trim() => Removes the leading and trailing white space and line terminator characters from a string.
        BatsmanScore = selecTool(cols[2]).text().trim();
        BatsmanBall = selecTool(cols[3]).text().trim();
        BatsmanSr = selecTool(cols[6]).text().trim();

        // make a match folder================
        // let teamNamePath = path.join(__dirname, "IPL", team1);
        // if (!fs.existsSync(teamNamePath)) {
        //   fs.mkdirSync(teamNamePath);
        // }

        processInformation(
          dateOfMatch,
          venueOfMatch,
          matchResult,
          // teamNames,
          team1,
          team2,
          BatsmanName,
          BatsmanScore,
          BatsmanBall,
          BatsmanSr
        );
      }
    }
    // //   }
  }
  // // console.log(htmlString);

  // after then fill the detail every team ================
  function processInformation(
    dateOfMatch,
    venueOfMatch,
    matchResult,
    // teamNames,
    team1,
    team2,
    BatsmanName,
    BatsmanScore,
    BatsmanBall,
    BatsmanSr
  ) {
    let teamNamePath = path.join(__dirname, "IPL", team1);
    if (!fs.existsSync(teamNamePath)) {
      fs.mkdirSync(teamNamePath);
    }

    // make file path for elx
    let PlayerPath = path.join(teamNamePath, BatsmanName + ".xlsx");
    let content = excelReader(PlayerPath, BatsmanName);

    let playerObj = {
      dateOfMatch,
      venueOfMatch,
      matchResult,
      // teamNames,
      team1,
      team2,
      BatsmanName,
      BatsmanScore,
      BatsmanBall,
      BatsmanSr,
    };
    content.push(playerObj);
// this fun write all the content into excls sheet, and place that sheet data into player path => rohit shrma.xlsx    
    excelWriter(PlayerPath, content, BatsmanName);
  }
}
//this function reads the data from excel file
function excelReader(PlayerPath, sheetName) {
  if (!fs.existsSync(PlayerPath)) {
    // if playerPath does not exists, this means that we have never placed any data into that file
    return [];
  }
// if playerPath already has some data in it
  let workbook = xlsx.readFile(PlayerPath);
  // a directory of the wlorksheet in the workbook . use sheetnames to refrence these.
  let excelData = workbook.Sheets[sheetName];
  let playerObj = xlsx.utils.sheet_to_json(excelData);
  return playerObj;
}

function excelWriter(playerPath, jsObject, sheetName) {
  //Creates a new workbook
  let newWorkBook = xlsx.utils.book_new();
  //Converts an array of JS objects to a worksheet.
  let newWorkSheet = xlsx.utils.json_to_sheet(jsObject);
  //it appends a worksheet to a workbook
  xlsx.utils.book_append_sheet(newWorkBook, newWorkSheet, sheetName);
  // Attempts to write or download workbook data to file
  xlsx.writeFile(newWorkBook, playerPath);
}

//visit every scorecard and get info
module.exports = {
  gifs: getInfoFromScorecard,
};
