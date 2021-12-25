const { getDiffieHellman } = require('crypto');
const fs = require('fs')
const path = require('path')
const Papa = require("papaparse");

var filex = 'a'
var columnas, filas = []

function toUpper(word) {
    word = word.toLowerCase()
    var splited = word.split(' ')
    word = ''

    for (i of splited) {
        word = word + i.charAt(0).toUpperCase() + i.slice(1) + ' '
    }

    return word
}

function getFile() {
    var data = fs.readFileSync(path.join(__dirname, '../grilla.csv'), { encoding: 'utf8' })
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
                    if (filex[i][j].toLowerCase().includes(strToSearch)) {
                        return j
                    }
                }
            }
        }
    }

    // alert('"' + str + '" no encontrado en el .csv. Se recomienda verificar formato de archivo')
    return 99
}

function hallarFila(filex, colNro) {
    var array = []
    for (x in filex) {

        if (filex[x][colNro] > 0) {
            array.push(x)
        }
    }

    return array
}

function hallarColumn(filex) {
    //                     cat: [dis bot cat gen]
    var columnas = { num: 0, cat: [0, 1, 2, 3], can: [0, 1, 2, 3, 4, 5] }

    columnas.num = processColumn(filex, "1")

    columnas.cat[0] = processColumn(filex, "000", columnas.num + 1)
    columnas.cat[1] = processColumn(filex, "1x", columnas.cat[0] + 1)
    columnas.cat[2] = processColumn(filex, "s", columnas.cat[0] + 1)
    columnas.cat[3] = processColumn(filex, "m", columnas.cat[2] + 1)

    columnas.can[0] = processColumn(filex, "cancha 1|carril 1", columnas.cat[3] + 1)
    columnas.can[1] = processColumn(filex, "cancha 2|carril 2", columnas.cat[3] + 1)
    columnas.can[2] = processColumn(filex, "cancha 3|carril 3", columnas.cat[3] + 1)
    columnas.can[3] = processColumn(filex, "cancha 4|carril 4", columnas.cat[3] + 1)
    columnas.can[4] = processColumn(filex, "cancha 5|carril 5", columnas.cat[3] + 1)
    columnas.can[5] = processColumn(filex, "cancha 6|carril 6", columnas.cat[3] + 1)

    return columnas
}

function parseCategoria(nro) {
    var bote = filex[filas[nro]][columnas.cat[1]].toLowerCase()
    if (bote.includes('8+')) bote = '8+' //'Ocho'
    else if (bote.includes('4x')) bote = '4x' //'Cuádruple'
    else if (bote.includes('4-')) bote = '4-' //'Cuatro-Sin'
    else if (bote.includes('2x')) bote = '2x' //'Doble'
    else if (bote.includes('2-')) bote = '2-' //'Dos-sin'
    else if (bote.includes('1x+')) bote = '1x+' //'Par-de-Paseo'
    else if (bote.includes('1x')) bote = '1x' //'Single'

    var cat = filex[filas[nro]][columnas.cat[2]].toLowerCase()
    if (cat.startsWith('ma')) cat = 'Máster'
    else if (cat.startsWith('me') && cat.includes('a')) cat = 'Menor A'
    else if (cat.startsWith('me') && cat.includes('b')) cat = 'Menor B'
    else if (cat.startsWith('me') && !(cat.includes('b') || cat.includes('a'))) cat = 'Menor'
    else if (cat.startsWith('j')) cat = 'Juvenil'
    else if (cat.startsWith('s')) cat = 'Senior'
    else if (cat.startsWith('i')) cat = 'Infantil'
    else if (cat.startsWith('n')) cat = 'Novicio'
    else if (cat.startsWith('a')) cat = 'Abierto'

    var mf = filex[filas[nro]][columnas.cat[3]].toLowerCase()
    if (mf.startsWith('m')) mf = 'Mas'
    else if (mf.startsWith('f')) mf = 'Fem'

    nro = Number(nro) + 1

    let categoria = '{\n"nro": "' + nro + '",\n"bote": "' + bote + '",\n"cat": "' + cat + '",\n"mf": "' + mf + '"\n}'

    return categoria
}

function parseCancha(nro, cant) {
    let text = "["

    let reg = Number(filas[nro])

    for (var can of columnas.can) {
        var nombres = []
        for (let i = reg + 1; i <= reg + cant; i++) {
            let nombre = filex[i][can]

            if (nombre != '') {
                nombres.push('"' + toUpper(nombre) + '"')
            }
            
        }
        if (nombres.length == 0) nombres = ['']

        if (filex[reg][can] != '') {
            text = text + '{\n"club": "' + filex[reg][can] + '",\n"nombres": [' + nombres + '],\n"tiempo": "0:00.00",\n"posicion": "0",\n"rpm": "00",\n"puntaje": 0\n},\n'
        } else break
    }

    text = text.slice(0, -2)
    text = text + "]"

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

    filex = Papa.parse(filex, [])
    filex = filex.data

    columnas = hallarColumn(filex)

    filas = hallarFila(filex, columnas.num)

    filex = parseJson(titulo, fecha, sede)

    guardar(filex)
}

module.exports = { processFile }