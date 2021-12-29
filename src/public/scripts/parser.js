const { getDiffieHellman } = require('crypto');
const fs = require('fs')
const path = require('path')
const Papa = require("papaparse");
var xlsx = require('node-xlsx');

// -----------EXCEL CONVERTION-------------

// ----------------------------------------

var filex = 'a'
var columnas, filas = []

function toUpper(word) {
    word = word.toString().toLowerCase().trim()
    var splited = word.split(' ')
    word = ''

    for (i of splited) {
        word = word + i.charAt(0).toString().toUpperCase() + i.slice(1) + ' '
    }

    return word
}

function getFile() {
    // var data = fs.readFileSync(path.join(__dirname, '../grilla.xlsx'), { encoding: 'utf8' })
    var data = xlsx.parse(path.join(__dirname, '../grilla.xlsx'))
    return data
}

function guardar(filex) {
    fs.writeFile(path.join(__dirname, '../grilla.json'), filex, (err) => {
        if (err)
            console.log(err)
    })
}

function processColumn(filex, str, inicio = 0, fin = filex.length - 2) {
    str = str.split('|')

    for (strToSearch of str) {
        var j, i = 0
        for (j = inicio; j <= fin; j++) {
            for (i = 0; i < filex.length - 1; i++) {
                if (filex[i][j] != undefined) {

                    if (filex[i][j].toString().toLowerCase().includes(strToSearch)) {
                        return j
                    }
                }
            }
        }
    }
    return 99
}

function hallarFila(filex, colNro) {
    var array = []
    for (x in filex) {
        if (filex[x][colNro] > 0 && filex[x][colNro] < 100) {
            array.push(x)
        }
    }

    return array
}

function hallarColumn(filex) {
    //                     cat: [bot cat sex internationalsystem (evento)]
    var columnas = { num: 0, cat: [0, 1, 2, 3], can: [0, 1, 2, 3, 4, 5] }

    columnas.num = processColumn(filex, "or|nro|numero")

    columnas.cat[0] = processColumn(filex, "bote", columnas.num + 1)
    columnas.cat[1] = processColumn(filex, "cat", columnas.cat[0] + 1)
    columnas.cat[2] = processColumn(filex, "sexo|gen", columnas.cat[1] + 1)
    columnas.cat[3] = processColumn(filex, "evento|prueba", columnas.num + 1)

    if (columnas.cat[0] != 99) columnas.can[0] = processColumn(filex, "cancha 1|carril 1", columnas.cat[2] + 1)
    else columnas.can[0] = processColumn(filex, "cancha 1|carril 1", columnas.cat[3] + 1)

    if (columnas.can[0] == 99) {
        //SEGUNDO SISTEMA DE TABLAS
        if (columnas.cat[0] != 99) columnas.can[0] = processColumn(filex, "1", columnas.cat[2] + 2)
        else columnas.can[0] = processColumn(filex, "1", columnas.cat[3] + 2)
        columnas.can[1] = processColumn(filex, "2", columnas.can[0] + 1)
        columnas.can[2] = processColumn(filex, "3", columnas.can[1] + 1)
        columnas.can[3] = processColumn(filex, "4", columnas.can[2] + 1)
        columnas.can[4] = processColumn(filex, "5", columnas.can[3] + 1)
        columnas.can[5] = processColumn(filex, "6", columnas.can[4] + 1)
    } else {
        columnas.can[1] = processColumn(filex, "cancha 2|carril 2", columnas.can[0] + 1)
        columnas.can[2] = processColumn(filex, "cancha 3|carril 3", columnas.can[1] + 1)
        columnas.can[3] = processColumn(filex, "cancha 4|carril 4", columnas.can[2] + 1)
        columnas.can[4] = processColumn(filex, "cancha 5|carril 5", columnas.can[3] + 1)
        columnas.can[5] = processColumn(filex, "cancha 6|carril 6", columnas.can[4] + 1)
    }

    return columnas
}

