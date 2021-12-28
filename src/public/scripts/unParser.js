const { getDiffieHellman } = require('crypto');
const fs = require('fs')
const path = require('path')
const xlsx = require("node-xlsx");

var filex = []

function encabezado(json) {
    let fila = []
    fila.push('carrera:')
    fila.push(json.titulo)
    filex.push(fila)
  
    fila = []
    fila.push(json.fecha)
    fila.push(json.sede)
    filex.push(fila)

    fila = []
    fila.push('orden')
    fila.push('bote')
    fila.push('categoria')
    fila.push('sexo')
    fila.push('carril')
    fila.push('1')
    fila.push('2')
    fila.push('3')
    fila.push('4')
    fila.push('5')
    fila.push('6')
    filex.push(fila)
}

function prueba(json) {
    let fila = []
    fila.push(json.categoria.nro)
    fila.push(json.categoria.bote)
    fila.push(json.categoria.cat)
    fila.push(json.categoria.mf)
    fila.push('delegacion')
    for (x of json.carriles) {
        fila.push(x.club)
    }
    filex.push(fila)

    for (n in json.carriles[0].nombres) {
        fila = ['','','','',1+Number(n)]
        for (c in json.carriles) {
            fila.push((json.carriles[c].nombres[n]))
        }
        filex.push(fila)
    }   

    fila = ['','','','','posicion']
    for (x of json.carriles) {
        if (x.posicion == '0') fila.push('')
        else fila.push(x.posicion)
    }
    filex.push(fila)

    fila = ['','','','','tiempo']
    for (x of json.carriles) {
        if (x.tiempo == '0:00.00') fila.push('')
        else fila.push(x.tiempo)
    }
    filex.push(fila)
}

function guardar(filex) {
    fs.writeFile(path.join(__dirname, '../grilla.xlsx'), filex, (err) => {
        if (err)
            console.log(err)
    })
}

function processFile() {
    filex = []
    const json = require('../grilla.json')

    encabezado(json)
    for (x of json.data) {
        prueba(x)
    }

    filex = xlsx.build([{name: json.titulo, data: filex}])
    guardar(filex)
}

module.exports = { processFile }