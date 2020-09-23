let express = require('express');
let router = express.Router();


//세로 고침시에 헤더의 상태를 유지합니다.
router.get('/', function(req, res) {
    res.status(200).send({
        msg: "success",
        login_code: req.session.isLogined
    });
});

//로그아웃시에 세션, DB삭제
router.get('/logout', function(req, res){
    
    //db에서 해당 세션을 삭제
    connection.query('delete from sessions where session_id=?', req.sessionID, function(err, result){
        if(err){
            console.log(err);
            throw err;
        }
        
        //세션 재발급
        // req.session.regenerate(function(err) {
        //     if(err){
        //         console.log("재발급에서 에러 발생");
        //         console.log(err);
        //     }
        //     res.status(200).send("success");
        // })
        req.session.reload(function(){
            if(err){
                console.log("재발급에서 에러 발생");
                console.log(err);
            }
            res.status(200).send("success");
        })
    })
})



module.exports = router;