function parseCategoria(nro) {
    var bote, cat, mf = ""
    if (columnas.cat[0] != 99) {

        bote = filex[filas[nro]][columnas.cat[0]].toString().toLowerCase()
        if (bote.includes('8+')) bote = '8+' //'Ocho'
        else if (bote.includes('4x')) bote = '4x' //'Cuadruple'
        else if (bote.includes('4-')) bote = '4-' //'Cuatro-Sin'
        else if (bote.includes('2x')) bote = '2x' //'Doble'
        else if (bote.includes('2-')) bote = '2-' //'Dos-sin'
        else if (bote.includes('1x+')) bote = '1x+' //'Par-de-Paseo'
        else if (bote.includes('1x')) bote = '1x' //'Single'

        cat = filex[filas[nro]][columnas.cat[1]].toString().toLowerCase()
        if (cat.startsWith('ma') || cat.startsWith('má')) cat = 'Master'
        else if (cat.startsWith('me') && cat.includes('a')) cat = 'Menor A'
        else if (cat.startsWith('me') && cat.includes('b')) cat = 'Menor B'
        else if (cat.startsWith('me') && !(cat.includes('b') || cat.includes('a'))) cat = 'Menor'
        else if (cat.startsWith('j')) cat = 'Juvenil'
        else if (cat.startsWith('s')) {
            if (cat.includes('l') && cat.includes('b')) cat = 'Senior B PL'
            else if (cat.includes('l')) cat = 'Senior PL'
            else if (cat.includes('b')) cat = 'Senior B'
            else cat = 'Senior'
        }
        else if (cat.startsWith('i')) cat = 'Infantil'
        else if (cat.startsWith('n')) cat = 'Novicio'
        else if (cat.startsWith('a')) cat = 'Abierto'

        mf = filex[filas[nro]][columnas.cat[2]].toString().toLowerCase()
        if (mf.startsWith('m')) mf = 'Mas'
        else if (mf.startsWith('f')) mf = 'Fem'

    } else {

        bote = filex[filas[nro]][columnas.cat[3]].toString().toLowerCase()
        if (bote.includes('8+')) bote = '8+' //'Ocho'
        else if (bote.includes('4x')) bote = '4x' //'Cuadruple'
        else if (bote.includes('4-')) bote = '4-' //'Cuatro-Sin'
        else if (bote.includes('2x')) bote = '2x' //'Doble'
        else if (bote.includes('2-')) bote = '2-' //'Dos-sin'
        else if (bote.includes('1x')) bote = '1x' //'Single'

        cat = filex[filas[nro]][columnas.cat[3]].toString().toLowerCase()
        if (cat.startsWith('j')) cat = 'Juvenil'
        else if (cat.startsWith('l')) cat = 'Senior PL'
        else if (cat.startsWith('b')) cat = 'Senior B'
        else if (cat.startsWith('bl')) cat = 'Senior B PL'
        else cat = 'Senior'

        mf = filex[filas[nro]][columnas.cat[3]].toString().toLowerCase()
        if (mf.includes('m')) mf = 'Mas'
        else if (mf.includes('w')) mf = 'Fem'

    }

    nro = Number(nro) + 1

    let categoria = '{\n"nro": "' + nro + '",\n"bote": "' + bote + '",\n"cat": "' + cat + '",\n"mf": "' + mf + '"\n}'

    return categoria
}

function parseCancha(nro, cant) {
    let text = ""

    let reg = Number(filas[nro])

    for (var can of columnas.can) {
        var nombres = []
        for (let i = reg + 1; i <= reg + cant; i++) {
            let nombre = filex[i][can]
            if (nombre != '' && nombre != undefined) {
                nombres.push('"' + toUpper(nombre) + '"')
            }

        }
        if (nombres.length == 0) nombres = ['""']

        if (filex[reg][can] != '' && filex[reg][can] != undefined) {
            text = text + '{\n"club": "' + filex[reg][can] + '",\n"nombres": [' + nombres + '],\n"tiempo": "0:00.00",\n"posicion": "0",\n"rpm": "00",\n"puntaje": 0\n},\n'
        } else break
    }

    text = text.slice(0, -2)
    text = "[" + text + "]"

    return text
}

function parseJson(titulo, fecha, sede) {
    let text = '{"actual": {\n"output": "1", \n"vista": "Nada", \n"chrono": false,\n"regata": 1\n},\n"titulo": "'
        + titulo + '",\n"fecha": "' + fecha + '",\n"sede": "' + sede
        + '",\n"data": [\n'

    for (i in filas) {
        // for (let i = 0; i < 1; i++) {
        let categoria = parseCategoria(i)

        if (categoria.includes('8+')) cant = 9
        else if (categoria.includes('4x') || categoria.includes('4-')) cant = 4
        else if (categoria.includes('2x') || categoria.includes('2-')) cant = 2
        else cant = 1

        text = text + '{"categoria": ' + categoria + ',\n"carriles": ' + parseCancha(i, cant) + "},\n"
    }
    text = text.slice(0, -2) + "\n]\n}"

    return text
}

function processFile(titulo, fecha = 00, sede = '') {
    filex = getFile()
    
    // filex = Papa.parse(filex, [])
    // filex = filex.data
    filex = filex[0].data

    columnas = hallarColumn(filex)
    filas = hallarFila(filex, columnas.num)

    filex = parseJson(titulo, fecha, sede)
    
    guardar(filex)
}

module.exports = { processFile }