require('dotenv').config()
console.log('OJO esta el dot.env')

const express = require('express')
const router = express.Router()
const path = require('path')

const parser = require('../public/scripts/parser.js')
const jsonUpdater = require('../public/scripts/jsonUpdater.js')
const unParser = require('../public/scripts/unParser.js')

var grilla = require('../public/grilla.json')

//MULTER: file handeler
const multer = require('multer')
const fs = require('fs')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public'))
  },
  filename: function (req, file, cb) {
    cb(null, 'grilla.xlsx')
  },
  encoding: 'utf-8'
})

const upload = multer({ storage: storage })

// routers
//GET METHODS
router.get('/', (req, res, next) => {
  res.redirect('/terminal')
})

router.get('/agregar/:error', (req, res, next) => {
  res.render('upload.html', { alert: req.params.error })
})

router.get('/agregar', (req, res, next) => {
  res.render('upload.html', { alert: undefined })
})

router.get('/formato', (req, res, next) => {
  res.render('formato.html')
})

router.get('/terminal', (req, res) => {
  const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }

  const authorization = req.headers.authorization

  if (!authorization) {
    return reject()
  }

  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

  if (!(username === 'admin' && password === process.env.PASSWORD)) {
    return reject()
  }

  res.render('terminal.html', { titulo: grilla.titulo, actualServerTime: Date.now() })
})

//ERROR
router.get('/404', (req, res, next) => {
  res.render('404.html')
})

// Visualizadores
router.get('/clima', (req, res, next) => {
  res.render('./visualizadores/Clima.html')
})

router.get('/compitiendo', (req, res, next) => {
  res.render('./visualizadores/Compitiendo.html')
})

router.get('/tripulacion', (req, res, next) => {
  res.render('./visualizadores/Tripulación.html')
})

router.get('/resultados', (req, res, next) => {
  res.render('./visualizadores/Resultados.html')
})

router.get('/visualizador', (req, res, next) => {
  res.redirect('/visualizador/0')
})

router.get('/visualizador/:start', (req, res, next) => {
  res.render('./visualizadores/visualizador.html', { vista: jsonUpdater.getVista(), myLastRefresh: req.params.start })
})

//POST METHODS
router.post('/setOutput', function (req, res, next) {
  jsonUpdater.output(req.body.output, req.body.vista)
})

router.post('/processFile', upload.single('csvfile'), function (req, res, next) {
  const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }

  const authorization = req.headers.authorization

  if (!authorization) {
    return reject()
  }

  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

  if (!(username === 'admin' && password === process.env.PASSWORD)) {
    return reject()
  }
  ///////////////

  try {
    parser.processFile(req.body.titulo, req.body.fecha, req.body.sede)
  } catch (e) {
    console.log(e)
    res.redirect('/agregar/errFormat')
  }
  res.redirect('/agregar/exito')
})

router.post('/Time', function (req, res, next) {
  jsonUpdater.tiempo(req.body.regataAct, req.body.canchaAct,
    req.body.posAct, req.body.timeAct, req.body.RPMact, req.body.ultActualizacion)
})

router.post('/Chrono', function (req, res, next) {
  jsonUpdater.chrono(req.body.valueChrono)
})

router.post('/refreshVisualizador', function (req, res, next) {
  res.redirect('/visualizador/' + req.body.myLastRefresh)
})

router.get('/downloadCSV', function (req, res, next) {
  res.download("./src/public/grilla.xlsx", "grilla.xlsx")
})

router.post('/crearCSV', function (req, res, next) {
  unParser.processFile()
})

router.post('/modificarEncabezado', function (req, res, next) {
  jsonUpdater.modificarEncabezado(req.body.formTitulo, req.body.formSede,
    req.body.formFecha)
  res.redirect('/')
})

router.post('/modificarPrueba', function (req, res, next) {
  let delegaciones = [req.body.delegacion1, req.body.delegacion2,
  req.body.delegacion3, req.body.delegacion4, req.body.delegacion5, req.body.delegacion6]
  let tripulaciones = [req.body.tripulacion1, req.body.tripulacion2,
  req.body.tripulacion3, req.body.tripulacion4, req.body.tripulacion5, req.body.tripulacion6]

  jsonUpdater.modificarPrueba(req.body.formOutput, req.body.formBote,
    req.body.formCategoria, req.body.formSexo, delegaciones, tripulaciones)
})

////////////////////////

module.exports = router