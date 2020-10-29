const express = require('express')
const router = express.Router()
const pool = require('../database')
const path = require('path')

const JWT = require('jsonwebtoken')


//-------------ROUTES-------------------
router.get('/', function (req, res, next) {
    res.sendFile(path.resolve('index.html'))
});


//----------------API---------------------------
let json = {}

router.get('/api/login/:usu/:pass', async (req, res, next) => {
    let all = await pool.query(`select persona.id,persona.tipo,persona.nombre || ' ' || persona.apellido as "nombre" 
                                from persona,cuenta 
                                where persona.id = cuenta.id_persona and usu = '${req.params.usu}' and pass=MD5('${req.params.pass}')`);
    json = all.rows
    console.log(json)
    if (json.length > 0) {
        
        JWT.sign({json},'my_secret_key',{
            expiresIn:3600
        },(error,token)=>{
            if (error) {
                throw error;
            }
            res.json({token})
        })
        // res.json(json[0])
    }else{
        
    // console.log(json)
    res.json(all.rows)
    }
})
router.get('/api/consultarID/:ci', async (req, res, next) => {
    let all = await pool.query(`select id from persona where ci='${req.params.ci}'`);
    json = all.rows
    console.log(all.rows[0].id)
    
    res.json(all.rows)
})
router.get('/api/datosCertificado/:id', async (req, res, next) => {
    let all = await pool.query(`select de.id, pe.nombre || ' ' || pe.apellido as nombre, de.semestre,de.gestion,de.mes,de.dia,de.nro_certificado,ce.titulo,ce.subtitulo
                                from detalle_certificado de join persona pe
                                    on(de.id_persona=pe.id)
                                    join certificado ce
                                    on(de.id_certificado=ce.id)
                                where de.id=${req.params.id}`);
    json = all.rows
    // console.log(all.rows[0].id)
    
    res.json(json)
})
router.get('/api/verificarPersona/:ci', async (req, res, next) => {
    let all = await pool.query(`select * from persona where ci='${req.params.ci}'`);
    json = all.rows
    // console.log(all.rows[0].id)
    res.json(json)
})
router.get('/api/traerCertificados/:id_persona', async (req, res, next) => {
    let all = await pool.query(`
    select de.id,ce.titulo,ce.subtitulo,de.gestion,de.semestre
    from detalle_certificado de, certificado ce 
    where id_persona=${req.params.id_persona} and de.id_certificado=ce.id`);
    json = all.rows
    // console.log(all.rows[0].id)
    res.json(json)
})
router.get('/api/traerGestiones/:id_persona', async (req, res, next) => {
    let all = await pool.query(`
    select de.gestion
        from detalle_certificado de, certificado ce 
        where id_persona=${req.params.id_persona} and de.id_certificado=ce.id group by de.gestion`);
    json = all.rows
    // console.log(all.rows[0].id)
    res.json(json)
})

router.post('/api/insertarDatos', async (req, res, next) => {
    let body=req.body
    try {
        let all = await pool.query(`insert into persona(nombre,apellido,ci,area,tipo)values('${body.nombre}','${body.apellido}','${body.ci}','${body.area}','${body.tipo}')`);
        json = all.rows
        nuevoNombre=body.img;
        // console.log(json)
        res.json(all.rows)
        
    } catch (error) {
        console.log(error.detail)
    }
})
router.post('/api/insertarCertificado', async (req, res, next) => {
    let body=req.body
    try {
        let all = await pool.query(`insert into detalle_certificado(id_persona,id_certificado,semestre,gestion,mes,dia,nro_certificado)values(${body.id_persona},${body.id_certificado},'${body.semestre}','${body.gestion}','${body.mes}','${body.dia}','${body.nro_certificado}')`);
        json = all.rows
        nuevoNombre=body.img;
        // console.log(json)
        res.json(all.rows)
        
    } catch (error) {
        console.log(error.detail)
    }
})

function ensureToken(req,res,next){
    const bearerHeader = req.headers['Authorization']; 
    if (typeof bearerHeader !== undefined) {
        const bearer = bearerHeader.split(" ");
        const bearerToken= bearer[1];
        req.token=bearerToken
        next()
    } else{
        res.status(403).send({message:'error'})
    } 
}



module.exports = router