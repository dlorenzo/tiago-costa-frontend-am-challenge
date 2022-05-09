var lib = require("../app");
var { JSDOM } = require('jsdom');

describe("Main functions", function() {
  const dom = new JSDOM(`<!DOCTYPE html><body><table><thead id="bid-header"></thead><tbody id="bid-body"></tbody></table></html>`);
  document = dom.window.document;
  
  it("header rendered", function() {
        lib.generateHeader();
    var headers = document.querySelector("#bid-header > tr")
    expect(headers.children.length).toBe(5);
  });

  it("non duplicated currency pair", function() {
    
    var pricesData = [{
        "name": "eurcad",
        "bestBid":1.402659874578654,
        "bestAsk":1.418558634741743,
        "openBid":1.4093977179922783,
        "openAsk":1.4334022820077217,
        "lastChangeAsk":-0.014843647265978755,
        "lastChangeBid":-0.006737843413624267
      },
      {
        "name": "eurcad",
        "bestBid":1.402659874578654,
        "bestAsk":1.418558634741743,
        "openBid":1.4093977179922783,
        "openAsk":1.4334022820077217,
        "lastChangeAsk":-0.014843647265978754,
        "lastChangeBid":-0.006737843413624267
      },
      {
        "name": "usdjpy",
        "bestBid":104.37440505720107,
        "bestAsk":109.50396065578232,
        "openBid":106.67463109228619,
        "openAsk":110.3353689077138,
        "lastChangeAsk":-4.275669959214213,
        "lastChangeBid":-6.462188036625207
      }
    ]
    lib.generateRows(pricesData);
    var elem = document.querySelector("#bid-body").querySelectorAll("#usdjpy").length;
  
    expect(elem).toBe(1);
  });

  it("check if all currency (3 with lenth of 2) exists", function() {
    var elem = document.querySelector("#bid-body").children.length;  
    expect(elem).toBe(2);
  });
})

describe("Simple functions", function() {

  it("convert number to floating", function() {
    var result = lib.decimalValues(10, 2);
    expect(result).toBe("10.00");
  });

  it("sum two numbers and divide by 2", function() {
    var result = lib.getMidPrice(10, 2);
    expect(result).toBe(6);
  });

  it("sort table prices data ", function() {
    var array = [
      {
        lastChangeBid: 10,
      },
      {
        lastChangeBid: 20,
      },
      {
        lastChangeBid: 5,
      },
      {
        lastChangeBid: 15,
      },
    ]
    var result = lib.sortTable(array);
    expect(result).toBe(array.sort());
  });

  it("fix size for 30 (seconds/length)", function () {
    var array40 = Array.from(Array(40).keys());
    var result = lib.saveLast30seconds(array40);
    expect(result).toStrictEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]);
  });

});