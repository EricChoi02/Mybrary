const mongoose = require('mongoose')
const Book = require('../models/book.js')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('deleteOne', async function(next){
    try {
        const books = await Book.find({ author: this._conditions._id }).limit(6).exec()
        if (books.length > 0) {
            next(new Error('This author has books still'))
        } else {
            next()
        }
    } catch (error) {
        next(error)
    }
})


module.exports = mongoose.model('Author', authorSchema)