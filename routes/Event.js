let express = require('express');
let router = express.Router();
const createdToken = require('../modules/CreateToken');
const {service} = require('../service/Event');
const {rsUpload} = require('../modules/Multer');


router.post('/sharp', (req, res) => {
    if(!!req.session.tokens){
        rsUpload(req, res, (err) =>{
            if(err){
                console.log('error is event sharp rsUpload');
                res.status(200).json({message:1});
                return;
            }
            const file = req.file, body = req.body,
            email = createdToken.verifyToken(req.session.tokens).email;
            service.insert(file, body, email, (err) => {
                if(err){
                    console.error(err);
                    res.status(200).json({message:0});
                    return
                }
                res.status(200).json({message:1});
            })
        })
    }else{
        console.error('event sharp not login');
        res.status(200).json({message:0});
    }
})

router.post('/update', (req, res) => {
    if(!!req.session.tokens){
        rsUpload(req, res, (err) =>{
            if(err){
                console.log('error is event update rsUpload');
                res.status(200).json({message:1});
                return;
            }
            const {file, body} = req,
            email = createdToken.verifyToken(req.session.tokens).email;
            service.update(file, body, email, (err) => {
                if(err){
                    console.error(err);
                    res.status(200).json({message:0});
                    return
                }
                res.status(200).json({message:1});
            })
        })
    }else{
        console.error('event sharp not login');
        res.status(200).json({message:0});
    }
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
    if(!!req.session.tokens){
        const token_info = createdToken.verifyToken(req.session.tokens),
        email = token_info.email;
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
    }else{
        res.status(200).json({code:0, message:'not login'});
    }
})
module.exports = router;