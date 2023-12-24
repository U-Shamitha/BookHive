const router = require("express")()
const multer = require("multer");
const fs = require("fs");
const { BookModel } = require("../models/book")

//Image upload
const dStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    fs.mkdirSync(uploadPath, { recursive: true }); // Create 'uploads' directory
    cb(null, uploadPath); // Set the destination folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Set the filename
  },
});
const upload = multer({
  storage: dStorage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type. Only images are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit, adjust as needed
  },
})

router.get("/", async (req, res, next) => {
  try {
    const books = await BookModel.find({})
    return res.status(200).json({
      books: books.map((book) => ({
        ...book.toJSON(),
        availableQuantity: book.quantity - book.borrowedBy.length,
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.get("/:bookIsbn", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.params.bookIsbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    return res.status(200).json({
      book: {
        ...book.toJSON(),
        availableQuantity: book.quantity - book.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post("/", upload.fields([{ name: 'bookImg', maxCount: 1 }]), async (req, res, next) => {
  console.log(req.body);
  console.log(req.files['bookImg'][0]);
  console.log(req.files[0])
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book != null) {
      return res.status(400).json({ error: "Book with same ISBN already found" })
    }

    if (req.body.priceHistory) {
      req.body.priceHistory = req.body.priceHistory.map(JSON.parse);
    }
  
    if (req.body.quantityHistory) {
      req.body.quantityHistory = req.body.quantityHistory.map(JSON.parse);
    }
  
    const newBook = new BookModel(req.body);
    // If an image is provided, add it to the new book object
    if (req.files['bookImg'][0]) {
      newBook.image = {
        data: fs.readFileSync(req.files['bookImg'][0].path).toString('base64'),
        name: req.files['bookImg'][0].originalname,
        contentType: req.files['bookImg'].mimetype,
      };
    }
    await newBook.save();
    return res.status(200).json({ book: newBook })
  } catch (err) {
    next(err)
  }
})

router.patch("/:bookIsbn", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.params.bookIsbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    const { _id, isbn, ...rest } = req.body
    const updatedBook = await book.update(rest)
    return res.status(200).json({ book: updatedBook })
  } catch (err) {
    next(err)
  }
})

router.delete("/:bookIsbn", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.params.bookIsbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    await book.delete()
    return res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
})

module.exports = { router }
