const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All books route
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
        res.redirect('/')
    }
})

// New book route
router.get('/new', async (req, res) =>{

    renderNewPage(res, new Book())
})

//Create book route
router.post('/', async (req, res) =>{
    const book = new Book({
        title: req.body.title,
        publishDate: req.body.publishDate,
        author: req.body.selectAuthor,
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        res.redirect(`books`)
    } catch {
        renderNewPage(res, book, true)
    }
})



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

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', { book: book })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch {
        res.redirect('/')
    }
})

router.put('/:id', async (req, res) => {
    let book
  
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch {
        if (book != null) {
            renderEditPage(res, book, true)
        } 
        else {
            redirect('/')
        } 
    }
})

router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.deleteOne()
        res.redirect('/books')
    } catch (error) {
        console.log(error)
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)
}
  
async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}
  
async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Book'
            } 
            else {
                params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`books/${form}`, params)
    } catch {
        res.redirect('/books')
    }
}


function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router