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
    let all = await pool.query(`select persona.id,persona.nombre || ' ' || persona.apellido as "nombre" 
                                from persona,usuario 
                                where persona.id = usuario.id_persona and usu = '${req.params.usu}' and pass=MD5('${req.params.pass}')`);
    json = all.rows
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