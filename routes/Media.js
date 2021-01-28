/*
 미디어 라우트
 구독 관련, 비디오 재생, 업로드, 수정, 삭제
*/
import express from "express";
import service from "../service/MediaService";
import { mediaUpload } from "../modules/Multer"; //미디어 S3업로드 
import getEmail from "../modules/getEmail"; //로그인 루트에 따른 이메일 추출

const router = express.Router();

/*
 비디오 스트리밍 요청
 @param range(string) : 요청 영상 범위
 @param key(string) : 요쳥 영상 이름
 @param name(string) : 요청 영상 버킷
*/
router.get('/get_video/:name/:key', async (req, res) =>{
    if(!req.headers.range){
        console.log('error is range not defind');
        res.status(200).send('error is incorrect connection');
        return;
    }

    try{
        const {stream, header} = await service.getVideo(req.params.key, req.headers.range);
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
    }catch(err){
        console.log(err);
        res.status(200).send('failed');
    }
})

/*
 구독 요청
 @param email(string) : 대상 이메일
*/
router.get('/scripting/:email', async (req, res) => {
    const my_email = getEmail(req.session);
    if(req.params.email === my_email){
        res.status(200).json({code:0, message:'failed'});
        return
    }
    
    const result = await service.scripting(req.params.email, my_email);
    const rs_js = result ? {code:1, message:'success'} : {code:0, message:'failed'};
    res.status(200).json(rs_js);
})

/*
 구독 취소 요청
 @param email(string) : 대상 이메일
*/
router.get('/unscripting/:email', async (req, res) => {
    const my_email = getEmail(req.session);
    if(req.params.email === my_email){
        res.status(200).json({code:0, message:'failed'});
        return
    }
    
    const result = await service.unscripting(req.params.email, my_email);
    const rs_js = result ? {code:1, message:'success'} : {code:0, message:'failed'};
    res.status(200).json(rs_js);
})

/*
 미디어 업로드 요청
 @param form(obj) : 업로드 미디어 정보 문자열 객체
 @param files(obj) : 업로드된 이미지, 비디어 정보 객체
*/
router.post('/upload_media', async (req, res) => {
    mediaUpload(req, res, async (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'failed'}); 
            return
        }
        const email = getEmail(req.session);
        const result = await service.mediaUpload(req.body.form, req.files, email);
        const rs_js = result ? {code:1, message:'success'} : {code:0, message:'failed'};
        res.status(200).json(rs_js);
    })
})

/*
 미디어 수정 요청
 @param form(obj) : 업로드 미디어 정보 문자열 객체
 @param files(obj) : 업로드된 이미지, 비디어 정보 객체
 @param num(number) : 수정 대상 번호
*/
router.post('/update_media', async (req, res) => {
    mediaUpload(req, res, async (err) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0}); 
            return
        }
        const email = getEmail(req.session);
        const result = await service.mediaUpdate(req.body.form, req.files, req.body.num, email);
        res.status(200).json({code : result ? 1 : 0});
    })
})


/*
 채널 정보 요청
 @param email(string) : 요청 대상 이메일
*/
router.get('/get_channel/:email', async (req, res) => {
    if(req.params.email){
        const session_email = getEmail(req.session);
        const my_channel = req.params.email === session_email;
        const {check, result} = await service.getChannel(req.params.email, session_email);
        if(!check){
            res.status(200).json({code : 0, message : 'failed'});
        }else{
            res.status(200).json({code:1, message:'success', 
            iam:my_channel, result});
        }
    }else{
        res.status(200).json({code:0, message:'failed'});
    }
})

/*
 미디어에 대한 구독 및 간략한 댓글 정보 요청
 @param num(number) : 미디어 번호
 @param email(string) : 미디어 이메일
*/
router.get('/m_count/:num/:email', async (req, res) => {
    const num = req.params.num;
    if(!num){
        res.status(200).json({code:0, message:'media num is null'});
        return
    }
    const session_email = getEmail(req.session);
    const my_channel = req.params.email === session_email;
    const {err, comments, my_info} = await service.getMCCount(num, req.params.email, session_email);
    const rs_js = err ? {code:0, message:'failed'} : 
                {code:1, message:'success', result:comments, iam:my_channel, my_info:my_info};
    res.status(200).json(rs_js);
})

/*
 미디어에 대한 댓글 정보 요청
 @param num(number) : 대상 미디어 번호
*/
router.get('/get_comments/:num', async (req, res) => {
    const result = await service.getComments(req.params.num);
    const rs_js = !result ? {code:0,message:'failed'} : {code:1, message:'success', result};
    res.status(200).json(rs_js);
})

