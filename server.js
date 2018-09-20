const express = require('express');
const app = express();
const UserController = require('./router/user');
const CommentController = require('./router/comment');
const PostController = require('./router/post');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/go-gram');
const port = process.env.PORT || 3000;
app.use('/uploads', express.static('./uploads/'));
app.use('/post-image', express.static('./post-image/'));

app.use('/api/posts', PostController);
app.use('/api/users', UserController);
app.use('/api/comments', CommentController);
app.listen(port, function() {
  console.log(`Express server listening on port ${port}`);
});