const express = require('express');
const router = express.Router();
const path = require('path');

const multer = require('multer');

const storage = multer.diskStorage({
    destination : "./uploads",
    filename : function(req , file , cb){
        cb(null , file.fieldname + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({storage : storage}).single('upfile')



router.post('/' , (req , res , next)=>{
    upload(req , res , (err) => {
        if(err){
            throw err
        }else{
            res.json({
                "name" : req.file.originalname,
                "type" : req.file.mimetype,
                "size" : req.file.size
            }).end()
            console.log("uploaded")
        }
    })
})

module.exports = router