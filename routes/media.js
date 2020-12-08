let express = require('express');
let router = express.Router();
const {videoUpload, mediaUpload} = require('../modules/Multer');
const {service} = require('../service/Media');
const createdToken = require('../modules/CreateToken');

//구독
router.get('/scripting/:email', (req, res) => {
    const my_email = createdToken.verifyToken(req.session.tokens).email;
    if(req.params.email === my_email){
        res.status(200).json({code:0, message:'failed'});
        return
    }
    service.scripting(req.params.email, my_email, (err) => {
        if(err){
            res.status(200).json({code:0, message:'failed'});
            return;
        }
        res.status(200).json({code:1, message:'success'});
    })
})
router.get('/unscripting/:email', (req, res) => {
    const my_email = createdToken.verifyToken(req.session.tokens).email;
    if(req.params.email === my_email){
        res.status(200).json({code:0, message:'failed'});
        return
    }
    service.unscripting(req.params.email, my_email, (err) => {
        if(err){
            res.status(200).json({code:0, message:'failed'});
            return;
        }
        res.status(200).json({code:1, message:'success'});
    })
})
//미디어 업로드
router.post('/upload_media', (req, res) => {
    mediaUpload(req, res, (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'}); 
            return
        }
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
})
router.post('/update_media', (req, res) => {
    mediaUpload(req, res, (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'}); 
            return
        }
        const email = createdToken.verifyToken(req.session.tokens).email;
        service.mediaUpdate(req.body.form, req.files, req.body.num, email, (err) => {
            res.status(200).json({code:!err ? 1 : 0});
        })
    })
})
//채널 정보
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
//댓글과 구독 정보
router.get('/m_count/:num/:email', (req, res) => {
    const num = req.params.num;
    if(!num){
        res.status(200).json({code:0, message:'media num is null'});
        return
    }
    let my_channel = false; session_email = null;
    if(!!req.session.tokens){
        try{
            session_email = createdToken.verifyToken(req.session.tokens).email;
            my_channel = req.params.email === session_email ? true : false;
        }catch{
            console.log('session token is done')
        }
    }
    service.getMCCount(num, req.params.email, session_email, (err, comments, my_info) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return
        }
        res.status(200).json({code:1, message:'success', 
        result:comments, iam:my_channel, my_info:my_info});
    })
})
//댓글 정보
router.get('/get_comments/:num', (req, res) => {
    service.getComments(req.params.num, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0,message:'failed'});
            return;
        }
        res.status(200).json({code:1, message:'success', result:result});
    })
})
//댓글 insert
router.post('/input_comment',(req, res) => {
    console.log(req.body);
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.insertComment(req.body, email, (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return;
        }
        res.status(200).json({code:1, message:'success'});
    });
})
//영상에 좋아요 or 싫어요
router.get('/my_media_think/:num/:think',(req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.setThink(true, email, req.params, (err, code) =>{
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return
        }
        res.status(200).json({code:code, message:'success'});
    })
})
//댓글에 좋아요 or 싫어요
router.get('/my_comment_think/:num/:think',(req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.setThink(false, email, req.params, (err, code) =>{
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return
        }
        res.status(200).json({code:code, message:'success'});
    })
})
//조회 수 증가
router.post('/media_counting', (req, res) => {
    let email;
    try{
        email = createdToken.verifyToken(req.session.tokens).email;
    }catch{
        email = null;
    }
    const ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    service.mediaCounting(req.body.num, ip, email, (err, code) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return;
        }
        res.status(200).json({code:code, message:'success'});
    })

})
router.get('/my_script', (req, res) => {
    let email;
    try{
        email = createdToken.verifyToken(req.session.tokens).email;
    }catch{
        email = null;
    }
    service.getMyscript(email, (err, result) => {
        res.status(200).json({code:!err ? 1 : 0, result: result});
    })
})
//홈 미디어 요청
router.post('/home_medias', (req, res) => {
    service.getHomeMedias(req.body.list, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return;
        }
        res.status(200).json({code:1, message:'success', result: result});
    })
})
//인기 미디어 요청
router.get('/pop_medias', (req, res) => {
    service.getPopMedias((err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return;
        }
        res.status(200).json({code:1, message:'success', result: result});
    })
})
//구독자들의 영상 요청
router.post('/get_script_medias', (req, res) => {
    const list = req.body.list;
    if(!list[0]){
        res.status(200).json({code:1, message:'not list', result:0});
        return;
    }
    service.getScriptMedias(list, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'})
            return;
        }
        res.status(200).json({code:1, message:'success', result:result});
    })
})
//좋아요를 표시한 영상 요청
router.get('/get_good_mymedias', (req, res) => {
    console.log('inin')
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.getMyGoodMedias(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'})
            return;
        }
        res.status(200).json({code:1, message:'success', result:result});
    })
})

//미디어 검색
router.get('/search_keyword/:keyword', (req, res) => {
    const keyword = req.params.keyword;
    if(!!keyword && !!keyword.replace(/\s/g, '').length){
        service.searchKeyword(keyword, (err, result) => {
            if(err){
                console.log(err);
                res.status(200).json({code:0 , message:'falied'});
                return;
            }
            res.status(200).json({code:1, message:'success', result:result});
        })
    }else{
        res.status(200).json({code:0, message:'not find keyword'});
    }
})

//미디어 삭제
router.post('/drop_media', (req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.deleteMeida(req.body.num, email, (err) => {
        res.status(200).json({code: !err ? 1 : 0});
    })
})

router.post('/drop_comments', (req, res) => {
    const email = createdToken.verifyToken(req.session.tokens).email;
    service.deleteComments(req.body.num, email, (err) => {
        res.status(200).json({code: !err ? 1 : 0});
    })
})
module.exports = router;