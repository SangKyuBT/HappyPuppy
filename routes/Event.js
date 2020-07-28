var express = require('express');
var router = express.Router();
// var mysql = require('mysql'); //mysql
var multer = require('multer'); //파일데이터를 파라미터로 받아줌
var imgConvert = require('base64-img'); // 받아온 이미지를 문자열 버퍼로 변환
var sharp = require('sharp'); //이미지 크기 감소시키는 모듈
var fs = require('fs'); //변환된 버퍼를 확인하거나 파일 삭제 등등...

var ftmImg = function(data){
    var data_sharp = data + 'sharp';
    sharp(data).resize({fil:'fill',width:200, height:300}).toFile(data_sharp, (err, info) => {
        // if (err) return 0;
        // else return data_sharp;
        if(err) data_sharp = 0;
        
    })
    return data_sharp;
};


router.post ('/insert', multer({ dest: 'public/images/EventImages/'}).single('poster_path'), function(req, res, next){
    var sharp_fp = ftmImg(req.file.path);
    console.log(sharp_fp);
    if(sharp_fp === 0) res.send("이벤트 등록에 실패하였습니다.");
    else {
        let params = req.body;
        var event = {
            'ev_name' : params.name,
            'ev_url' : params.url,
            'ev_start_date' : params.start_date,
            'ev_end_date' : params.end_date,
            'ev_poster_path' : sharp_fp.split("EventImages\\")[1]
        };
        console.log(event);
        connection.query('insert into events set ?', event, function(err, result){
            if(err){
                console.log(err);
                throw err;
            }
            fs.unlinkSync(req.file.path);
            res.status(200).send('success');
            })
    }
    // res.status(200).send('success');
})

router.post('/ftm-img',  multer({ dest: 'public/images/EventImages/'}).single('poster_img'), function(req, res, next){
    console.log(req.file)
    // let sharp_fp = req.file.path + 'sharp'
    // sharp(req.file.path).resize({fil:'fill',width:400, height:600}).toFile(sharp_fp, (err, info) => {
    //         if (err) return next(err)
    //         imgConvert.base64(sharp_fp, (err, imgData) => {
    //             if(err) return next(err)
    //             fs.unlinkSync(req.file.path)
    //             fs.unlinkSync(sharp_fp)
    //             res.send(imgData.toString())
    //         })
        
    // })
    imgConvert.base64(req.file.path, (err, imgData) => {
        if(err) return next(err)
        fs.unlinkSync(req.file.path)
        res.send(imgData.toString())
    })
})

// router.get ('get-evnt', function(req, res, next){
//     console.log(req.params);
//     res.send('sc');
// })

module.exports = router;