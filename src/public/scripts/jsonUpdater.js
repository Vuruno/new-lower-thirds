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

function tiempo(regata, cancha, posicion, tiempo, rpm, actualizacion) {
    // console.log(regata)
    // console.log(cancha)
    // console.log(posicion)
    // console.log(tiempo)
    // console.log(rpm)
    // console.log(actualizacion)

    var json = getGrilla()
    var regata = parseInt(regata) - 1

    posicion = posicion.split(',')
    tiempo = tiempo.split(',')

    if (posicion[0] == 'reiniciar') {
        for (i in json.data[regata].canchas) {
            json.data[regata].canchas[i].posicion = '0'
        }
    } else if (posicion[0] != '') {
        for (i in json.data[regata].canchas) {
            json.data[regata].canchas[i].posicion = posicion[i]
        }
    }

    if (tiempo[0] == 'reiniciar') {
        for (i in json.data[regata].canchas) {
            json.data[regata].canchas[i].posicion = '0'
            json.data[regata].canchas[i].tiempo = '0:00.00'
        }
    } else if (tiempo[0] != '') {
        for (i in json.data[regata].canchas) {
            json.data[regata].canchas[i].posicion = posicion[i]
            json.data[regata].canchas[i].tiempo = tiempo[i]
        }
    }

    if (rpm == 'reiniciar') {
        for (i in json.data[regata].canchas) {
            json.data[regata].canchas[i].rpm = '00'
        }
    } else if (rpm != '') {
        json.data[regata].canchas[cancha].rpm = rpm
    }

    guardarGrilla(json)

    //SET ULTAMA ACTUALIZACION
    var json2 = getStatus()

    if (json2.refresh == actualizacion) {
        json2.start = 'r:' + Date.now()
    } else {
        json2.refresh = actualizacion
    }
    guardarStatus(json2)

}

function output(output) {
    console.log('a')
    var json = getGrilla()
    json.actual.output = output
    guardarGrilla(json)

    //SET ULTAMA ACTUALIZACION

    var json2 = getStatus()
    json2.refresh = Date.now()
    json2.start = 'r:' + Date.now()

    guardarStatus(json2)
}

module.exports = { chrono, tiempo, output }