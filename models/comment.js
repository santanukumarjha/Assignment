'use strict';
const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    commentDescription: {
        type: 'String'
    },
    createdOn: {
        type: 'Date',
        default: Date.now
    }
});
mongoose.model('Comment', CommentSchema);

module.exports = mongoose.model('Comment');