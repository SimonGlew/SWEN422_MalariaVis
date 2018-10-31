const dataHandler = require('./dataHandler')

const csv = require('fast-csv'),
    fs = require('fs')

function parse(directoryName) {
    let files = [{ type: 'incidence', path: '/data/incidence-of-malaria-fixed.csv' }, { type: 'death', path: '/data/malaria-death-rates-fixed.csv' }]
    files.forEach(file => {
        let stream = fs.createReadStream(directoryName + file.path)

        csv.fromStream(stream, { headers: true })
            .on("data", (blob) => {
                if(!blob.Code) return;
                if(file.type == 'incidence')dataHandler.addIncidenceToMap(blob)
                else dataHandler.addMortalityToMap(blob)
            })
    })

}

function turnDataToCSV(data){
    let csv = 'Country,Year,Incidence (per 1000 at risk),Mortality (per 1000 effected),Death(%)\n'
    data.forEach(c => {
        let country = (dataHandler.getCountries().filter(r => r.code == c.country))[0]
        c.data.forEach((year, index) => {
            let death = year.incidence != 0 ? year.mortality / year.incidence : 0
            csv += country.entity+','+year.year+','+year.incidence+','+year.mortality+','+death+'\n'
        })
    })
    return csv
}

module.exports = {
    parse: parse,
    turnDataToCSV: turnDataToCSV
}