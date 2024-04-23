const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeType = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeType.includes(file.mimetype))
    }
})

// All authors route
router.get('/', async (req, res) =>{
    let booksSet = Book.find()
    if (req.query.title != null && req.query.title != ''){
        booksSet = booksSet.regex('title', new RegExp(req.query.title,'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
        booksSet = booksSet.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
        booksSet = booksSet.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await booksSet.exec()
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    } catch {
        console.log(searchOptions)
        res.redirect('/')
    }
})

// New author route
router.get('/new', async (req, res) =>{

    renderNewPage(res, new Book())
})

//Create authors route
router.post('/',upload.single('cover'), async (req, res) =>{
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        publishDate: req.body.publishDate,
        author: req.body.selectAuthor,
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        res.redirect(`books`)
    } catch {
        if (book.coverImageName != null)
        {
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err=>{
        if (err) console.erroe(err)
    })
}

async function renderNewPage(res, book, hasError = false){
    try {
        const authors = await Author.find({})
        const params = {book: book, authors: authors}
        if (hasError) {
            params.errorMessage = 'Error Creating Book'
        }
        res.render('books/new', params)
    } catch (error) {
        res.redirect('/books')
    }
}

module.exports = router