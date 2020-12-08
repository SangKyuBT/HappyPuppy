const getPoint = (item) => {
    let point = (item.count + item.good * 10 - item.bad * 10)/3;
    point = !item.scb ? point : point + item.scb * 2.5;
    point = !item.pop ? point : point + item.pop * 2.5;
    return point;
}
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