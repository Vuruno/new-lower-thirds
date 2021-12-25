const fs = require('fs')
const path = require('path')

function getGrilla() {
    var contents = require('../grilla.json')
    return contents
}

function guardarGrilla(filex) {
    filex = JSON.stringify(filex)
    fs.writeFile(path.join(__dirname, '../grilla.json'), filex, (err) => {
        if (err) console.log(err)
    })
}

function getStatus() {
    var contents = require('../status.json')
    return contents
}

function guardarStatus(filex) {
    filex = JSON.stringify(filex)
    fs.writeFile(path.join(__dirname, '../status.json'), filex, (err) => {
        if (err) console.log(err)
    })
}

//UPLOADERS
function chrono(value) {

    var json = getStatus()
    json.start = value

    guardarStatus(json)
}

function tiempo(regata, carril, posicion, tiempo, rpm, actualizacion) {
    var json = getGrilla()
    var regata = parseInt(regata) - 1

    posicion = posicion.split(',')
    tiempo = tiempo.split(',')

    if (posicion[0] == 'r') {
        for (i in json.data[regata].carriles) {
            json.data[regata].carriles[i].posicion = '0'
        }
    } else if (posicion[0] != '') {
        for (i in json.data[regata].carriles) {
            json.data[regata].carriles[i].posicion = posicion[i]
        }
    }

    if (tiempo[0] == 'r') {
        for (i in json.data[regata].carriles) {
            json.data[regata].carriles[i].posicion = '0'
            json.data[regata].carriles[i].tiempo = '0:00.00'
        }
    } else if (tiempo[0] != '') {
        for (i in json.data[regata].carriles) {
            json.data[regata].carriles[i].tiempo = tiempo[i]
        }
    }

    if (rpm == 'reiniciar') {
        for (i in json.data[regata].carriles) {
            json.data[regata].carriles[i].rpm = '00'
        }
    } else if (rpm != '') {
        json.data[regata].carriles[carril].rpm = rpm
    }

    guardarGrilla(json)

    //SET ULTAMA ACTUALIZACION
    var json2 = getStatus()
    if (actualizacion != '0') {
        json2.refresh = actualizacion
    }
    if (Date.now() - json2.start > 6000 || isNaN(Date.now() - json2.start)) {
        json2.start = 'r:' + Date.now()
    }
    guardarStatus(json2)

}

function output(output, vista) {
    var json = getGrilla()
    json.actual.output = output
    json.actual.vista = vista
    guardarGrilla(json)

    //SET ULTAMA ACTUALIZACION

    var json2 = getStatus()
    json2.refresh = Date.now()
    
    if (Date.now() - json2.start > 6000 || isNaN(Date.now() - json2.start)) {
        json2.start = 'r:' + Date.now()
    }

    guardarStatus(json2)
}

function getVista() {
    var json = getGrilla()
    return json.actual.vista
}

module.exports = { chrono, tiempo, output, getVista }