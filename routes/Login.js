let express = require('express');
let router = express.Router();
const createToken = require('../modules/CreateToken');
const {loginService} = require('../service/Login');

router.post('/', function(req, res){
    loginService(req.body, (err, result) => {
        if(err || !result){
            console.log(err);
            res.status(200).send({message : 0});
            return;
        }
        const token = createToken.signToken(req.body.email);
        // req.session.cookie.expires = 3600000;
        req.session.cookie.expires = new Date(Date.now() + haur);
        req.session.cookie.maxAge = haur; 
        req.session.tokens = token;
        req.session.isLogined = 1;
        req.session.save(function(){
            console.log(`${req.body.email} login success`);
            res.status(200).send({message : 1})
        })
    })
})


module.exports = router;
