let express = require('express');
let router = express.Router();
const {loginOut} = require('../service/Login');
const createdToken = require('../modules/CreateToken');

//세로 고침시에 헤더 상태 유지.
router.get('/', function(req, res) {
    res.status(200).json({code:1, message:'success', login_code:req.session.isLogined});
});
router.get('/my_email', (req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    res.status(200).json({code:1, email : email});
})
router.get('/logout', function(req, res){
    loginOut(req.sessionID, (err) => {
        if(err){
            console.log(err);
            res.status(200).send('failed');
            return
        }
        res.status(200).send("success");
    })
})

module.exports = router;
