'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const bodyParser = require('body-parser');
const VerifyToken = require('../middleware/VerifyToken');
const multer = require('multer');
const User = require('../models/user');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});
const config = require('../config');
const upload = multer({ storage: storage });

const jwt = require('jsonwebtoken');
router.post('/login',  (req, res) =>{
  User.findOne({ emailId: req.body.emailId }, function (err, user) {
    console.log('came here');
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    console.log('came here1');

    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    // if user is found and password is valid
    // create a token
    var token = jwt.sign({
      id: user._id
    },
      config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });

    res.status(200).send({ auth: true, token: token });
  });
});
router.post('/signup', upload.single('userImage'),  (req, res) =>{
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  User.create({
    userName: req.body.userName,
    emailId: req.body.emailId,
    password: hashedPassword,
    userImage: req.file.path
  },
    function (err, user) {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: `User ${req.body.userName} created successfully.` });
    });

});

router.put('/resetPassword', VerifyToken, (req, res) => {
  if (req.body.newPassword !== req.body.confirmPassword)
    return res.status(422).send({
      message: 'newPassword and confirm password is not same.'
    });
  var hashedPassword = bcrypt.hashSync(req.body.newPassword, 8);
  User.findByIdAndUpdate(req.userId, { password: hashedPassword }, { password: 0 }).exec()
    .then(result => {
      res.status(200).send({ result });
    }).catch(err => {
      res.status(401).send({
        message: 'Not Authenticated User'
      })
    });
});
router.get('/forgetPassword/:emailId', (req, res) =>{
  if (!req.params.emailId)
    return res.status(422).send('Please enter emailId');
  User.findOne({ emailId: req.params.emailId }, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    let token = jwt.sign({
      id: user._id
    },
      config.secret, {
        expiresIn: 900 // expires in 15 minutes
      });
    res.status(200).send({accessCode:token});

  });
});
// retrieve user based on userName.
router.get('/:userName',  (req, res) =>{
  User.findOne({ userName: req.params.userName }, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });
});
//retrieve all the user in database
router.get('/', (req, res) =>{
  User.find({}, { password: 0 }, function (err, users) {
    if (err) return res.status(500).send("There was a problem finding the users.");
    res.status(200).send(users);
  });
});
router.put('/:id',VerifyToken, (req, res)=>{
  if(!req.params.id)
    return res.status(422).send('User Id is mandatory for updating');
  User.findByIdAndUpdate({_id: req.params.id}, req.body)
  .then(result => {
    res.status(200).send('User updated Successfully.');
  })
  .catch(err=>{
    res.status(422).send(err);
  });
});
module.exports = router;