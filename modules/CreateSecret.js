/* 
  암호화 및 복호화 모듈
  함수 역할만 주석 달아놨습니다.
 */
const crypto = require('crypto');
const aad = Buffer.from('0123456789', 'hex'); 

//랜덤키 생성
const createCertifyNumber = (x, y) => {
    var hex_key = crypto.randomBytes(256).toString('hex').substr(100, x); 
    var base64_key = crypto.randomBytes(256).toString('base64').substr(50, y); 
    return hex_key + base64_key;
}

// 암호화 객체 생성
const encryption = (pas) => {
    const key = createCertifyNumber(8,8);
    const nonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-128-ccm', key, nonce,  {
      authTagLength: 16
    });
    const plaintext = pas;
    cipher.setAAD(aad, {
      plaintextLength: Buffer.byteLength(plaintext)
    });
    const ciphertext = cipher.update(plaintext, 'utf8');
    cipher.final();
    const tag = cipher.getAuthTag();
    var item  = {
        key : key,
        en : ciphertext.toString("hex"),
        tag : tag.toString("hex"),
        nonce : nonce.toString('hex'),
    };
    return item;
}

//암호화 객체 디코딩
const ventriloquism = (item) => {
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
    const ventriloquism = dcp.update(cp_text, null, 'utf8');
    try {
        dcp.final();
        return ventriloquism;
      } catch (err) {
        console.error('decomposition failure');
        setTimeout(() => {
          ventriloquism(item);
        }, 200);
      }

}

module.exports = { createCertifyNumber, encryption, ventriloquism }