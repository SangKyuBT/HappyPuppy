const { connect } = require("../app");

function resolveAfter2Seconds(x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, 2000);
    });
  };
  
  
var add = async function(x) { // async function 표현식을 변수에 할당
    var a = await resolveAfter2Seconds(20);
    var b = await resolveAfter2Seconds(30);
    return x + a + b;
};

add(10).then(v => {
    console.log(v);  // 4초 뒤에 60 출력
});

