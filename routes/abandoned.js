let express = require('express');
let router = express.Router();
const service = require('../service/Abandoned');
const {abUpload} = require('../modules/Multer'); //s3 업로드 multer
const getEmail = require('../modules/getEmail');

//실종 반려견 리스트를 전송
router.get('/', (req, res) => {
    service.select(null, null, (err, result) => {
        if(err){
            console.error(err);
            res.status(200).send({message: 0});
            return
        }
        res.status(200).json({message: result.length > 0 ? 1 : 0, result : result})
    })

})

//받은 지역의 이름으로 일치하는 리스트를 전송
router.get('/place_search/:place', (req, res) => {
    if(!req.params.place){
        res.status(200).send({message : 0});
        return
    }
    service.select(req.params.place, null, (err, result) => {
        if(err){
            console.error(err);
            res.status(200).send({message: 0});
            return
        }
        const rs = result.length > 0 ? {message: 1, result : result} : {message: 0, result : result} 
        res.status(200).json(rs)
    })
})

//받은 번호의 정보를 리턴
router.get('/target/:num', (req, res) => {
    if(!req.params.num){
        res.status(200).send({message : 0});
        return
    }
    service.select(null, req.params.num, (err, result) => {
        if(err){
            console.error(err);
            res.status(200).send({message: 0});
            return
        }
        const rs = result.length > 0 ? {message: 1, result : result} : {message: 0, result : result} 
        res.status(200).json(rs)
    })
})
//반려견 포스터 insert
router.post('/insert_poster', (req, res) => {
    abUpload(req, res, (err) => {
        if(err){
            res.status(200).json({code : 0});
            return;
        }
        const email = getEmail(req.session);
        service.insert(req.body.form, req.files, email, (err) => {
            if(err){
                res.status(200).json({code : 0});
                return;
            }
            res.status(200).json({code : 1});
        })
    })
})
router.post('/update_poster', (req, res) => {
    abUpload(req, res, (err) => {
        if(err){
            res.status(200).json({code : 0});
            return;
        }
        service.update(req.body.form, req.files, (err) => {
            if(err){
                res.status(200).json({code : 0});
                return;
            }
            res.status(200).json({code:1});
        })
    })
})
router.post('/delete_poster', (req, res) => {
    const email = getEmail(req.session);
    service.delete(req.body, email, (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code : 0});
            return;
        }
        res.status(200).json({code : 1});
    })
})
module.exports = router;
