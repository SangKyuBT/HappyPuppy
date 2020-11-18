const DAO = require('../DAO/Abandoned');
const {practice} = require('../modules/S3');

//insert, update 필요 변수 객체로 만들어 리턴
const createInfo = (form, files, email ) => {
    const sb_imgs = JSON.stringify({
        sb0 : files.sb0[0].key, 
        sb1 : files.sb1[0].key,
        sb2 : files.sb2[0].key
    });
    let ab_info = { 
        sb_imgs : sb_imgs,
        main_img : files.main[0].key
    };
    if(!!email){
        ab_info.email = email;
    }
    Object.keys(form).forEach(f => {
        ab_info[f] = form[f];
    })
    return ab_info;
}
//key 값들을 params로 받아 s3 delete
const deleteTofile = (main_key, sb_keys) => {
    practice.delete(`abandoned/${main_key}`, (err) => {
        if(err){
            console.error(`error is delete ${main_key}`);
            console.log(err)
        }else{
            console.log(`success is delete ${main_key}`)
        }
    })
    Object.keys(sb_keys).forEach( f => {
        practice.delete(`abandoned/${sb_keys[f]}`, (err) => {
            if(err){
                console.error(`error is delete ${sb_keys[f]}`);
                console.log(err)
            }else{
                console.error(`success is delete ${sb_keys[f]}`);
            }
        })
    })
}
const service = {
    select : (place, num, callback) => {
        DAO.select(place, num, (err, result) => {
            if(err){
                console.error('mysql abandoned select error');
            }
            callback(err, result);
        })
    },
    //필요한 변수들을 추출 후 db insert
    insert : (form, files, email, callback) => {
        form = JSON.parse(form);
        const ab_info = createInfo(form, files, email);
        DAO.insert(ab_info, (err) => {
            if(err){
                console.error('abandoned mysql insert error');
            }
            callback(err);
        })
    },
    //필요 변수들을 추출 후 update, s3에서 기존 파일 삭제
    //**1. 삭제 파일들을 key 추출*/
    //**2. db update 과정에서 error가 발생했다면  */
    //     update돼야 했을 key값으로 변경
    //**3. 추출 한 key 값으로 s3 파일 삭제 */
    update : (form, files, callback) => {
        form = JSON.parse(form);
        const update = form.update;
        delete form.update;
        const ab_info = createInfo(form, files, false);
        /**1 */
        let {main_key, sb_keys} = update;
        DAO.update(ab_info, update.num, (err) => {
            if(err){
                /**2 */
                console.error('error is abandoned mysql update');
                main_key = files.main[0].key
                Object.keys(sb_keys).forEach(f => {
                    sb_keys[f] = files[f][0].key;
                })
            }
            callback(err);
            /**3 */
            deleteTofile(main_key, sb_keys);
        })
    },
    // db, s3 delete
    delete : (body, email, callback) => {
        var {main_key, sb_keys, num} = body;
        DAO.delete(num, email, (err) => {
            if(err){
                console.error(`error is delete ${body.num}`);
            }else{
                sb_keys = JSON.parse(sb_keys);
                deleteTofile(main_key, sb_keys);
            }
            callback(err);

        })
    }
}

module.exports = service;