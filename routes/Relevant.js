var express = require('express');
var router = express.Router();

router.get('/map', (req, res) => {
    let keyword = req.query.keyword;

    var request = require('request');
    // appkey=0f91ccc64a97c44c9f5e102f155b54d4&libraries=services,clusterer,drawing
    var url = {
       url : "https://map.kakao.com/api/dapi/suggest/place?q=부산",
       header : {appkey:"0f91ccc64a97c44c9f5e102f155b54d4",libraries:"services,clusterer,drawing"}
    };
    request.get("https://map.kakao.com/api/dapi/suggest/place?_caller1=ver_map_141&q=%EC%84%9C%EC%9A%B8%EC%8B%9C", (error, response, body) => {
        console.log(response);
        console.log(body);
        if(error){
            console.log(error);
        }

        res.send("asd");
    })

})

module.exports = router;