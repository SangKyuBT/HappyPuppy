let express = require('express');
let router = express.Router();
const {service} = require('../service/Event');
const {rsUpload} = require('../modules/Multer');
const getEmail = require('../modules/getEmail');

router.post('/sharp_img', (req, res) => {
    rsUpload(req, res, (err) =>{
        if(err){
            console.log('error is event sharp rsUpload');
            res.status(200).json({code:1});
            return;
        }
        const file = req.file, body = req.body,
        email = getEmail(req.session);
        service.insert(file, body, email, (err) => {
            if(err){
                console.error(err);
                res.status(200).json({code:0});
                return
            }
            res.status(200).json({code:1});
        })
    })
})

router.post('/update', (req, res) => {
    rsUpload(req, res, (err) =>{
        if(err){
            console.log('error is event update rsUpload');
            res.status(200).json({code:1});
            return;
        }
        const {file, body} = req,
        email = getEmail(req.session);
        service.update(file, body, email, (err) => {
            if(err){
                console.error(err);
                res.status(200).json({code:0});
                return
            }
            res.status(200).json({code:1});
        })
    })
})


router.get('/get_events/:start/:end', (req, res) => {
    const {start, end} = req.params;
    service.selectCalendar(start, end, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).send({message:0});
            return;
        }
        res.status(200).send({message:1, items:result});
    })
})

router.get('/get_asc/:start',(req, res) => {
    const start = req.params.start;
    service.selectCarouesl(start, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).send({message:0});
            return;
        }
        res.status(200).send({message:1, items:result});
    })
})

router.post('/delete_event', (req, res) => {
    email = getEmail(req.session);
    service.delete(req.body.num, email, (err, result) => {
        if(err){
            console.log(err);
            res.status(200).json({code:0, message:'mysql excution failed'});
            return;
        }
        if(!result.affectedRows){
            res.status(200).json({code:1, message:'mysql delete failed'});
            return
        }
        res.status(200).json({code:1, message:'delete success'});
    })
})
module.exports = router;