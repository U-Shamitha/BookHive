const router = require("express")()
const mongoose = require("mongoose");
const { BookModel } = require("../models/book")
const { UserModel } = require("../models/user")
const { BorrowDetailsModel } = require("../models/borrowDetails")

const omitPassword = (user) => {
  const { password, ...rest } = user
  return rest
}

router.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find({})
    return res.status(200).json({ users: users.map((user) => omitPassword(user.toJSON())) })
  } catch (err) {
    next(err)
  }
})

router.post("/borrow", async (req, res, next) => {
  console.log(req.body)
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    if (book.borrowedBy.length === book.quantity) {
      return res.status(400).json({ error: "Book is not available" })
    }
    const user = await UserModel.findById(req.body.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "You've already borrowed this book" })
    }
    const newBorrowDetail = await BorrowDetailsModel.create({borrower: user.id, borrowedOn: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' } ), borrowerName: user.username ,returnedOn: "", dueDate: req.body.dueDate})
    await book.update({borrowedBy2: [...book.borrowedBy2, newBorrowDetail ]})
    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post("/accept-borrow", async (req, res, next) => {
  try {
    console.log(req.body)
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    if (book.borrowedBy.length === book.quantity) {
      return res.status(400).json({ error: "Book is not available" })
    }
    const user = await UserModel.findById(req.body.userId)
    console.log("accepted user", user);
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "This user already borrowed this book" })
    }
    await BookModel.findOneAndUpdate(
      {
        isbn: req.body.isbn,
        // 'borrowedBy2.borrower': user._id,
        // 'borrowedBy2._id' : mongoose.Types.ObjectId(req.body.borrowReqId)
        // 'borrowedBy2.status' : "requested"
        borrowedBy2:{
        $elemMatch: {
          _id: mongoose.Types.ObjectId(req.body.borrowReqId)
        }
       }
      },
      {
        $set: {
          'borrowedBy2.$.status': "accepted",
          'borrowedBy2.$.borrowedOn' : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' } )
        }
     }
    )
    await book.update({ borrowedBy: [...book.borrowedBy, user.id] })
    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.post("/reject-borrow-req", async (req, res, next) => {
  try {
    console.log(req.body)
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    if (book.borrowedBy.length === book.quantity) {
      return res.status(400).json({ error: "Book is not available" })
    }
    const user = await UserModel.findById(req.body.userId)
    console.log("accepted user", user);
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "This user already borrowed this book" })
    }
    await BookModel.findOneAndUpdate(
      {
        isbn: req.body.isbn,
        borrowedBy2:{
        $elemMatch: {
          _id: mongoose.Types.ObjectId(req.body.borrowReqId)
        }
       }
      },
      {
        $set: {
          'borrowedBy2.$.status': "rejected",
          'borrowedBy2.$.bReqRejectedOn' : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' } )
        }
     }
    )
    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.post("/edit-borrow-req", async (req, res, next) => {
  try {
    console.log(req.body)
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    const user = await UserModel.findById(req.body.userId)
    console.log("accepted user", user);
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }

    await BookModel.findOneAndUpdate(
      {
        isbn: req.body.isbn,
        borrowedBy2:{
        $elemMatch: {
          _id: mongoose.Types.ObjectId(req.body.borrowReqId)
        }
       }
      },
      {
        $set: {
          'borrowedBy2.$.dueDate': req.body.dueDate,
          'borrowedBy2.$.borrowedOn' : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' } )
        }
     }
    )
    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.post("/delete-borrow-req", async (req, res, next) => {
  try {
    console.log(req.body)
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    const user = await UserModel.findById(req.body.userId)
    console.log("accepted user", user);
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }

    await BookModel.findOneAndUpdate(
      {
        isbn: req.body.isbn,
        borrowedBy2:{
        $elemMatch: {
          _id: mongoose.Types.ObjectId(req.body.borrowReqId)
        }
       }
      },
      {
        $pull: {
          borrowedBy2: {
            _id: mongoose.Types.ObjectId(req.body.borrowReqId)
          }
        }
     }
    )
    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
})

router.post("/return", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    const user = await UserModel.findById(req.body.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (!book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "You need to borrow this book first!" })
    }

    await BookModel.findOneAndUpdate(
      {
        isbn: req.body.isbn,
        borrowedBy2: {
          $elemMatch: {
            borrower: user.id,
            returnedOn: ""
          }
        }
      },
      {
        $set: {
          'borrowedBy2.$.returnReq': {reqDate: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' } ), status: 'requested'}
        }
     }
    )

    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post("/accept-return", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    const user = await UserModel.findById(req.body.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (!book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "You need to borrow this book first!" })
    }
    console.log("user.id", user.id)
    console.log("book.borrowedBy", book.borrowedBy)
    console.log(
      "filtered",
      book.borrowedBy.filter((borrowedBy) => !borrowedBy.equals(user.id))
    )
    await book.update({
      borrowedBy: book.borrowedBy.filter((borrowedBy) => !borrowedBy.equals(user.id)),
    })

    await BookModel.findOneAndUpdate(
      {
        isbn: req.body.isbn,
        borrowedBy2: {
          $elemMatch: {
            borrower: user.id,
            returnedOn: ""
          }
        }
      },
      {
        $set: {
          'borrowedBy2.$.returnedOn': new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' } ),
          'borrowedBy2.$.returnReq.status': 'accepted'
        }
     }
    )

    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post("/reject-return-req", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    const user = await UserModel.findById(req.body.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }

    await BookModel.findOneAndUpdate(
      {
        isbn: req.body.isbn,
        borrowedBy2: {
          $elemMatch: {
            borrower: user.id,
            returnedOn: ""
          }
        }
      },
      {
        $set: {
          'borrowedBy2.$.returnReq.rejectedOn': new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' } ),
          'borrowedBy2.$.returnReq.status': 'rejected'
        }
     }
    )

    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post("/delete-return-req", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    const user = await UserModel.findById(req.body.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }

    console.log("user.id", user.id)
    console.log("book.borrowedBy", book.borrowedBy)

    await BookModel.findOneAndUpdate(
      {
        isbn: req.body.isbn,
        borrowedBy2: {
          $elemMatch: {
            borrower: user.id,
            returnedOn: "",
            returnReq: { $exists: true }
          }
        }
      },
      {
        $unset: {
          "borrowedBy2.$.returnReq": 1
        }
      }
    )

    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.get("/borrowed-books", async (req, res, next) => {
  try {
    console.log(req.session)
    console.log("userId",req.session.userId)
    console.log("sessionId", req.sessionID)
    const result = await BookModel.find({ "borrowedBy": { "$in": req.session.userId } })
    return res.status(200).json({ books:  result.map((book) => ({
      ...book.toJSON(),
      availableQuantity: book.quantity - book.borrowedBy.length,
      })),
    })
  } catch (err) {
    next(err)
  }
})

router.get("/profile", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.session.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    return res.status(200).json({ user: omitPassword(user.toJSON()) })
  } catch (err) {
    next(err)
  }
})

router.post("/register", async (req, res, next) => {
  try {
    var user = await UserModel.findOne({ email: req.body.email })
    if (user == null) {
      user = await UserModel.create({ email: req.body.email, username: req.body.username, password: req.body.password, role: req.body.role })
      if(user == null){
        return res.status(400).json({ error: "Error in creating user" })
      }
    }else{
      return res.status(400).json({ error: "User already exist" })
    }
    console.log("user.id", user.id)
    req.session.userId = user.id
    return res.status(200).json({ user: omitPassword(user.toJSON()) })
  } catch (err) {
    next(err)
  }
})

router.post("/login", async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email })
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (user.password !== req.body.password) {
      return res.status(400).json({ error: "Invalid password" })
    }
    console.log("user.id", user.id)
    console.log(req.sessionID)
    req.session.userId = user.id
    console.log("login session", req.session)
    return res.status(200).json({ user: omitPassword(user.toJSON()) })
  } catch (err) {
    next(err)
  }
})

router.get("/logout", (req, res) => {
  req.session.destroy()
  return res.status(200).json({ success: true })
})

module.exports = { router }
