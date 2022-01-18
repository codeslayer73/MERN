const express = require('express');// connect to the express module
const router = express.Router(); // create a router object
const gravatar = require('gravatar');// connect to the gravatar module
const bcrypt = require('bcryptjs');// connect to the bcryptjs module
const jwt = require('jsonwebtoken');// connect to the jsonwebtoken module
const config = require('config');// connect to the config module

const User = require('../../model/user'); // connect to the user model

const { check, validationResult } = require('express-validator'); // connect to the express-validator module

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email id').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
],// check the name, email and password fields are not empty and the password has atleast 6 characters
async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }// if there are errors, return the errors in the response

    const { name, email, password } = req.body;// get the name, email and password from the request body

    try{
        let user = await User.findOne({email});// check if the user already exists

        if(user){
           return res.status(400).json({errors: [{msg: 'User already exists'}]});
        }// if the user already exists, return the error in the response

        const avatar = gravatar.url(email,{
            s:'200',
            r: 'pg',
            d: 'mm'
        })   // create a gravatar url

        user = new User(
            {
                name,
                email,
                avatar,
                password
            }
        );// create a new user object


        const salt = await bcrypt.genSalt(10); // generate a salt for the password

        user.password = await bcrypt.hash(password, salt); // hash the password

        await user.save(); // save the user to the database

        const payload = {
            user: {
                id: user.id
            }
        };// create a payload object

        jwt.sign(
            payload, 
            config.get('jwtSecret'), 
            { expiresIn: 360000 }, 
            (err, token) => {
                if(err) throw err;// if there is an error, throw the error
                res.json({ token });// return the token in the response
        }
        );

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    } // catch any errors


    
});
module.exports = router; // export the router