const express = require('express');
const request = require('request');
const moment = require('moment');
const router = express.Router();
const passport = require("passport");
const sanitizeHtml = require('sanitize-html');

const config = require("../resources/config.json");
const MongoClient = require('mongodb').MongoClient;
const url = config.mongoUrl;
const dbName = config.mongoDbName;
const ROLES = require("../models/Roles").ROLES;
const SKILLS = require("../models/Skills").SKILLS;
const Assignment = require("../models/Assignment").Assignment;
const Profile = require("../models/Profile").Profile;


const linkedinLookupUrl = 'https://api.linkedin.com/v1/people/~:(id,email-address,first-name,last-name,formatted-name,picture-url,public-profile-url)?format=json';

let collection = function (collectionName, callback) {
    let databaseOptions_1 = {
        useNewUrlParser: true,
        auth: {user: process.env.MONGODB_USER || config.mongoDbBruker, password: process.env.MONGODB_PASSWORD || config.mongoDbPassord}
    };
    MongoClient.connect(url, {}, function (err, client) {
        if (err) {
            console.log(err)
        } else {
            let db = client.db(dbName);
            let collection = db.collection(collectionName);
            callback(collection);
        }
    });
};


router.get('/', function (req, res, next) {
    collection("people", function (peopleCollection) {
        peopleCollection.find({}, function (err, peopleData) {
            let people = [];
            peopleData.forEach(person => {
                if (person.profileDate) {
                    person.profileDateTxt = moment(person.profileDate).format("DD.MM.YYYY");
                }
                people.push(person);
            });

            people.sort(function (a, b) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(a.profileDate) - new Date(b.profileDate);
            });


            if (req.cookies["token"]) {

                request.get({
                    "url": linkedinLookupUrl,
                    "headers": {"Authorization": "Bearer " + req.cookies["token"], "x-li-format": "json"}
                }, function (err, httpResponse, body) {
                    if (err) {
                        next(err)
                    } else {
                        let profileDto = JSON.parse(body);
                        res.render('index', {
                            "title": "innlogget",
                            "profile": {"linkedinProfile": profileDto},
                            "people": people
                        });
                    }
                })
            } else {
                res.render('index', {title: 'Ledig for oppdrag', "people": people});
            }

        });
    });
});

router.get('/vilkar', function (req, res, next) {
    res.render('vilkar', {title: 'Vilkår og betingelser'});
});

router.get('/oppdrag', function (req, res, next) {
    if (req.cookies["token"]) {
        request.get({
            "url": linkedinLookupUrl,
            "headers": {"Authorization": "Bearer " + req.cookies["token"], "x-li-format": "json"}
        }, function (err, httpResponse, body) {
            if (err) {
                next(err)
            } else {
                let profileDto = JSON.parse(body);
                collection("work", function (workCollection) {
                    let data = workCollection.find({"_id": profileDto.id});
                    profileDto.create = !(data && data.id);
                    res.render('oppdrag', {
                        title: 'Oppdrag',
                        "work": data,
                        profile: profileDto,
                        skills: SKILLS,
                        roles: ROLES
                    });

                });
            }
        });
    } else {
        res.redirect("/");
    }
});


router.get('/profil', function (req, res, next) {
    if (req.cookies["token"]) {
        request.get({
            "url": linkedinLookupUrl,
            "headers": {"Authorization": "Bearer " + req.cookies["token"], "x-li-format": "json"}
        }, function (err, httpResponse, body) {
            if (err) {
                next(err)
            } else {
                collection("people", function (peopleCollection) {
                    let linkedinProfile = JSON.parse(body);
                    peopleCollection.findOne({"_id": linkedinProfile.id}).then(function (results) {
                        let create = !(results && results._id);
                        let profile;
                        if (results) {
                            profile = new Profile(results.linkedinProfile, results.profileDate, results.wishes, results.skills, results.roles);
                        } else {
                            profile = new Profile(linkedinProfile);
                        }
                        profile.create = create;
                        res.render('profil', {"title": "innlogget", "profile": profile});

                    }).catch(function (err) {
                        console.log(err);
                    });

                });
            }
        })
    } else {
        res.redirect("/");
    }
});


