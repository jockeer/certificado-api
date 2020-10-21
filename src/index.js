const express = require('express')
const path = require('path')
const morgan = require('morgan')

const multer = require('multer')

//initializations
const app = express()
require('./database') //conexion a la bd 

//settings
app.set('port', process.env.PORT || 4000)

//middlewares
app.use(express.json())
app.use(morgan('dev'))
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });


//   app.use(multer({
//     dest:'./imagenes'
// }));


//routes
app.use('/', require('./routes/routes'))
app.use('/img', express.static('./img'))

//starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'))
})