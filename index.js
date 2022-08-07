const express = require('express');
const bodyParser = require('body-parser');
const Airtable = require('airtable');
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'key7pJTgcAbXkgfht'
});
const base = Airtable.base('app2Av0Era0430yTJ');
const baseArticles = 'Article';
const baseCategories = 'Category';

const PORT = 5000;

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Methods', 'GET,POST,DELETE');
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

// Get categories
app.get("/api/v1/blog/categories", (req, res) => {
    base(baseCategories).select({
        view: 'Grid view'
    }).firstPage(async (err, records) => {
        if (err) {
            res.status(500).json({
                message: 'Something went wrong'
            });
            return;
        }
        const categories = records.map((record) => record.fields.Category);
        res.status(200).json({
            message: "Categories successfully fetched!",
            data: categories
        });
    });
});

// Get all posts
app.get('/api/v1/blog/posts', async (req, res) => {
    base(baseArticles).select({
        view: 'Grid view',
        fields: ["Title", "Slug", "Description", "Category", "Platform"],
        filterByFormula: `{Status} = 'Published'`
    }).firstPage((err, records) => {
        if (err) {
            res.status(500).json({
                message: 'Something went wrong'
            });
            return;
        }
        const posts = records.map((record) => Object.fromEntries(Object.entries(record.fields).map(([key, value]) => [`${key[0].toLowerCase()}${key.slice(1)}`, value])));
        res.status(200).json({
            message: 'Good job, you have found all posts!',
            data: posts,
            counter: posts.length
        });
    });
});

// Get one post
app.get('/api/v1/blog/posts/:friendly', async (req, res) => {
    const postId = req.params.friendly;
    if(postId) {
        await base(baseArticles).select({
            view: 'Grid view',
            filterByFormula: `{Slug} = '${postId}'`,
            fields: ["Title", "Category", "Platform", "Content"]
        }).firstPage((err, records) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    message: 'Something went wrong'
                });
                return;
            }
            const posts = records.map((record) => record.fields);
            const post = Object.fromEntries(Object.entries(posts[0]).map(([key, value]) => [`${key[0].toLowerCase()}${key.slice(1)}`, value]));
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

// // Create new post
// app.post('/api/v1/blog/posts', async (req, res) => {
//     const data = await req.body;
//     if(!data.title || !data.description || !data.category || !data.content) {
//         res.status(400).json({
//             message: 'Please provide all required fields',
//             required: ['title', 'description', 'category', 'friendly', 'content'],
//             optional: ['date']
//         });
//     } else {
//         const { title, description, category, friendly, content, isPlanned } = data;
//         await base(baseCategories).select({
//             view: 'Grid view'
//         }).firstPage(async (err, records) => {
//             if (err) {
//                 res.status(500).json({
//                     message: 'Something went wrong'
//                 });
//             }
//             const categories = records.map((record) => record.fields.Name);
//             if(!categories.includes(category)) {
//                 res.status(400).json({
//                     message: 'There\'s no such category!',
//                     available: categories
//                 });
//                 return;
//             }
//             try {
//                 const cleanTitle = title.trim().replaceAll('!', '').replaceAll('?', '');
//                 const generatedUrl = cleanTitle.replace(/\s/g, '-').toLowerCase();
//                 const chosenFriendlyURL = friendly || generatedUrl;
//
//                 await base(baseArticles).create(
//                     {
//                         "Title": title,
//                         "Category": category,
//                         "Friendly-url": chosenFriendlyURL,
//                         "Description": description,
//                         "Content": content,
//                         "IsPlanned": isPlanned ? "true" : 'false'
//                     }
//                     , (err) => {
//                         if (err) {
//                             console.error(err);
//                         }
//                     });
//                 res.status(201).json({
//                     message: 'Post created successfully',
//                     isPlanned: !!isPlanned,
//                     data: {
//                         title,
//                         description,
//                         category,
//                         friendly: chosenFriendlyURL,
//                         content
//                     }
//                 });
//             } catch (error) {
//                 res.status(500).json({
//                     message: 'Post not created',
//                     error
//                 });
//             }
//         });
//     }
// });

// app.delete('/api/v1/blog/posts/:id', async (req, res) => {
//     const postId = req.params.id;
//     if(postId) {
//         await base(baseArticles).destroy(postId, (err) => {
//             if (err) {
//                 res.status(500).json({
//                     message: 'Something went wrong'
//                 });
//                 return;
//             }
//             res.status(200).json({
//                 message: 'Post deleted successfully'
//             });
//         });
//     } else {
//         res.status(404).json({
//             message: 'Post not found!'
//         });
//     }
// });

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