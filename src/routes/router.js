require('dotenv').config()
console.log('OJO esta el dot.env')

const express = require('express')
const router = express.Router()
const path = require('path')

const parser = require('../public/scripts/parser.js')
const jsonUpdater = require('../public/scripts/jsonUpdater.js')
const jsonToCSV = require('../public/scripts/jsonToCSV.js')

var grilla = require('../public/grilla.json')

//MULTER: file handeler
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public'))
  },
  filename: function (req, file, cb) {
    cb(null, 'grilla.csv')
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

router.get('/descargar', (req, res, next) => {
  res.render('descargar.html')
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
  console.log(req.body.posAct)
  jsonUpdater.tiempo(req.body.regataAct, req.body.canchaAct,
    req.body.posAct, req.body.timeAct, req.body.RPMact, req.body.ultActualizacion)
})

router.post('/Chrono', function (req, res, next) {
  jsonUpdater.chrono(req.body.valueChrono)
})

router.post('/refreshVisualizador', function (req, res, next) {
  res.redirect('/visualizador/' + req.body.myLastRefresh)
})

router.post('/downloadCSV', function (req, res, next) {
  jsonToCSV.downloadCSV()
  res.redirect('/descargar')
})

////////////////////////

module.exports = router