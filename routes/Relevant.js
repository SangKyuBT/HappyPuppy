var express = require('express');
var router = express.Router();
var asycArr = new Array();

//연관검색어를 생성
router.get('/map', (req, res) => {
    const keyword = req.query.keyword;
    console.log(keyword)
    const URL = "https://m.map.naver.com/ac.map/mobilePlaceAddress/ac?q=" + encodeURI(keyword) + "&st=10&r_lt=10";
    var request = require('request');
    let keyword_list = new Array();
    request.get(URL, (error, response) => {
        if(error){
            res.send(keyword_list);
        }
        const list = JSON.parse(response.body).items[0];
        for(let i = 0; i < list.length; i++){
            keyword_list.push(list[i][0]);
        }
        res.send(keyword_list);
    })
    
    
    // const url = "https://map.kakao.com/api/dapi/suggest/place?_caller1=ver_map_141&q=" + encodeURI(keyword);
    //
    // request.get(url, (error, response) => {
    //     if(error){
    //         res.send(keyword_list);
    //     }
    //     const items = JSON.parse(response.body).items;
    //     if(items.length > 0){
    //         let j = items.length >= 10 ? 10 : items.length;
    //         for(let i = 0; i < j; i++){
    //             keyword_list.push(items[i].split('|')[0]);
    //         }
    //     }
    //     res.send(keyword_list);
    // })
});

module.exports = router;