let express = require('express');
let router = express.Router();
const {loginOut} = require('../service/Login');

//세로 고침시에 헤더 상태 유지.
router.get('/', function(req, res) {
    console.log(req.session.isLogined);
    res.status(200).json({code:1, message:'success', login_code:req.session.isLogined});
});
router.get('/my_email', (req, res) => {
    const email = getEmail(req.session)
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
