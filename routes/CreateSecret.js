const crypto = require('crypto');
const aad = Buffer.from('0123456789', 'hex');

//랜덤 비밀키 생성 메소드
const createCertifyNumber = function(x, y) {
    var hex_key = crypto.randomBytes(256).toString('hex').substr(100, x); //hax로 인코딩 후 x자
    var base64_key = crypto.randomBytes(256).toString('base64').substr(50, y); //base64로 인코딩 후 y자
    return hex_key + base64_key;
}

//패스워드 암호화 메소드
const encryption = function(pas) {
    const key = createCertifyNumber(8,8);
    // number used once 매번 바꿔 사용하는 번호 
    const nonce = crypto.randomBytes(12);
    // aes 128 ccm 암호화 객체 생성 TAG는 16바이트
    const cipher = crypto.createCipheriv('aes-128-ccm', key, nonce,  {
      authTagLength: 16
    });
    // 평문 데이터
    const plaintext = pas;
    // aad 추가
    cipher.setAAD(aad, {
      plaintextLength: Buffer.byteLength(plaintext)
    });
    // 평문 암호화
    const ciphertext = cipher.update(plaintext, 'utf8');
    // 암호화 완료 - 이 이후로는 더이상 이 암호화 객체를 사용할 수 없음
    cipher.final();
    // 최종 암호화 TAG(MAC) 값 얻기
    const tag = cipher.getAuthTag();
    var item  = {
        key : key,
        en : ciphertext.toString("hex"),
        tag : tag.toString("hex"),
        nonce : nonce.toString('hex'),
    };
    return item;
}

//복호화 메소드
const ventriloquism = function(item) {
    const cp_nonce = Buffer.from(item.nonce, 'hex');
    const cp_text = Buffer.from(item.en,'hex');
    const cp_tag = Buffer.from(item.tag, 'hex');
    const dcp = crypto.createDecipheriv('aes-128-ccm', item.key, cp_nonce, {
        authTagLength : 16
    });
    dcp.setAuthTag(cp_tag);
    dcp.setAAD(aad, {
        plaintextLength: cp_text.length
    });
    const tryVentriloquism = dcp.update(cp_text, null, 'utf8');
    try {
        dcp.final();
      } catch (err) {
        console.error('Authentication failed!');
        throw err;
      }

    return tryVentriloquism;
}

module.exports.createCertifyNumber = createCertifyNumber;
module.exports.encryption = encryption;
module.exports.ventriloquism = ventriloquism;