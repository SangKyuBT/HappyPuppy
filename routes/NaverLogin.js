let express = require('express');
let router = express.Router();
const client_id = 'y2GchClz01E_mwS85HM7';
const client_secret = '8OnqNNXXRQ';
let state = "RAMDOM_STATE";
let code = "";
// var redirectURI = encodeURI("http://localhost:3000/");
const redirectURI = encodeURI("http://localhost:3000/api/naver_login/callback/");

let api_url = "";

//로그인 요청이 들어오면 여기로 들어올거임
router.get('/callback/*', function (req, res) {
  //로그인 요청이 들어오면 필요한 것들을 만들어서
  console.log("callback");
  code = req.query.code;
  state = req.query.state;
  api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
  + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
  
  var request = require('request');
  var options = {
      url: api_url,
      headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
  };

  //필요한것들을 네이버에 보냄
  request.post(options, function (error, response, body) {
    //네이버에서 나의 클라이언트의 유무를 확인해서 결과를 보내줄거임
    //로그인이 성공되면 body에 토큰 정보를 보내줄꺼임
    if (!error && response.statusCode == 200) {
      req.session.cookie.expires = 3600000;
      req.session.tokens = body;
      req.session.isLogined = 2;
      console.log(req.session)
      req.session.save(function(){
        res.redirect(req.session.cookie.path);
      })
    } else {
        res.status(response.statusCode).end();
        console.log('error = ' + response.statusCode);
    }
  });
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
