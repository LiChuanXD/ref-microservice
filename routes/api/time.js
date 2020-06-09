const express = require('express');
const router = express.Router();


router.get("/" , (req , res)=>{
    const date = new Date();
    const unix = date.getTime();
    const utc = date.toUTCString();
    res.json({
        "unix" : unix,
        "utc" : utc
    });
    res.end();
});

router.get("/:time" , (req , res)=>{
    const param = req.params.time;
    const check = param.split("").indexOf("-");
    const date = new Date(param);
    const unix = date.getTime();
    const utc = date.toUTCString();
    const unixNum = parseInt(req.params.time);
    const dateNum = new Date(unixNum);
    const utcNum = dateNum.toUTCString();

    if(check === -1){
        res.json({
            "unix" : unixNum ,
            "utc" : utcNum
        }).end();
    }else{
        if(utc === "Invalid Date"){
            res.json({
                "error" : utc
            })
        }else{
            res.json({
                "unix" : unix ,
                "utc" : utc
            }).end();
        }
    }
});

module.exports = router;