const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../model/user');
const jwt = require('jsonwebtoken');// connect to the jsonwebtoken module
const config = require('config');// connect to the config module
const { check, validationResult } = require('express-validator'); // connect to the express-validator module
const bcrypt = require('bcryptjs');// connect to the bcryptjs module


router.get('/', auth, async(req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/', [
    check('email', 'Please include a valid email id').isEmail(),
    check('password', 'Password is required').exists()
],// check the name, email and password fields are not empty and the password has atleast 6 characters
async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }// if there are errors, return the errors in the response

    const { email, password } = req.body;// get the name, email and password from the request body

    try{
        let user = await User.findOne({email});// check if the user already exists

        if(!user){
           return res.status(400).json({errors: [{msg: 'User not found!'}]});
        }// if the user already exists, return the error in the response


        const isMatch = await bcrypt.compare(password, user.password);// compare the password with the hashed password

        if(!isMatch){
            return res.status(400).json({errors: [{msg: 'User not found!'}]});
        }// if the password is not correct, return the error in the response

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
module.exports = router;