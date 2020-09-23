let express = require('express');
let router = express.Router();

//실종 반려견 리스트를 전송
router.get('/', (req, res) => {
    connection.query("select num, ad_title, ad_place, main_img from abandoned", function(err, result) {
        if(err){
            console.log(err);
            res.status(500).send({message: 0});
        }
        const rs = result.length > 0 ? {message: 1, result : result} : {message: 0, result : result} 
        res.status(200).json(rs)
    })
})

//받은 지역의 이름으로 일치하는 리스트를 전송
router.get('/place_search/:place', (req, res) => {
    console.log(req.params.place);
    if(!req.params.place){
        res.status(500).send({
            message : 0
        });
        return
    }
    const query = "select num, ad_title, ad_place, main_img from abandoned where ad_place like '%"+req.params.place+"%'";
    connection.query(query, (err, result) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 0});
        }
        console.log("!!");
        console.log(result);
        
        const rs = result.length > 0 ? {message: 1, result : result} : {message: 0, result : result} 
        res.status(200).json(rs)
    })
})

//받은 번호의 정보를 리턴
router.get('/target/:num', (req, res) => {
    console.log(req.params.num);
    if(!req.params.num){
        res.status(500).send({
            message : 0
        });
        return
    }
    const query = "select * from abandoned where num =" + req.params.num;
    connection.query(query, (err, result) => {
        if(err){
            console.log(err);
            res.status(500).send({message: 0});
        }
        const rs = result.length > 0 ? {message: 1, result : result} : {message: 0, result : result} 
        res.status(200).json(rs)
    })
})

module.exports = router;
