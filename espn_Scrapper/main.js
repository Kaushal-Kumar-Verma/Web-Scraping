let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const allMatchObj = require("./allMatch");
request(url, cb);

function cb(err, res, body) {
  if (err) {
    console.error("error", err);
  } else {
    handleHTML(body);
  }
}



function handleHTML(html) {
    let iplPath = path.join(__dirname, "IPL"); // dirname -> espn ka path dedega
    // console.log(_dirname);
    // d:\FJP5\Node\WebScrapping\espn_Scrapper\main.
    if (!fs.existsSync(iplPath)) {
      fs.mkdirSync(iplPath);
    }
  let selecTool = cheerio.load(html);
  let anchorElem = selecTool(
    '[class="ds-block ds-text-center ds-uppercase ds-text-ui-typo-primary ds-underline-offset-4 hover:ds-underline hover:ds-decoration-ui-stroke-primary ds-block"]'
  );
//   console.log(anchorElem);

  //  attr methods -> Method for getting all attributes and their values
  let relativeLink = anchorElem.attr("href");
  // console.log(relativeLink);
  let fullLink = "https://www.espncricinfo.com" + relativeLink;
//   console.log(fullLink);
  allMatchObj.getAllMatch(fullLink);
}