/*
 댓글 쓰기 요청
 @param body(obj) : 댓글 정보 객체
*/
router.post('/input_comment', async (req, res) => {
    const email = getEmail(req.session);
    const result = await service.insertComment(req.body, email);
    const rs_js = !result ? {code:0, message:'failed'} : {code:1, message:'success'};
    res.status(200).json(rs_js);
})

/*
 영상 좋아요 or 싫어요 요청
 @param num(number) : 대상 미디어 번호
 @param think(number) : 0이면 싫어요 1이면 좋아요
*/
router.get('/my_media_think/:num/:think', async (req, res) => {
    const email = getEmail(req.session);
    const {err, code} = await service.setThink(true, email, req.params);
    const rs_js = err ? {code:0, message:'failed'} : {code, message:'success'};
    res.status(200).json(rs_js);
})

/*
 댓글 좋아요 or 싫어요 요청
 @param num(number) : 대상 미디어 번호
 @param think(number) : 0이면 싫어요 1이면 좋아요
*/
router.get('/my_comment_think/:num/:think', async (req, res) => {
    const email = getEmail(req.session);
    const {err, code} = await service.setThink(false, email, req.params);
    const rs_js = err ? {code:0, message:'failed'} : {code, message:'success'};
    res.status(200).json(rs_js);
})

/*
 미디어 조회수 증가 요청
 @param num(number) : 대상 미디어 번호
*/
router.post('/media_counting', async (req, res) => {
    const email = getEmail(req.session);
    const ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    const {err, code} = await service.mediaCounting(req.body.num, ip, email);
    const rs_js = err ? {code:0, message:'failed'} : {code, message:'success'};
    res.status(200).json(rs_js);

})

/*
 회원 구독정보 요청
*/
router.get('/my_script', async (req, res) => {
    const email = getEmail(req.session);
    const result = await service.getMyscript(email);
    res.status(200).json({code : result ? 1 : 0, result});
})

/*
 미디어 홈 정보 요청
 @param list(array) : 구독 정보 배열
*/
router.post('/home_medias', async (req, res) => {
    const result = await service.getHomeMedias(req.body.list);
    res.status(200).json({code : result ? 1 : 0, result});
})

/*
 인기 미디어 요청
*/
router.get('/pop_medias', async (req, res) => {
    const {err, rs} = await service.getPopMedias();
    const rs_js = err ? {code:0, message:'failed'} : {code:1, message:'success', result: rs};
    res.status(200).json(rs_js);
})

/*
 구독자들 영상 정보 요청
 @param list(array) : 구독 정보 배열
*/
router.post('/get_script_medias', async (req, res) => {
    const list = req.body.list;
    if(!list[0]){
        res.status(200).json({code:1, message:'not list', result:0});
        return;
    }
    const {err, rs_obj} = await service.getScriptMedias(list);
    const rs_js = err ? {code:0, message:'failed'} : {code:1, message:'success', result:rs_obj};
    res.status(200).json(rs_js);
})

/*
 좋아요를 표시한 영상 요청
*/
router.get('/get_good_mymedias', async (req, res) => {
    const email = getEmail(req.session);
    const result = await service.getMyGoodMedias(email);
    const rs_js = !result ? {code:0, message:'failed'} : {code:1, message:'success', result:result};
    res.status(200).json(rs_js);
})

/*
 키워드 검색 요청
 @param keyword(string) : 검색 키워드
*/
router.get('/search_keyword/:keyword', async (req, res) => {
    const keyword = req.params.keyword;
    if(!!keyword && !!keyword.replace(/\s/g, '').length){
        const {err, rs}  = await service.searchKeyword(keyword);
        const rs_js = err ? {code:0 , message:'falied'} : {code:1, message:'success', result:rs};
        res.status(200).json(rs_js);
    }else{
        res.status(200).json({code:0, message:'not find keyword'});
    }
})

/*
 미디어 삭제 요청
 @param num(string) : 대상 미디어 번호
*/
router.post('/drop_media', async (req, res) => {
    const email = getEmail(req.session);
    const result = await service.deleteMeida(req.body.num, email);
    res.status(200).json({code : result ? 1 : 0});
})

/*
 댓글 삭제 요청
 @param num(number) : 대상 댓글 번호
*/
router.post('/drop_comments', async (req, res) => {
    const email = getEmail(req.session);
    const result = await service.deleteComments(req.body.num, email);
    res.status(200).json({code : result ? 1 : 0});
})
module.exports = router;