router.get('/login',
    passport.authenticate('linkedin'),
    function (req, res) {

    });

router.get('/logout', function (req, res, next) {
    res.clearCookie("token");
    res.redirect("/");
});


router.get('/callback', function (req, res, next) {
    let formData = {
        "grant_type": "authorization_code",
        "code": req.query.code,
        "redirect_uri": config.callback,
        "client_id": config.client,
        "client_secret": config.secret
    };

    request.post({
        "url": 'https://www.linkedin.com/oauth/v2/accessToken',
        "form": formData
    }, function (err, httpResponse, body) {
        if (!err) {
            res.cookie("token", JSON.parse(body).access_token, {httpOnly: true});
            res.redirect("/profil");
        } else {
            next(err);
        }

    });
});

router.post('/lagre', function (req, res, next) {
    if (req.cookies["token"]) {
        let people = [];
        request.get({
            "url": linkedinLookupUrl,
            "headers": {"Authorization": "Bearer " + req.cookies["token"], "x-li-format": "json"}
        }, function (err, httpResponse, body) {
            if (err) {
                next(err)
            } else {
                let linkedinProfile = JSON.parse(body);
                let profile;
                let roles = [];
                for (let field in req.body) {
                    if (field.indexOf("role_") !== -1) {
                        roles.push(field);
                    }
                }
                let skills = [];
                for (let field in req.body) {
                    if (field.indexOf("skill_") !== -1) {
                        skills.push(field);
                    }
                }

                if (isDate(req.body.date)) {
                    profile = new Profile(linkedinProfile, req.body.date, sanitizeHtml(req.body.wishes), skills, roles);
                    profile.id = linkedinProfile.id;
                    collection("people", function (peopleCollection) {
                        peopleCollection.updateOne({"_id": profile.id}, {$set: profile}, {"upsert": true}).then(function (err, results) {
                            res.redirect("/profil")
                        }).catch(function (err) {
                            console.log(err);
                        });
                    });
                } else {
                    next(new Error("Problem storing profile."))
                }

            }
        })
    }
});

router.post('/lagreOppdrag', function (req, res, next) {
    if (req.cookies["token"]) {
        let people = [];
        request.get({
            "url": linkedinLookupUrl,
            "headers": {"Authorization": "Bearer " + req.cookies["token"], "x-li-format": "json"}
        }, function (err, httpResponse, body) {
            if (err) {
                next(err)
            } else {
                let linkedinProfile = JSON.parse(body);
                let assignment;
                let roles = [];
                for (let field in req.body) {
                    if (field.indexOf(("role_"))) {
                        roles.push(req.body[field]);
                    }
                }
                let skills = [];
                for (let field in req.body) {
                    if (field.indexOf(("skill_"))) {
                        skills.push(req.body[field]);
                    }
                }

                let buzzwords = [];
                for (let field in req.body) {
                    if (field.indexOf(("buzzword_"))) {
                        buzzwords.push(req.body[field]);
                    }
                }
                assignment = new Assignment(false, req.body.company, req.body.deadline, req.body.location, sanitizeHtml(req.body.description), skills, roles, buzzwords);
                assignment.id = linkedinProfile.id;

                collection("work", function (workCollection) {
                    workCollection.updateOne({"_id": assignment.id}, {$set: assignment}, function (err, result) {
                        res.redirect("/oppdrag")
                    }, {"upsert": true});
                });

            }
        })
    }
});

router.post('/slett', function (req, res, next) {
    request.get({
        "url": linkedinLookupUrl,
        "headers": {"Authorization": "Bearer " + req.cookies["token"], "x-li-format": "json"}
    }, function (err, httpResponse, body) {
        let profileDto = JSON.parse(body);
        collection("people", function (peopleCollection) {
            peopleCollection.deleteOne({"id": profileDto.id}, function (err, result) {
                res.clearCookie("token");
                res.redirect("/")
            });
        });
    });
});


let isDate = function (date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
};

module.exports = router;
