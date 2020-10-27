let express = require('express');
let router = express.Router();

router.get('/get_events/:start/:end', (req, res) => {
    const {start, end} = req.params;
    const query = `select * from event where date(ev_start_date) between '${start}' and '${end}' or date(ev_end_date) between '${start}' and '${end}';`
    connection.query(query, (err, result) => {
        if(err){
            console.error(err);
            res.status(500).send({message:0});
            return;
        }
        res.status(200).send({message:1, items:result});
    })
})

router.get('/get_asc/:start',(req, res) => {
    const start = req.params.start,
    query = `select * from event where date(ev_start_date) >= '${start}' or date(ev_end_date) >= '${start}' order by date(ev_start_date) asc`;
    connection.query(query, (err, result) => {
        if(err){
            console.log(err);
            res.status(500).send({message:0});
            return;
        }
        console.log(result);
        res.status(200).send({message:1, items:result.slice(0,8)});
    })
})
module.exports = router;