/**
 * @description Object with all elements to see on the table
 */
var elements = [
  {
    key: "name",
    description: "Name",
    type: "string"
  },
  {
    key: "bestBid",
    description: "Best Bid",
    type: "decimalNumber"
  },
  {
    key: "bestAsk",
    description: "Best Ask",
    type: "decimalNumber"
  },
  {
    key: "lastChangeBid",
    description: "Last Change Bid",
    type: "decimalNumber"
  },
  {
    key: "last30Sec",
    description: "Last 30s",
    type: "sparkline"
  },
];

/**
 * @var pricesData save all currencies pair
 */
var pricesData = [];

/**
 * @description If the connection be well succeed we use this function. Then we subscribe the destination and get the object from the callback.
 * We call the function to created the table headers and the function to update sparkLines once. 
 * Also, we created our price dictionary for each currency pair, and init or updated the array for the last 30 seconds.
 * @param {*} client 
 */
function connectCallback(client) {
   
  client.subscribe("/fx/prices", function(response) {
    var currencyPair = JSON.parse(response.body);

    // old values
    var aux = pricesData[currencyPair.name];
    
    // update values
    pricesData[currencyPair.name] = currencyPair;
    
    // save last 30 values average price values
    if (aux && aux.hasOwnProperty("last30Sec")) {
      
      // updated array with old and new values
      aux["last30Sec"].push(getMidPrice(currencyPair.bestBid, currencyPair.bestAsk));
      pricesData[currencyPair.name]["last30Sec"] = aux["last30Sec"];

    } else {
      // start array for last 30 seconds
      pricesData[currencyPair.name]["last30Sec"] = [getMidPrice(currencyPair.bestBid, currencyPair.bestAsk)];
    }

    // sort table by Last Change Bid DESC
    generateRows(sortTable(Object.values(pricesData)));
  })
  /**
   * Create header
   */
  generateHeader()
  /**
   * Update SparkLines every second
   */
  updateSparkLines()
}

/**
 * @description Create header rows with the elements array of objects
 */
function generateHeader() { 
  // get the reference for the header
  var header = document.getElementById("bid-header");
  // create a table header row
  var row = document.createElement("tr");
  elements.forEach(function(element) {
    var cell = document.createElement("td");
    var cellText = document.createTextNode(element.description);
    cell.appendChild(cellText);
    row.appendChild(cell);
  });

  // add the header row
  header.appendChild(row);
}

/**
 * @description Create rows table elements
 * @param pricesData array with all currencies pair already received
 */
function generateRows(pricesData) {
  // get the reference for the body
  var body = document.getElementById("bid-body");

  // All currency pairs that exists in global array
  for (var i = 0; i < Object.keys(pricesData).length; i++) {
    
    // verify if element (currency pair) already exist
    var foundElem = document.getElementById(pricesData[i].name)
    
    // if element already exist we need to remove it
    if (foundElem) foundElem.remove();
    
    // creates a table row
    var row = document.createElement("tr");

    // create a new element id with currency pair
    row.setAttribute("id", pricesData[i].name)

    /**
     * Create a <td> elements
     */ 
    elements.forEach(function(element) {
      var cell = document.createElement("td");

      if (element.type == "decimalNumber") {
        var cellText = document.createTextNode(decimalValues((pricesData[i][element.key]), 5));
        cell.appendChild(cellText);
      } else if (element.type == "sparkline") {
        Sparkline.draw(cell, pricesData[i][element.key]);
      } else {
        var cellText = document.createTextNode(pricesData[i][element.key]);
        cell.appendChild(cellText);
      }
      row.appendChild(cell);
    });
    
    // add the row to the end of the table body
    body.appendChild(row);
  }
}

/**
 * @description Function to updated the sparkLine every second.
 * If the currency pair does not receive update, I use the last inserted value to update. 
 * Else I update the array with the new value and remove the oldest values and save only the last 30 seconds.
 */
function updateSparkLines() {
  
  setInterval(function() {
    // get current currency pairs keys
    var currencyPairs = Object.keys(pricesData);
    
    for (var i = 0; i < currencyPairs.length; i++) {
      // array with the last 30 seconds for a currency pair
      var last30Sec = pricesData[currencyPairs[i]]["last30Sec"];

      // get last position
      var lastPosition = last30Sec.length - 1;

      // get last value inserted
      var lastValue = last30Sec[lastPosition];
      
      // update array
      last30Sec.push(lastValue);
      
      // fix last 30 seconds
      last30Sec = saveLast30seconds(last30Sec);
    }
  }, 1000);
}

/**
 * @description Save the last 30 seconds
 * @param {*} last30Sec currency pair updated prices
 * @returns the last 30 seconds of prices for a currency pair
 */
function saveLast30seconds (last30Sec) {
  // array checked to save only last 30 seconds
  if (last30Sec.length > 30) {
      
    // get the difference to 30 elements
    var diff = last30Sec.length - 30;

    // remove from the original array the difference of older values
    last30Sec.splice(0, diff);
  }
  return last30Sec;
}

/**
 * @description Calc middle price (bestBid + bestAsk) / 2
 * @param bestBid bestBid value
 * @param bestBid bestAsk value
 * @returns the middle price between bestBid and bestAsk
 */
function getMidPrice(bestBid, bestAsk) {
  return (bestBid + bestAsk) / 2;
}

/**
 * @description Change value to decimal places
 * @param value number to be converted
 * @param decimal number decimal places to fix
 * @returns a value converted to a float number
 */
function decimalValues(value, decimal) {
  return parseFloat(value).toFixed(decimal);
}

/**
 * @description Function to sort prices data by lastChangeBid DESC
 * @param pricesData array with all currencies pair already received
 * @returns pricesData sorted by lastChangeBid DESC
 */
function sortTable (pricesData) {
  return pricesData.sort(function(a,b) { 
    return (b.lastChangeBid > a.lastChangeBid) ? 1 : ((a.lastChangeBid > b.lastChangeBid) ? -1 : 0);
  });
}

module.exports = {
  connectCallback: connectCallback,
  generateHeader: generateHeader,
  generateRows: generateRows,
  decimalValues: decimalValues,
  getMidPrice: getMidPrice,
  sortTable: sortTable,
  saveLast30seconds: saveLast30seconds
};
