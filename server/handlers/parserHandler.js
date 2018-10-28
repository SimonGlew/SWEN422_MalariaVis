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
            .on('end', () => {
                console.log(dataHandler.getCountries())
            })
    })

}

module.exports = {
    parse: parse
}