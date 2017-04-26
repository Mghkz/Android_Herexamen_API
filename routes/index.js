var express = require('express');
var router = express.Router();
var mysql      = require('mysql');
var pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'discussion'
});

/* GET rows */
router.get('/', function(req, res, next) {

    pool.getConnection(function(err,connection){
        if(!err) {
            console.log("Database is connected");
            connection.query('SELECT * from users', function(err, rows, fields) {
                connection.release();
                if (!err){
                    console.log('The solution is: ', rows);

                    obj = {
                        rows:rows,
                    }
                    res.json(
                        obj
                    )
                }
                else
                    console.log('Error while performing Query.');
            })
        } else {
            connection.release();
            console.log("Error connecting database");
            res.json(
                "Error connecting database"
            )
        }
    });
    //res.render('index', { title: 'Express' });
});

router.get('/discussions', function(req, res, next) {

    var userId = req.query.userId;
    pool.getConnection(function(err,connection){
        if(!err) {
            console.log("Database is connected");
            connection.query('SELECT * from discussion where userId =' + userId, function(err, rows, fields) {
                connection.release();
                if (!err){
                    console.log('The solution is: ', rows);

                    obj = {
                        discussions:rows,
                    }
                    res.json(
                        obj
                    )
                }
                else
                    console.log('Error while performing Query.');
            })
        } else {
            connection.release();
            console.log("Error connecting database");
            res.json(
                "Error connecting database"
            )
        }
    });
    //res.render('index', { title: 'Express' });
});

/* GET stats */
router.get('/stats', function(req, res, next) {

    var userId = req.query.userId;
    pool.getConnection(function(err,connection){
        if(!err) {
            console.log("Database is connected");
            connection.query('SELECT * from discussion where userId ='+userId, function(err, rows, fields) {
                connection.release();
                if (!err){
                    console.log('The solution is: ', rows);

                    var decided = 0;
                    var won     = 0;
                    var lost    = 0;

                    var amount = rows.length
                    for(var i=0; i < amount;i++)
                    {

                        if(rows[i].decided === 1)
                        {
                            decided = decided +1 ;
                            if(rows[i].correct === 1)
                            {
                                won = won +1 ;
                            }
                            else
                            {
                                lost = lost +1 ;
                            }
                        }

                    }

                    obj = {
                        amount:amount,
                        decided:decided,
                        won:won,
                        lost:lost,
                    }
                    res.json(
                        obj
                    )
                }
                else
                    console.log('Error while performing Query.');
            })
        } else {
            connection.release();
            console.log("Error connecting database");
            res.json(
                "Error connecting database"
            )
        }
    });
    //res.render('index', { title: 'Express' });
});

router.post('/login', function(req, res, next) {

    //var name = req.body.userName;
    var name = req.query.userName;
    var passwd = req.query.passwd


    var v = false;

    pool.getConnection(function(err,connection){
        if(!err) {
            console.log("Database is connected");
            connection.query('SELECT * from users where userName="' + name + '" LIMIT 1', function(err, rows, fields) {
                connection.release();
                if (!err){
                    if (rows.length === 0)
                    {
                        console.log('User not found.');
                        obj = {
                            message:"User not found",
                            valid:false,
                        };

                        res.json(
                            obj
                        )
                    }
                    else
                    {
                        var user = rows[0];
                        if (user.userName === name && user.passwd === passwd)
                        {
                            console.log('The solution is: ', rows);

                            var v = true;
                            obj = {
                                id     : user.userId,
                                message:"user found",
                                valid:v,
                            };

                        }
                        else{
                            obj = {
                                message:"Password incorrect",
                                valid:false,
                            };
                        }
                        res.json(
                            obj
                        )
                    }
                }
                else
                {
                    console.log('Error while performing Query.');
                    obj = {
                        message:"Error while performing Query.",
                        valid:false,
                    };

                    res.json(
                        obj
                    )
                }

            })
        } else {
            connection.release();
            console.log("Error connecting database");
            obj = {
                message:"Error connecting to database",
                valid:v,
            };

            res.json(
                obj
            )
        }
    });
});

router.post('/updateDiscussion', function(req, res, next) {

    //var name = req.body.userName;
    var discussionId = req.query.discussionId;
    var correct = req.query.correct;

    if(correct == 0)
        correct = "false";
    else
        correct = "true";



    pool.getConnection(function(err,connection){
        if(!err) {
            console.log("Database is connected");
            connection.query('update discussion set decided=true,correct='+correct+' where discussionId = '+discussionId, function(err, rows, fields) {
                connection.release();
                if (!err){

                    console.log('Updated discussion.');
                    obj = {
                        message:"Updated discussion",
                    };

                    res.json(
                        obj
                    )
                }
                else
                {
                    console.log('Error while performing Query.');
                    obj = {
                        message:"Error while performing Query.",
                        valid:false,
                    };

                    res.json(
                        obj
                    )
                }

            })
        } else {
            connection.release();
            console.log("Error connecting database");
            obj = {
                message:"Error connecting to database"
            };

            res.json(
                obj
            )
        }
    });
});

router.post('/createDiscussion', function(req, res, next) {

    //var name = req.body.userName;
    var userId   = req.body.userId;
    var question = req.body.question;
    var answer1  = req.body.answer1;
    var answer2  = req.body.answer2;
    var reward   = req.body.reward;

    pool.getConnection(function(err,connection){
        if(!err) {
            console.log("Database is connected");
            connection.query('insert into discussion (userId,question,answer1,answer2,reward) values ('+userId+',"'+question+'","'+answer1+'","'+answer2+'","'+reward+'")', function(err, result) {
                connection.release();
                if (!err){

                    console.log('Created discussion.');
                    obj = {
                        discussionId : result.insertId,
                        created: true,
                        message:"Created discussion",
                    };

                    res.json(
                        obj
                    )
                }
                else
                {
                    console.log('Error while performing Query.');
                    obj = {
                        created: false,
                        message:"Error while performing Query.",
                    };

                    res.json(
                        obj
                    )
                }

            })
        } else {
            connection.release();
            console.log("Error connecting database");
            obj = {
                message:"Error connecting to database"
            };

            res.json(
                obj
            )
        }
    });
});

module.exports = router;
