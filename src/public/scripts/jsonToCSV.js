const fs = require('fs')
const path = require('path')
const FileSaver = require('file-saver')
var Blob = require('blob')
const fastcsv = require('fast-csv');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function getGrilla() {
    var contents = require('../grilla.json')
    return contents
}

function guardarGrilla(filex) {

    
    const csvWriter = createCsvWriter({
        path: 'out.csv',
        header: [
            { id: 'name', title: 'Name' },
            { id: 'surname', title: 'Surname' },
            { id: 'age', title: 'Age' },
            { id: 'gender', title: 'Gender' },
        ]
    });

    const data = [
        {
            name: 'John',
            surname: 'Snow',
            age: 26,
            gender: 'M'
        }, {
            name: 'Clair',
            surname: 'White',
            age: 33,
            gender: 'F',
        }, {
            name: 'Fancy',
            surname: 'Brown',
            age: 78,
            gender: 'F'
        }
    ];

    csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));

    const fs = require('fs');
    const ws = fs.createWriteStream("out.csv");
    fastcsv
        .write(data, { headers: true })
        .pipe(ws);
}

function downloadCSV() {
    let json = getGrilla()

    return guardarGrilla(json)
}

module.exports = { downloadCSV }