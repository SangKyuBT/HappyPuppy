let express = require('express');
let router = express.Router();
const {loginOut} = require('../service/Login');


//세로 고침시에 헤더 상태 유지.
router.get('/', function(req, res) {
    // res.status(200).json({
    //     msg: "success",
    //     login_code: req.session.isLogined
    // });
    res.status(200).json({code:1, message:'success', login_code:req.session.isLogined});
    // if(!!req.session.tokens){
    // }else{
    //     res.status(200).json({code:0, message:'not login'});
    // }
});

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

//세션 재발급
// req.session.regenerate(function(err) {
//     if(err){
//         console.log("재발급에서 에러 발생");
//         console.log(err);
//     }
//     res.status(200).send("success");
// })
// req.session.reload(function(error){
//     if(error){
//         console.log("재발급에서 에러 발생");
//         console.log(err);
//     }
//     res.status(200).send("success");
// })


module.exports = router;
