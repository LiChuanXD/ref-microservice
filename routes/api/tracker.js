const express = require('express');
const router = express.Router();
const shortid = require('shortid');

const User = require('../../mongodb/trackerdb');


/////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////                 NEW USER                /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/new-user' , (req , res)=>{
    const randomid = shortid.generate();

    User.findOne({userName : req.body.userName}).then(x=>{
        if(x === null){
            //if cannot find this user
            //check if the form is filled in
            if(req.body.userName === "" || req.body.userName === undefined){
                //if: the form field is empty
                res.send("please fill in the username field").end()
                console.log("Username Field is Empty");
            }else{
                //else: save data
                const newUser = new User({
                    userName : req.body.userName,
                    userId : randomid
                });

                newUser.save().then(y=>{
                    res.json({
                        "username" : y.userName,
                        "userid" : y.userId
                    }).end()
                    console.log("User Saved")
                }).catch(function(err){
                    if(err){
                        throw err
                    }
                })
            }

        }else{
            res.send("username already taken").end();
            console.log("Username already taken");
        }
    }).catch(function(err){
        if(err){
            throw err
        }
    })
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////         ADD EXERCISE          ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/add' , (req , res)=>{
    User.findOne({userId : req.body.userId}).then(x=>{
        //if cannot find this user
        if(x === null){
            res.send("unknown_id").end();
            console.log("Can't find user with this ID")
        }else{
            //user found

            if(req.body.date === "" || req.body.date === undefined){
                req.body.date = Date.now()
            }else{
                req.body.date = new Date(req.body.date).getTime()
            }

            const timeDisplay = new Date(req.body.date).toDateString();

            const addExercise = {
                description : req.body.description,
                duration : req.body.duration,
                date : req.body.date
            }

            if(timeDisplay === "Invalid Date"){
                //if invalid time format
                res.send("invalid time format , please use this format : (yyyy-mm-dd)").end();
                console.log("Invalid Time Format")
            }else{
                User.findOneAndUpdate({userId : req.body.userId} , {$push : {userLog : addExercise}}).then(y=>{
                    res.json({
                        "username" : y.userName,
                        "userid" : y.userId,
                        "description" : addExercise.description,
                        "duration" : addExercise.duration,
                        "date" : timeDisplay
                    }).end();
                    console.log("Exercise Added")
                }).catch(function(err){
                    if(err){
                        throw err
                    }
                })
            }
        }
    }).catch(function(err){
        if(err){
            throw err
        }
    })
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////               exercise logs            ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/log' , (req , res)=>{
    const { userId , from , to , limit } = req.query;

    User.findOne({userId : userId}).then(x=>{
        //if cannot find user
        if(x === null){
            res.send("unknown_id").end();
            console.log("Can't find user with this ID")
        }else{
        //else user found
        //if req.query.limit is true
            if(limit){
                //check time format of from and to is correct
                let fromCheck = new Date(from).toString();
                let toCheck = new Date(to).toString();

                let limitToNum = parseInt(limit);
                let limitCheck = isNaN(limitToNum);

                let fromTime = new Date(from).getTime();
                let toTime = new Date(to).getTime();

                if(limitCheck){
                    //if limit is Not A Number
                    if(fromCheck === "Invalid Date" && toCheck === "Invalid Date"){
                        //if limit is NaN , from & to has wrong date format , show all data of this user
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "count" : x.userLog.length,
                            "log" : x.userLog.map(y=>{
                                return {
                                    "description" : y.description,
                                    "duration" : y.duration,
                                    "date" : y.date.toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing all data of the current user, please make sure all dates is following this format : (yyyy-mm-dd) and limit is a Number value");

                    }else if(toCheck === "Invalid Date"){
                        //if limit is NaN , from has correct date format but to has wrong date format
                        let timeFrom = new Date(from).getTime();
                        let arrList = []
                        x.userLog.forEach(map=>{
                            arrList.push({
                                "description" : map.description,
                                "duration" : map.duration,
                                "date" : map.date.getTime()
                            })
                        })
                        arrList = arrList.filter(f=>f.date >= timeFrom);
                        
                        const countNum = arrList.length;
                        const fromDisplay = new Date(from).toDateString();
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "from" : fromDisplay,
                            "count" : countNum,
                            "logs" : arrList.map(list=>{
                                return {
                                    "description" : list.description,
                                    "duration" : list.duration,
                                    "date" : new Date(list.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing Exercise Logs from this date onwards , due to invalid 'to' date & limit format. Please use this format : (yyyy-mm-dd) and make sure limit is a Number value")

                    }else if(fromCheck === "Invalid Date"){
                        //if limit is NaN , from has wrong date format but to has correct date format
                        let timeTo = new Date(to).getTime();
                        let arrList = [];
                        x.userLog.forEach(map=>{
                            arrList.push({
                                "description" : map.description,
                                "duration" : map.duration,
                                "date" : map.date.getTime()
                            })
                        });
                        arrList = arrList.filter(f=>f.date <= timeTo);

                        const countNum = arrList.length;
                        const toDisplay = new Date(to).toDateString();
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "to" : toDisplay,
                            "count" : countNum,
                            "logs" : arrList.map(list=>{
                                return {
                                    "description" : list.description,
                                    "duration" : list.duration,
                                    "date" : new Date(list.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing Exercise Logs till this date , due to invalid 'from' date & limit format. Please use this format : (yyyy-mm-dd) and make sure limit is a Number value");

                    }else{
                        //if limit is NaN , from & to has correct date format. Show data from- date till to- date
                        let fromCompare = new Date(from).getTime();
                        let toCompare = new Date(to).getTime();
                        let arrList = [];
                        x.userLog.forEach(map=>{
                            arrList.push({
                                "description" : map.description,
                                "duration" : map.duration,
                                "date" : map.date.getTime()
                            })
                        });
                        arrList = arrList.filter(f=>f.date >= fromCompare && f.date <= toCompare);

                        const countNum = arrList.length;
                        const fromDisplay = new Date(from).toDateString();
                        const toDisplay = new Date(to).toDateString();
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "from" : fromDisplay,
                            "to" : toDisplay,
                            "count" : countNum,
                            "log" : arrList.map(list=>{
                                return {
                                    "description" : list.description,
                                    "duration" : list.duration,
                                    "date" : new Date(list.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing date of this user 'from' & 'to'. Please make sure limit is a Number value")
                        
                    }

                }else{
                    //else limit is a Number
                    if(fromCheck === "Invalid Date" && toCheck === "Invalid Date"){
                        //if limit is true , from & to has wrong date format
                        const fakelog = x.userLog.map(y=>{
                            return{
                                "description" : y.description,
                                "duration" : y.duration,
                                "date" : y.date.toDateString()
                            }
                        });
                        const limited = fakelog.slice(0,limitToNum);
                        const limitedCount = limited.length
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "count" : limitedCount,
                            "log" : limited
                        }).end()
                        console.log("Showing all data of the current user with limit, please make sure all dates is following this format : (yyyy-mm-dd)");

                    }else if(toCheck === "Invalid Date"){
                        //if limit is true , from has correct date format but to has wrong date format
                        let fakeLog = x.userLog.map(y=>{
                            return{
                                "description" : y.description,
                                "duration" : y.duration,
                                "date" : y.date.getTime()
                            }
                        });
                        fakeLog = fakeLog.filter(f=>f.date >= fromTime);
                        let realLog = fakeLog.slice(0 , limitToNum);
                        let realCount = realLog.length;
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "from" : new Date(fromTime).toDateString(),
                            "count" : realCount,
                            "log" : realLog.map(z=>{
                                return {
                                    "description" : z.description,
                                    "duration" : z.duration,
                                    "date" : new Date(z.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing data of this user with limit from this date onwards , due to wrong format. Please follow this format : (yyyy-mm-dd)")

                    }else if(fromCheck === "Invalid Date"){
                        //if limit is true , from has wrong date format but to has correct date format
                        let fakeLog = x.userLog.map(y=>{
                            return{
                                "description" : y.description,
                                "duration" : y.duration,
                                "date" : y.date.getTime()
                            }
                        });
                        fakeLog = fakeLog.filter(f=>f.date <= toTime);
                        let realLog = fakeLog.slice(0 , limitToNum);
                        let realCount = realLog.length;
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "to" : new Date(toTime).toDateString(),
                            "count" : realCount,
                            "log" : realLog.map(z=>{
                                return {
                                    "description" : z.description,
                                    "duration" : z.duration,
                                    "date" : new Date(z.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing data of this user with limit till this date, due to wrong format. Please follow this format : (yyyy-mm-dd)")

                    }else{
                        //if limit is true , from & to has correct date format
                        let fakeLog = x.userLog.map(y=>{
                            return{
                                "description" : y.description,
                                "duration" : y.duration,
                                "date" : y.date.getTime()
                            }
                        });

                        fakeLog = fakeLog.filter(f=>f.date >= fromTime && f.date <= toTime);
                        let realLog = fakeLog.slice(0 , limitToNum)
                        let realCount = realLog.length
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "from" : new Date(fromTime).toDateString(),
                            "to" : new Date(toTime).toDateString(),
                            "count" : realCount,
                            "log" : realLog.map(z=>{
                                return {
                                    "description" : z.description,
                                    "duration" : z.duration,
                                    "date" : new Date(z.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing data of this user with limit from this date till this date")
                    }
                }

            }else{
                //else req.query.limit is false
                if(to){
                    //if req.query.to is true
                    //check if the date formats is correct
                    const fromCheck = new Date(from).toString();
                    const toCheck = new Date(to).toString();
                    //if both from and to has wrong date format , show all data
                    if(fromCheck === "Invalid Date" && toCheck === "Invalid Date"){
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "count" : x.userLog.length,
                            "log" : x.userLog.map(y=>{
                                return {
                                    "description" : y.description,
                                    "duration" : y.duration,
                                    "date" : y.date.toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing all data of the current user, due to invalid 'from' & 'to'date format. Please use this format : (yyyy-mm-dd)")

                        
                    }else if(fromCheck === "Invalid Date"){
                        //else if from has wrong date format but to has correct date format , show only to data
                        let timeTo = new Date(to).getTime();
                        let arrList = [];
                        x.userLog.forEach(map=>{
                            arrList.push({
                                "description" : map.description,
                                "duration" : map.duration,
                                "date" : map.date.getTime()
                            })
                        });
                        arrList = arrList.filter(f=>f.date <= timeTo);

                        const countNum = arrList.length;
                        const toDisplay = new Date(to).toDateString();
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "to" : toDisplay,
                            "count" : countNum,
                            "logs" : arrList.map(list=>{
                                return {
                                    "description" : list.description,
                                    "duration" : list.duration,
                                    "date" : new Date(list.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing Exercise Logs till this date , due to invalid 'from' date format. Please use this format : (yyyy-mm-dd)");

                    }else if(toCheck === "Invalid Date"){
                        //else if from has correct date format but to has wrong date format , show only from data
                        
                        let timeFrom = new Date(from).getTime();
                        let arrList = []
                        x.userLog.forEach(map=>{
                            arrList.push({
                                "description" : map.description,
                                "duration" : map.duration,
                                "date" : map.date.getTime()
                            })
                        })
                        arrList = arrList.filter(f=>f.date >= timeFrom);
                        
                        const countNum = arrList.length;
                        const fromDisplay = new Date(from).toDateString();
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "from" : fromDisplay,
                            "count" : countNum,
                            "logs" : arrList.map(list=>{
                                return {
                                    "description" : list.description,
                                    "duration" : list.duration,
                                    "date" : new Date(list.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing Exercise Logs from this date onwards , due to invalid 'to' date format. Please use this format : (yyyy-mm-dd)")

                    }else{
                        //else both has correct date format , show data from - date to - date.

                        let fromCompare = new Date(from).getTime();
                        let toCompare = new Date(to).getTime();
                        let arrList = [];
                        x.userLog.forEach(map=>{
                            arrList.push({
                                "description" : map.description,
                                "duration" : map.duration,
                                "date" : map.date.getTime()
                            })
                        });
                        arrList = arrList.filter(f=>f.date >= fromCompare && f.date <= toCompare);

                        const countNum = arrList.length;
                        const fromDisplay = new Date(from).toDateString();
                        const toDisplay = new Date(to).toDateString();
                        res.json({
                            "username" : x.userName,
                            "userid" : x.userId,
                            "from" : fromDisplay,
                            "to" : toDisplay,
                            "count" : countNum,
                            "log" : arrList.map(list=>{
                                return {
                                    "description" : list.description,
                                    "duration" : list.duration,
                                    "date" : new Date(list.date).toDateString()
                                }
                            })
                        }).end()
                        console.log("Showing date of this user 'from' & 'to'.")

                    }

                }else{
                    //if req.query.from is true
                    if(from){
                        //check date format
                        const timeCheck = new Date(from).toString();
                        if(timeCheck === "Invalid Date"){
                            //if date format is wrong , show all data of this user
                            res.json({
                                "username" : x.userName,
                                "userid" : x.userId,
                                "count" : x.userLog.length,
                                "log" : x.userLog.map(y=>{
                                    return {
                                        "description" : y.description,
                                        "duration" : y.duration,
                                        "date" : y.date.toDateString()
                                    }
                                })
                            }).end()
                            console.log("Showing all data of the current user , due to invalid 'from' date format. Please user this format : (yyyy-mm-dd)")
                            
                        }else{
                            //else date format is right , show data from this date onwards
                            let timeFrom = new Date(from).getTime();
                            let arrList = []
                            x.userLog.forEach(map=>{
                                arrList.push({
                                    "description" : map.description,
                                    "duration" : map.duration,
                                    "date" : map.date.getTime()
                                })
                            })
                            arrList = arrList.filter(f=>f.date >= timeFrom);
                            
                            const countNum = arrList.length;
                            const fromDisplay = new Date(from).toDateString();
                            res.json({
                                "username" : x.userName,
                                "userid" : x.userId,
                                "from" : fromDisplay,
                                "count" : countNum,
                                "logs" : arrList.map(list=>{
                                    return {
                                        "description" : list.description,
                                        "duration" : list.duration,
                                        "date" : new Date(list.date).toDateString()
                                    }
                                })
                            }).end()
                            console.log("Showing Exercise Logs from this date onwards")

                        }
                    }else{
                        // if dont have req.query , show all data
                       res.json({
                           "username" : x.userName,
                           "userid" : x.userId,
                           "count" : x.userLog.length,
                           "log" : x.userLog.map(y=>{
                               return {
                                   "description" : y.description,
                                   "duration" : y.duration,
                                   "date" : y.date.toDateString()
                               }
                           })
                       }).end()
                       console.log("Showing All Data of this User.")

                    }
                }
            }
        }
    }).catch(function(err){
        if(err){
            throw err
        }
    })
});

module.exports = router;