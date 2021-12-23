const express = require('express')
const app = express()
const path = require('path')

// settings
app.set('port', 3000)
app.engine('html', require('ejs').renderFile)
app.set('views', path.join(__dirname,'views'))
app.set('view engine', 'ejs')

// middlewares
app.use(express.urlencoded({extended: true})); 
app.use(express.json());

//routes
app.use(require('./routes/router'))
app.use(express.static(path.join(__dirname, 'public')))

// ERRORS
app.use(function (req,res,next){
	res.status(404).redirect('/404');
});


// statics files
app.locals.grilla = require('./public/grilla.json')
// listening the server
app.listen(app.get('port'), () => {
    console.log('Ejecutando en http://localhost:' + app.get('port') + '/')
})
