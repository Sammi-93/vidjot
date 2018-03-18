const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

//Load user model.
require('../models/User');
const User = mongoose.model('users');


//login
router.get('/login', (req, res) => {
    res.render('users/login')
});

//Login post
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/register', (req, res) => {
    res.render('users/register')
});

//Register form post
router.post('/register', (req, res) => {
    let errors = [];
    if (req.body.password != req.body.confirmPassword) {
        errors.push({ text: 'Psswords do not match.' });
    }

    if (req.body.password.length < 4) {
        errors.push({ text: 'Passwords must be greater than 4 characters.' });
    }

    if (errors.length > 0) {
        res.render('users/register', {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
    } else {
        User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    req.flash('error_msg', 'You are already registered.');
                    res.redirect('/users/register');
                } else {
                    const newUser = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) {
                                throw err;
                            }
                            newUser.password = hash;

                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can login.');
                                    res.redirect('/users/login');
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        });
                    });

                }
            });
    }
});

//logout user
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out.')
    res.redirect('/users/login')
});


module.exports = router;