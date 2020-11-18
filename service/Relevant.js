const service = {
    //map 연관 검색어 응답
    getKeywords : (keyword, callback) => {
        const URL = `https://m.map.naver.com/ac.map/mobilePlaceAddress/ac?q=${encodeURI(keyword)}&st=10&r_lt=10`;
        let keyword_list = [],
        request = require('request');
        request.get(URL, (error, response, body) => {
            if(error){
                console.error('error is relevant get keywords request');
            }
            const list = JSON.parse(body).items[0];
            for(let i of list){
                keyword_list.push(i[0]);
            }
            callback(error, keyword_list);
        })
    },
    getPlaceImgs : (body, callback) => {
        const ids = body, request = require('request');
        let urls = ids.map(item => {
            return `https://place.map.kakao.com/photolist/v/${item}`;
        });
        let items = {};
        urls.forEach((item, idx)=>{
            request.get(item, (error, response, body) => {
                if(error){
                    items[ids[idx]] = null;
                    return;
                }
                try{
                    items[ids[idx]] = JSON.parse(body).photoViewer.list[0].url;
                }catch(error){
                    items[ids[idx]] = null;
                }
                let bl = true;
                for(let j of ids){
                    if(items[j] === undefined){
                        bl = false;
                        return;
                    }
                }
                if(bl){
                    callback(error, items);
                }
            })
        })
    }
}
module.exports.service = service;