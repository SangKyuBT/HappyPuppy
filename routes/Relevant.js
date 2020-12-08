let express = require('express');
let router = express.Router();
const {service} = require('../service/Relevant');

//연관검색어를 생성
//error가 발생해도 items를 그대로 전송해도 됨(length = 0)
router.get('/map/:keyword', (req, res) => {
    service.getKeywords(req.params.keyword, (err, items) => {
        if(err){
            console.log(err);
        }
        res.send(items);
    })

});

router.post('/mapImg', (req, res) => {
    service.getPlaceImgs(req.body, (err, items) => {
        if(err){
            console.log(err);
        }
        res.json(items);
    })
    
});

module.exports = router;