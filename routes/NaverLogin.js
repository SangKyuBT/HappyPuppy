let express = require('express');
let router = express.Router();
const {naverService} = require('../service/Login');

//로그인 요청이 들어오면 여기로 들어올거임
router.get('/callback/*', function (req, res) {
  naverService(req.query, (err, response, body) => {
    if(!err || response.statusCode == 200){
      console.error('naver login success');
      req.session.cookie.expires = 3600000;
      req.session.tokens = body;
      req.session.isLogined = 2;
      req.session.save(function(){
        res.redirect(req.session.cookie.path);
      })
    }else{
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode);
    }
  })
});




// var json_body = JSON.parse(body);
// header = 'Bearer ' + json_body.access_token;
// var member_url = 'https://openapi.naver.com/v1/nid/me';
// var member_options = {
//     url : member_url,
//     headers: {'Authorization': header}
// }
//  //마이페이지 접속시 네이버 유저 정보 가져 오기
//  request.get(member_options, function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     var json_member = JSON.parse(body);
//     var member_name = String.fromCharCode(json_member.name);
//     console.log("여기에 옮?")
//     // console.log("\ucd5c\uc0c1\uaddc")
//     // console.log(member_name);
//     // res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
//     // res.end(body);

//     console.log('*************************')
//     console.log(body);
//     res.redirect("http://localhost:3000");
//     // console.log("redirect success!");
//     // res.end(body);
//     // res.send('asd');
//     res.end();

//   } else {
//     console.log('error');
//     if(response != null) {
//       res.status(response.statusCode).end();
//       console.log('error = ' + response.statusCode);
//     }
//   }
// });




module.exports = router;
