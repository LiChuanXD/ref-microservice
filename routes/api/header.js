const express = require('express');
const router = express.Router();
const ip = require('ip');

router.get('/' , (req , res)=>{
    console.log(req.headers['accept-language'])
    console.log(req.headers['user-agent'])
    res.json({
        "ipaddress" : ip.address(),
        "language" : req.acceptsLanguages()[0],
        "software" : req.headers['user-agent']
    }).end();
})


module.exports = router;