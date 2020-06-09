const express = require('express');
const router = express.Router();
const dns = require('dns');
const Url = require('../../mongodb/urldb');
const shortid = require('shortid');

//post
router.post('/new' , (req , res)=>{

    const randomid = shortid.generate();

    dns.lookup(req.body.url , (err , address , family)=>{
        if(err === null){

            Url.findOne({originalURL : req.body.url}).then(x=>{
                if(x===null){
                    const newurl = new Url({
                        originalURL : req.body.url,
                        shortURL : randomid
                    });

                    newurl.save().then(y=>{
                        res.json({
                            "original_url" : y.originalURL,
                            "short_url" : y.shortURL
                        }).end()
                        console.log("Data saved to 'URL' Database")
                    }).catch(function(err){if(err){throw err}})

                }else{
                    console.log("Found Existing Data in the 'URL' Database")
                    res.json({
                        "original_url" : x.originalURL,
                        "short_url" : x.shortURL
                    }).end()
                }
            }).catch(function(err){
                if(err){
                    throw err
                }
            });

        }else{
            res.json({
                "error" : "invalid url"
            }).end();
            console.log("Invalid URL")
        }
    })
});

//get

router.get("/:shorturl" , (req , res)=>{
    const {shorturl} = req.params
    Url.findOne({shortURL : shorturl}).then(x=>{
        if(x === null){
            res.json({"error" : "invalid url"}).end()
        }else{
            res.redirect("https://" + x.originalURL)
        }
    }).catch(function(err){
        if(err){
            throw err
        }
    })
});

module.exports = router;