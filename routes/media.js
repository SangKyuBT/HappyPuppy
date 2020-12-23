/*
 미디어 라우트
 구독 관련, 비디오 재생, 업로드, 수정, 삭제
*/
let express = require('express');
let router = express.Router();
const {service} = require('../service/Media');
const {mediaUpload} = require('../modules/Multer'); //미디어 S3업로드 
const getEmail = require('../modules/getEmail'); //로그인 루트에 따른 이메일 추출

/*
 비디오 스트리밍 요청
 @param range(string) : 요청 영상 범위
 @param key(string) : 요쳥 영상 이름
 @param name(string) : 요청 영상 버킷
*/
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
        
        res.writeHead(206, header);
        stream.pipe(res);
        stream.on('end', () => {
            console.log('end streaming')
            res.end();
        });
        stream.on('error', (err) => {
            !(err.statusCode !== 206) || console.error(err);
            stream.end();
            res.end();
        })
    })
})

/*
 구독 요청
 @param email(string) : 대상 이메일
*/
router.get('/scripting/:email', (req, res) => {
    const my_email = getEmail(req.session);
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

/*
 구독 취소 요청
 @param email(string) : 대상 이메일
*/
router.get('/unscripting/:email', (req, res) => {
    const my_email = getEmail(req.session);
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

/*
 미디어 업로드 요청
 @param form(obj) : 업로드 미디어 정보 문자열 객체
 @param files(obj) : 업로드된 이미지, 비디어 정보 객체
*/
router.post('/upload_media', (req, res) => {
    mediaUpload(req, res, (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'}); 
            return
        }
        const email = getEmail(req.session);
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

/*
 미디어 수정 요청
 @param form(obj) : 업로드 미디어 정보 문자열 객체
 @param files(obj) : 업로드된 이미지, 비디어 정보 객체
 @param num(number) : 수정 대상 번호
*/
router.post('/update_media', (req, res) => {
    mediaUpload(req, res, (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'}); 
            return
        }
        const email = getEmail(req.session);
        service.mediaUpdate(req.body.form, req.files, req.body.num, email, (err) => {
            res.status(200).json({code:!err ? 1 : 0});
        })
    })
})


/*
 채널 정보 요청
 @param email(string) : 요청 대상 이메일
*/
router.get('/get_channel/:email', (req, res) => {
    if(req.params.email){
        const session_email = getEmail(req.session);
        const my_channel = req.params.email === session_email;
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
    }else{
        res.status(200).json({code:0, message:'failed'});
    }
})

/*
 미디어에 대한 구독 및 간략한 댓글 정보 요청
 @param num(number) : 미디어 번호
 @param email(string) : 미디어 이메일
*/
router.get('/m_count/:num/:email', (req, res) => {
    const num = req.params.num;
    if(!num){
        res.status(200).json({code:0, message:'media num is null'});
        return
    }
    const session_email = getEmail(req.session);
    const my_channel = req.params.email === session_email;
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

/*
 미디어에 대한 댓글 정보 요청
 @param num(number) : 대상 미디어 번호
*/
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

/*
 댓글 쓰기 요청
 @param body(obj) : 댓글 정보 객체
*/
router.post('/input_comment',(req, res) => {
    const email = getEmail(req.session);
    service.insertComment(req.body, email, (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return;
        }
        res.status(200).json({code:1, message:'success'});
    });
})

/*
 영상 좋아요 or 싫어요 요청
 @param num(number) : 대상 미디어 번호
 @param think(number) : 0이면 싫어요 1이면 좋아요
*/
router.get('/my_media_think/:num/:think',(req, res) => {
    const email = getEmail(req.session);
    service.setThink(true, email, req.params, (err, code) =>{
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return
        }
        res.status(200).json({code:code, message:'success'});
    })
})

/*
 댓글 좋아요 or 싫어요 요청
 @param num(number) : 대상 미디어 번호
 @param think(number) : 0이면 싫어요 1이면 좋아요
*/
router.get('/my_comment_think/:num/:think',(req, res) => {
    const email = getEmail(req.session);
    service.setThink(false, email, req.params, (err, code) =>{
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'});
            return
        }
        res.status(200).json({code:code, message:'success'});
    })
})

/*
 미디어 조회수 증가 요청
 @param num(number) : 대상 미디어 번호
*/
router.post('/media_counting', (req, res) => {
    const email = getEmail(req.session);
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

/*
 회원 구독정보 요청
*/
router.get('/my_script', (req, res) => {
    const email = getEmail(req.session);
    service.getMyscript(email, (err, result) => {
        res.status(200).json({code:!err ? 1 : 0, result: result});
    })
})

/*
 미디어 홈 정보 요청
 @param list(array) : 구독 정보 배열
*/
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

/*
 인기 미디어 요청
*/
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

/*
 구독자들 영상 정보 요청
 @param list(array) : 구독 정보 배열
*/
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

/*
 좋아요를 표시한 영상 요청
*/
router.get('/get_good_mymedias', (req, res) => {
    const email = getEmail(req.session);
    service.getMyGoodMedias(email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'})
            return;
        }
        res.status(200).json({code:1, message:'success', result:result});
    })
})

/*
 키워드 검색 요청
 @param keyword(string) : 검색 키워드
*/
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

/*
 미디어 삭제 요청
 @param num(string) : 대상 미디어 번호
*/
router.post('/drop_media', (req, res) => {
    const email = getEmail(req.session);
    service.deleteMeida(req.body.num, email, (err) => {
        res.status(200).json({code: !err ? 1 : 0});
    })
})

/*
 댓글 삭제 요청
 @param num(number) : 대상 댓글 번호
*/
router.post('/drop_comments', (req, res) => {
    const email = getEmail(req.session);
    service.deleteComments(req.body.num, email, (err) => {
        res.status(200).json({code: !err ? 1 : 0});
    })
})
module.exports = router;