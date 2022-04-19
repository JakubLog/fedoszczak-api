const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        content: {
            type: String,
            required: true
        },
        friendly: {
            type: String,
            required: true
        },
    }
);


module.exports = mongoose.model('posts', PostSchema);