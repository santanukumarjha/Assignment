'use strict';
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    userName: {
        type: 'string',
        required: true,
        unique: true,
        index: true
    },
    emailId: {
        type: 'String',
        required: true,
        unique: true
    },
    password: {
        type: 'String',
        required: true
    },
    userImage: {
        type: 'String',
        required: true
    },
    createdOn: {
        type: 'Date',
        default: Date.now
    }
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');