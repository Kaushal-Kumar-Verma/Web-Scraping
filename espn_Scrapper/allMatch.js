const request = require("request");
const cheerio = require("cheerio");
// const getScoreCardObj = require("./scorecards");
const {gifs} = require("./scorecards");

function getAllMatch(url) {
  console.log("from all match.js",url);
    request(url, cb);
}
function cb(err, res, body) {
    if (err) {
    console.error("error", err);
        } else {
    extractAllMatchLink(body);
    }
}
function extractAllMatchLink(html) {
  let selecTool = cheerio.load(html);
  let scorecardElemArr = selecTool(
    '[class="ds-flex ds-mx-4 ds-pt-2 ds-pb-3 ds-space-x-4 ds-border-t ds-border-line-default-translucent"] span:nth-child(3)>a'
  );
  console.log(scorecardElemArr.length);
  for (let i = 0; i < scorecardElemArr.length; i++){
        let scorecardLink = selecTool(scorecardElemArr[i]).attr("href");
        // console.log(i + 1 + ") " + scorecardLink);
        let fullLink = "https://www.espncricinfo.com" + scorecardLink;
        // getScoreCardObj.gifs(fullLink);
        gifs(fullLink);
        // break;
    }
}
module.exports = {
  getAllMatch: getAllMatch,
};