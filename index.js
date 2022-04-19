const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'key7pJTgcAbXkgfht'
});
const base = Airtable.base('app4AttrWnY2xBs1I');

const PORT = 3000;

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
  res.status(200).json({message: 'Good job, you have found easter eeg! ~JakubLog'});
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
    base('Table 1').select({
        view: 'Grid view'
    }).firstPage((err, records) => {
        if (err) {
            res.status(500).json({
                message: 'Something went wrong'
            });
        }
        const posts = records.map((record) => record.fields);
        res.status(200).json({
            message: 'Good job, you have found all posts!',
            data: posts,
            counter: posts.length
        });
    });
});

// Get one post
app.get('/api/v1/blog/posts/:id', async (req, res) => {
    const postId = req.params.id;
    if(postId) {
        await base('Table 1').select({
            view: 'Grid view',
            filterByFormula: `{Friendly-url} = '${postId}'`
        }).firstPage((err, records) => {
            if (err) {
                res.status(500).json({
                    message: 'Something went wrong'
                });
            }
            const posts = records.map((record) => record.fields);
            const post = Object.fromEntries(Object.entries(posts[0]).map(([key, value]) => [key.toLowerCase(), value]));
            res.status(200).json({
                message: 'Good job, you have found one post!',
                searched_by: postId,
                data: post
            });
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
    if(!data.title || !data.description || !data.category || !data.friendly || !data.content) {
        res.status(400).json({
            message: 'Please provide all required fields',
            required: ['title', 'description', 'category', 'friendly', 'content'],
            optional: ['date']
        });
    } else {
        const { title, description, category, friendly, content } = data;
        if(!["Programowanie", "Rozwojowe", "Bezpieczeństwo w sieci"].includes(category)) {
            res.status(400).json({
                message: 'There\'s no such category!',
                available: ["Programowanie", "Rozwojowe", "Bezpieczeństwo w sieci"]
            });
            return;
        }
        try {
            await base('Table 1').create(
                {
                        "Title": title,
                        "Category": category,
                        "Friendly-url": friendly,
                        "Description": description,
                        "Content": content
                }
                , (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            res.status(201).json({
                message: 'Post created successfully'
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