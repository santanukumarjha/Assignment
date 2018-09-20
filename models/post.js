'use strict';
const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
    createdBy: {
        type: 'string'
    },
    postDescription: {
        type: 'String'
    },
    postImage: {
        type: 'String'
    },
    createdOn: {
        type: 'Date',
        default: Date.now
    },
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }],
        default: []
    },
    like: {
        type: 'Number',
        default: 0
    }
});
mongoose.model('Post', PostSchema);

module.exports = mongoose.model('Post');