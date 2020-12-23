/*
 미디어 정렬
*/

/*
 정렬 기준이될 점수 리턴
 @param item(obj) : 미디어 정보 객체
 점수 생성 조건 : 조회수, 좋아요, 싫어요, 구독, 인기
*/
const getPoint = (item) => {
    let point = (item.count + item.good * 10 - item.bad * 10)/3;
    point = !item.scb ? point : point + item.scb * 2.5;
    point = !item.pop ? point : point + item.pop * 2.5;
    return point;
}

/*
 받은 미디어들을 점수를 조건으로 정렬 후 리턴
 @param items(array) : 미디어 배열
*/
const sort = (items) => {
    if (items.length < 2) {
        return items;
    }
    const pivot = [items[0]], left = [], right = [];
    for (let i = 1; i < items.length; i++) {
        const i_point = getPoint(items[i]), p_point = getPoint(pivot[0]);
        if (i_point > p_point) {
            left.push(items[i]);
        } else if (i_point < p_point) {
            right.push(items[i]);
        } else {
            pivot.push(items[i]);
        }
    }
    return sort(left).concat(pivot, sort(right));
}

module.exports.sort = sort;