var express = require('express');
var router = express.Router();
const client = require( "cheerio-httpcli" );





//연관검색어를 생성
router.get('/map/:keyword', (req, res) => {
    const keyword = req.params.keyword;
    const URL = "https://m.map.naver.com/ac.map/mobilePlaceAddress/ac?q=" + encodeURI(keyword) + "&st=10&r_lt=10";
    let keyword_list = new Array();

    const request = require('request');
    request.get(URL, (error, response, body) => {
        if(!error){
            const list = JSON.parse(body).items[0];
            for(let i of list){
                keyword_list.push(i[0]);
            }
        }
        res.send(keyword_list);
    })
});

router.post('/mapImg', (req, res) => {
    const ids = req.body
    let urls = ids.map(item => {
        return "https://place.map.kakao.com/photolist/v/" + item;
    })
    var items = {};
    const request = require('request');
    urls.forEach((item, idx)=>{
        request.get(item, (error, response, body) => {
            if(error){
                items[ids[idx]] = null;
                return;
            }
            try{
                items[ids[idx]] = JSON.parse(body).photoViewer.list[0].url;
            }catch(error){
                items[ids[idx]] = null;
            }
            let bl = true;
            for(let j of ids){
                if(items[j] === undefined){
                    bl = false;
                    return;
                }
            }
            if(bl){
                res.json(items);
            }
        })
    })
    
    
});



module.exports = router;