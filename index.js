const express = require('express');
const mongoose = require('mongoose');
const Post = require('./schemas/Post');
const bodyParser = require('body-parser');

const PORT = 3000;

const dbUrl = 'mongodb+srv://dbUser:OoNSMgEwyrzj7aSw@cluster0.r3lus.mongodb.net/blog?retryWrites=true&w=majority';
mongoose.connect(dbUrl, {
    useNewUrlParser: true
}, () => {
    console.log('Connected to database');
});

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Methods', 'GET,POST');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Easter egg
app.get('/fedex', (req, res) => {
  res.status(200).json({message: 'Good job, you have found easter eeg! ~FedEx'});
});

// --- API for my BLOG ---

// Introduction
app.get('/api/v1/blog', (req, res) => {
  res.status(200).json({
      message: 'Good job, you have found API for my blog!'
  });
});

// Get all posts
app.get('/api/v1/blog/posts', async (req, res) => {
    const posts = await Post.find({});
    res.status(200).json({
        message: 'Good job, you have found all posts!',
        data: posts,
        counter: posts.length
    });
});

// Get one post
app.get('/api/v1/blog/posts/:id', (req, res) => {
    const postId = req.params.id;
    if(postId) {
        const post = Post.find({
            friendly: postId
        })
        res.status(200).json({
            message: 'Good job, you have found one post!',
            searched_by: postId,
            data: post
        });
    } else {
        res.status(404).json({
            message: 'Post not found!'
        });
    }
});

// Create new post
app.post('/api/v1/blog/posts', async (req, res) => {
    const data = await req.body;
    if(!data.title || !data.description || !data.category || !data.friendly) {
        res.status(400).json({
            message: 'Please provide all required fields',
            required: ['title', 'description', 'category', 'friendly'],
            optional: ['date']
        });
    } else {
        const { title, description, category, date, friendly } = data;
        const post = new Post({
            title,
            description,
            category,
            date,
            friendly
        });
        try {
            const createdPost = await post.save();
            res.status(201).json({
                message: 'Post created successfully',
                data: createdPost
            });
        } catch (error) {
            res.status(500).json({
                message: 'Post not created',
                error
            });
        }
    }
});

// --- Default responses ---

app.get('*', (req, res) => {
    res.status(404).json({message: `There\'s no endpoint like that!`, path: req.path, method: req.method});
});

app.post('*', (req, res) => {
    res.status(404).json({message: `There\'s no endpoint like that!`, path: req.path, method: req.method});
});

// Listen on port 3000
app.listen(PORT, () => {
  console.log(`API is now listening on port ${PORT}!`);
});