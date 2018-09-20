'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const VerifyToken = require('../middleware/VerifyToken');
const multer = require('multer');
const Post = require('../models/post');
const User = require('../models/user');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './post-image/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});
const upload = multer({ storage: storage });
// Route will create Post
router.post('/', VerifyToken, upload.single('postImage'), (req, res) => {
    User.findById(req.userId)
        .then(user => {
            Post.create({
                createdBy: user.userName,
                postDescription: req.body.postDescription,
                postImage: req.file.path
            },
                function (err, user) {
                    if (err) return res.status(500).send("Problem creating post`.");
                    res.status(200).send({ message: `Post created successfully.` });
                });
        }).catch(err => {
            res.status(401).send({
                message: 'Not Authenticated User'
            })
        });

});
// Route will like Post
router.put('/like', VerifyToken, (req, res) => {
    Post.findByIdAndUpdate(req.body.id, { $inc: { like: req.body.counter } })
        .then(result => {
            res.status(200).send('Post liked Succesfully');
        }).catch(err => {
            res.status(401).send({
                message: 'Not Authenticated User',
                error: err
            })
        });
});
//Route will get all the post, likes and comments .
router.get('/', VerifyToken, (req, res) => {
    User.findById(req.userId)
        .then(user => {
            Post.aggregate([
                { $match: { createdBy: user.userName }},
                {$addFields:{
                    totalLikes: {$sum: "$like"},
                    totalComments: {$sum: { "$size": "$comments" }},
                    totalPosts: {$sum: 1}
                }}])
                .then(result => {
                    const responseObject = {};
                    let totalLikes = 0;
                    let totalPosts = 0;
                    let totalComments = 0;
                    result.forEach(rec => {
                        totalLikes += rec.totalLikes;
                        totalPosts += rec.totalPosts;
                        totalComments += rec.totalComments;
                    })
                    responseObject.totalLikes = totalLikes;
                    responseObject.totalPosts = totalPosts;
                    responseObject.totalComments = totalComments;
                    res.status(200).send(responseObject);
                })
        }).catch(err => {
            res.status(401).send({
                message: 'Not Authenticated User',
                error: err
            })
        });
});
//Route will allow created user to delete the post .
router.delete('/:id', VerifyToken, (req, res) => {
    User.findById(req.userId).then(user => {
        Post.findOneAndDelete({ _id: req.params.id, createdBy: user.userName }, function (err, post) {
            if (err) 
                return res.status(500).send("There was a problem deleting the user.");
            if(!post)
                return res.status(500).send(`${user.userName} is not authorized to delete the post.`);
            res.status(200).send('Post deleted succesfully');
        });
    });

});
module.exports = router;