const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./Credentials.json');
const  Zillow  = require('node-zillow');

const doc = new GoogleSpreadsheet('1-DCtBRkmS-kMQQMq5N1bs7rmn49HHpj-9DKDMg6rkzw');
const zillow = new Zillow(creds.zillow_key);

async function accessSpreadsheet() {
  await doc.useServiceAccountAuth({ 
    client_email: creds.client_email,
    private_key: creds.private_key,
  });

  await doc.loadInfo(); // loads document properties and worksheets

  const sheet = doc.sheetsByIndex[0]; // get the desired sheet on the spread sheet
  const rows = await sheet.getRows(); // get the rows of the sheet

  rows.forEach(rows => { //Iterate over rows to get the data per row
    
    const fullAddress = rows.Address.split(','); //Split the full address to separate the address and citystatezip
    if(fullAddress[2].includes('TX')) //this condition will only accept address from TX (Texas)
    {
      const parameters = { //Parameters for the Zillow API
        address: fullAddress[0],
        citystatezip: fullAddress[1] + ',' + fullAddress[2],
        rentzestimate: false
      } 
      
      zillow.get('GetDeepSearchResults', parameters) //function to call the API and get the response
      .then(function(results) {
        rows.Zestimate = results.response.results.result[0].zestimate[0].amount[0]._; //update the Zestimate from the response data from API
        rows.SquareFootage = results.response.results.result[0].lotSizeSqFt[0]; //update the Square Footage from the response data from API
        rows.YearBuilt = results.response.results.result[0].yearBuilt[0]; //update the Year Built from the response data from API
        rows.save(); //Save all updated rows
      })
    }
  })
  console.log('Done');
}

accessSpreadsheet();