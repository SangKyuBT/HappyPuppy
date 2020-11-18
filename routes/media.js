let express = require('express');
let router = express.Router();
const {videoUpload, mediaUpload} = require('../modules/Multer');
const {service} = require('../service/Media');
const createdToken = require('../modules/CreateToken');

//구독
router.get('/scripting/:email', (req, res) => {
    if(!!req.session.tokens){
        const my_email = createdToken.verifyToken(req.session.tokens).email;
        service.scripting(req.params.email, my_email, (err) => {
            if(err){
                res.status(200).json({code:0, message:'failed'});
                return;
            }
            res.status(200).json({code:1, message:'success'});
        })
    }else{
        res.status(200).json({code:0, message: 'not login'});
    }
})



//미디어 업로드
router.post('/upload_media', (req, res) => {
    if(!!req.session.tokens){
        mediaUpload(req, res, (err) => {
            if(err){
                console.log(err);
                res.status(200).json({code:0, message:'failed'}); 
                return
            }
            console.log('media s3 upload success');
            const email = createdToken.verifyToken(req.session.tokens).email;
            service.mediaUpload(req.body.form, req.files, email, (err) => {
                if(err){
                    console.log(err);
                    res.status(200).json({code:0, message:'failed'});
                }else{
                    res.status(200).json({code:1, message:'success'});
                }
            })
        })
    }else{
        console.log('not login');
        res.status(200).json({code:2, message:'not login'})
    }
})

router.get('/get_channel/:email', (req, res) => {
    let my_channel = false;
    var session_email = null;
    if(!!req.session.tokens){
        try{
            session_email = createdToken.verifyToken(req.session.tokens).email;
            my_channel = req.params.email === session_email ? true : false;
        }catch{
            console.log('session token is done')
        }
    }
    service.getChannel(req.params.email, session_email, (err, check, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return;
        }
        if(!check){
            res.status(200).json({code:2, message:'failed'});
            return;
        }
        res.status(200).json({code:1, message:'success', 
        iam:my_channel, result:result});
    })
})



router.post('/insert_video', (req, res) => {
    if(!!req.session.tokens){
        videoUpload(req, res, (err) => {
            if(err){
                console.log(err);
                res.status(200).send({message:0});
                return;
            }
            email = createdToken.verifyToken(req.session.tokens).email;
            service.insert(req.body.form, req.files, email, (err) => {
                if(err){
                    console.log(err);
                    res.status(200).send({message:0});
                    return
                }
                res.status(200).send({message : 1});
            })
        })
    }else{
        res.status(200).send({message:0});
    }
})

//비디오 스트리밍
/**1. service에서 받아온 stream을 res에 연결 */
router.get('/get_video/:name/:key', (req, res) =>{
    if(!req.headers.range){
        console.log('error is range not defind');
        res.status(200).send('error is incorrect connection');
        return;
    }
    service.getVideo(req.params.key, req.headers.range, (err, stream, header) => {
        if(err){
            console.log(err);
            res.status(200).send('failed');
            return
        }
        /**1 */
        res.writeHead(206, header);
        stream.pipe(res);

    })
})

module.exports = router;