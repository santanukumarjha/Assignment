'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const VerifyToken = require('../middleware/VerifyToken');

const Post = require('../models/post');
const Comment = require('../models/comment');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.post('/', VerifyToken, (req, res) => {
    Comment.create({
        postId: req.body.postId,
        commentDescription: req.body.commentDescription
    }).then(result => {
        Post.findByIdAndUpdate(req.body.postId, { $push: { comments: result._id } }).then(updatedData => {
            res.status(200).send(updatedData);
        })

    }).catch(err => {
        res.status(401).send({
            message: 'Not Authenticated User',
            error: err
        })

    });
});
module.exports = router;