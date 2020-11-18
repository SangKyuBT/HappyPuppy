const DAO = require('../DAO/Media');
const { practice } = require('../modules/S3');
const getPoint = (item) => {
    return (item.count + item.good * 10 - item.bad * 10)/3 - item.index*2.5;
}
const sort = (items) => {
    if (items.length < 2) {
        return items;
    }
    const pivot = [items[0]];
    const left = [];
    const right = [];
    for (let i = 1; i < items.length; i++) {
        const i_point = getPoint(items[i]);
        const p_point = getPoint(pivot);
        if (i_point>= p_point) {
            left.push(items[i]);
        } else if (i_point < p_point) {
            right.push(items[i]);
        } else {
            pivot.push(items[i]);
        }
    }
    return sort(left).concat(pivot, sort(right));
}
const service = {
    getChannel : (email, session_email, callback) => {
        DAO.select('member', email, (err, result) => {
            if(err || result[0]['count(*)'] === 0){
                console.error('error is mysql select, get channel(member)');
                callback(err, false, result);
                return;
            }
            let channel = {}; 
            DAO.select('channel', [email], (err, result) => {
                if(err){
                    console.error('error is mysql select, get channel');
                    callback(err, true, result);
                    return;
                }

                channel.first_media = result[0];
                channel.medias = sort(result);
                sort(result);
                DAO.select('profile', [email], (err, result) => {
                    if(err){
                        console.error('error is mysql select, get profile');
                        callback(err, true, result);
                        return;
                    }
                    channel.profile = result;
                    DAO.select('script', [email], (err, result) => {
                        if(err){
                            console.error('error is mysql select, get script list');
                            callback(err, true, result);
                            return;
                        }
                        channel.script_list = result;
                        DAO.select('my_script',[email, session_email], (err, result) => {
                            if(err){
                                console.error('error is mysql select, get my script');
                            }
                            channel.this_script = result;
                            callback(err, true, channel);
                        })
                    })
                });
            })
        })
    },
    scripting : (email, my_email, callback) => {
        DAO.insert('script_list', {channel_email:email, member_email:my_email}, (err) => {
            if(err){
                console.error('error is mysql insert script list');
            }
            callback(err);
        })
    },
    getMedia : (search_key, keyword, callback) => {
        
    },
    videoUpdate : (file, num, email, callback) => {
        
    },
    thumbnailUpdate : (file, num, email, callback) => {
        
    },
    contentUpdate : (body, email, callback) => {
        
    },
    delete : (num, email, callback) => {
        
    },
    plusGood : (num, callback) => {
        
    },
    minusGood : (num, callback) => {
        
    },
    plusBad : (num, callback) => {
        
    },
    minusBad : (num, callback) => {
        
    },
    //media upload
    mediaUpload : (form, files, email, callback) => {
        form = JSON.parse(form);
        form.email = email,
        form.img = files.img[0].key,
        form.video = files.video[0].key,
        form.date = new Date();
        DAO.insert('media', form, (err) => {
            if(err){
                console.error('error is mysql video insert');
            }
            console.log('media db insert success');
            callback(err);
        })
    },
    //비디오 스트리밍
    //**1. s3에서 오브젝트의 정보만을 가져옴
    //**2. 받아온 정보들로 헤더에 들어갈 객체 생성(영상 시작, 끝, 총 길이, 재생 길이)
    //**3. s3에서 stream 호출
    //**4. 스트림과 헤더를 callback에 전송
    getVideo : (key, range, callback)=>{
        /**1 */
        practice.headRead(key, (err, data) => {
            if(err){
                console.error('error is get video s3 head read');
                callback(err);
                return
            }
            /**2 */
            const total = data.ContentLength, //영상의 전체 용량
            //받아온 range에서 영상 시작과 끝 범위를 추출
            item = range.split('=')[1].split('-');
            start = Number(item[0]); //영상 시작
            j = Number(item[1]);
            end = j ? j : total - 1; //영상 끝
            content_rength = (end - start) + 1; //재생 길이
            const header = { //헤더에 들어갈 객체
                'AcceptRanges': 'bytes',
                'Content-Range' : "bytes " + start + "-" + end + "/" + total,
                'Content-Length' : content_rength,
                'Content-Type' : 'video/mp4',
            }
            /**3 */
            const stream = practice.rangeStream(key, range);
            stream.on('error', function(err){
                console.log(err.message);
                return;
            }).on('end', function(){
                console.log('end straming');
                return;
            }).on('close', function(){
                console.log('close straming');
                return;
            })
            /**4 */
            callback(err, stream, header);
        })
    }
    
}

module.exports.service = service;