const fs = require('fs')
const csv = require('fast-csv')
const path = require('path')
const os = require('os')
require('isomorphic-fetch')

const API_KEY = require('./API_KEY')

//currently just Harpactirinae //TODO update to call any taxon
const tpediaURL = `http://www.tarantupedia.com/api/get/zoo/occurrences?app=1&api_key=${API_KEY}&type=subfamily&id=5`


const filePath = String.raw`C:\Users\engelbrechti\Google Drive\Baboon spider atlas\Data`
const fileName = 'TarantupediaRecords 20201022.csv'

fetch(tpediaURL).then(async res => {
  let json = await res.json()
  let records = json.results
  let mappedRecords = []
  for (let record of records) {
    let decimalCoordinates = record.decimalCoordinates
    let decimalLatitude, decimalLongitude
    if(decimalCoordinates && decimalCoordinates.trim()){
      if(decimalCoordinates.includes(',')){
        let coordparts = decimalCoordinates.split(',')
        if(coordparts.length == 2) {
          decimalLatitude = Number(coordparts[0].trim())
          decimalLongitude = Number(coordparts[1].trim())
        }
      }
    }

    let eventDate = [record.year, record.month, record.day].filter(x=>x).join('-')

    let mappedRecord = {
      datasetID: record.databaseRecordId,
      catalogNumber: record.catalogNumber,
      originalNameUsage: record.originalNameUsage, //very bad, this is actually scientific but this hack is needed to match other datasets
      scientificName: record.scientificName,
      typeStatus: record.isType == 'yes' ? 'type' : null, 
      sex: record.sex, 
      locality: record.locality,
      decimalCoordinates, 
      decimalLatitude,
      decimalLongitude,
      recordedBy: record.recordedBy,
      year: record.year,
      month: record.month, 
      day: record.day,
      eventDate,
      recordSource: record.source
    }

    mappedRecords.push(mappedRecord)
  }

  if(!fileName.endsWith('.csv')){
    fileName = fileName + '.csv'
  }

  var ws = fs.createWriteStream(path.join(filePath, fileName));
  csv
    .write(mappedRecords, {headers: true})
    .pipe(ws);

  console.log('done writing CSV')

})