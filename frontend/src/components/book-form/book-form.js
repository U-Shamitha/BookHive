import React, { useState, useEffect } from "react"
import * as dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { useParams, useNavigate } from "react-router-dom"
import {
    Paper,
    Container,
    Button,
    TextField,
    FormGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Input,
    OutlinedInput
} from "@mui/material"
import { BackendApi } from "../../client/backend-api"
import classes from "./styles.module.css"
import { NotificationManager } from "react-notifications"

import { socket } from "../../App"
import { useUser } from "../../context/user-context"


dayjs.extend(utc)

export const BookForm = () => {
    const { bookIsbn } = useParams()
    const navigate = useNavigate()
    const [book, setBook] = useState({
        name: "",
        isbn: bookIsbn || "",
        bookImg:"",
        category: "",
        price: 0,
        quantity: 0,
        priceHistory: [],
        quantityHistory: [],
    })
    const [errors, setErrors] = useState({
        name: "",
        isbn: "",
        category: "",
        price: "",
        quantity: "",
    })
    const { isAdmin, user } = useUser()


    const sendRefreshRequest = () => {
        // Emit the borrow request to the server
        socket.emit('borrowRequest', user._id);
      };

    const isInvalid =
        book.name.trim() === "" || book.isbn.trim() === "" || book.category.trim() === ""

    const formSubmit = (event) => {
        event.preventDefault()
        if (!isInvalid) {
            if (bookIsbn) {
                const newPrice = parseInt(book.price, 10)
                const newQuantity = parseInt(book.quantity, 10)
                let newPriceHistory = [...book.priceHistory];
                let newQuantityHistory = [...book.quantityHistory];

                if (
                    newPriceHistory.length === 0 ||
                    newPriceHistory[newPriceHistory.length - 1].price !== newPrice
                ) {
                    newPriceHistory.push({ price: newPrice, modifiedAt: new Date().toLocaleString("en-Us", {timeZone:'Asia/Kolkata'}) })
                }
                if (
                    newQuantityHistory.length === 0 ||
                    newQuantityHistory[newQuantityHistory.length - 1].quantity !== newQuantity
                ) {
                    newQuantityHistory.push({ quantity: newQuantity, modifiedAt: new Date().toLocaleString("en-Us", {timeZone:'Asia/Kolkata'}) })
                }
                BackendApi.book
                    .patchBookByIsbn(bookIsbn, {
                        ...book,
                        priceHistory: newPriceHistory,
                        quantityHistory: newQuantityHistory,
                    })
                    .then(() => navigate(-1))
            } else {
                console.log(book)
                BackendApi.book
                    .addBook({
                        ...book,
                        priceHistory: [{ price: book.price, modifiedAt: dayjs().utc().format() }],
                        quantityHistory: [{ quantity: book.quantity, modifiedAt: dayjs().utc().format() }],
                    })
                    .then((res) => {
                        navigate("/")
                        const {book, error} = res
                        if(error){
                            NotificationManager.error(error)
                        }else{
                            NotificationManager.success("New Book Added Successfully")
                        }
                        sendRefreshRequest()
                    }
                    )
            }
        }
    }

    const updateBookField = (event) => {
        const field = event.target
        setBook((book) => ({ ...book, [field.name]: field.value }))
        console.log(book)
    }

    const validateForm = (event) => {
        const { name, value } = event.target
        if (["name", "isbn", "price", "quantity"].includes(name)) {
            setBook((prevProd) => ({ ...prevProd, [name]: value.trim() }))
            if (!value.trim().length) {
                setErrors({ ...errors, [name]: `${name} can't be empty` })
            } else {
                setErrors({ ...errors, [name]: "" })
            }
        }
        if (["price", "quantity"].includes(name)) {
            if (isNaN(Number(value))) {
                setErrors({ ...errors, [name]: "Only numbers are allowed" })
            } else {
                setErrors({ ...errors, [name]: "" })
            }
        }
    }

    useEffect(() => {
        // Listen for new borrow requests
        socket.on('newBorrowRequest', (data) => {
            BackendApi.book.getBookByIsbn(bookIsbn).then(({ book, error }) => {
                if (error) {
                    navigate("/")
                } else {
                    setBook(book)
                }
            })
        });
    
        // Clean up the event listener
        return () => {
          socket.off('newBorrowRequest');
        };
      }, []);

    useEffect(() => {
        if (bookIsbn) {
            BackendApi.book.getBookByIsbn(bookIsbn).then(({ book, error }) => {
                if (error) {
                    navigate("/")
                } else {
                    setBook(book)
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookIsbn])

    return (
        <>
            <Container component={Paper} className={classes.wrapper}>
                <Typography className={classes.pageHeader} variant="h5">
                    {bookIsbn ? "Update Book" : "Add Book"}
                </Typography>
                <form noValidate autoComplete="off" encType="multipart/form-data" onSubmit={formSubmit}>
                    <FormGroup>
                        <FormControl className={classes.mb2}>
                            <TextField
                                label="Name"
                                name="name"
                                required
                                value={book.name}
                                onChange={updateBookField}
                                onBlur={validateForm}
                                error={errors.name.length > 0}
                                helperText={errors.name}
                            />
                        </FormControl>
                        <FormControl className={classes.mb2}>
                            <TextField
                                label="ISBN"
                                name="isbn"
                                required
                                value={book.isbn}
                                onChange={updateBookField}
                                onBlur={validateForm}
                                error={errors.isbn.length > 0}
                                helperText={errors.isbn}
                            />
                        </FormControl>
                        <Typography pb={1}>Select Image</Typography>
                        <FormControl className={classes.mb2}>
                            <Input
                                type="file"
                                name="bookImg"
                                accept="image/*"
                                disableUnderline="true"
                                onChange={(e) =>  {console.log(e.target.files); setBook((book) => ({ ...book, 'bookImg': e.target.files[0] }))}}
                            />
                        </FormControl>
                        <FormControl className={classes.mb2}>
                            <InputLabel id="category">Category</InputLabel>
                            <Select labelId="category" name="category" value={book.category} onChange={updateBookField} input={
                                <OutlinedInput
                                    label="Category"
                                />
                                }
                            required>
                                <MenuItem value="Sci-Fi">Sci-Fi</MenuItem>
                                <MenuItem value="Action">Action</MenuItem>
                                <MenuItem value="Adventure">Adventure</MenuItem>
                                <MenuItem value="Horror">Horror</MenuItem>
                                <MenuItem value="Romance">Romance</MenuItem>
                                <MenuItem value="Mystery">Mystery</MenuItem>
                                <MenuItem value="Thriller">Thriller</MenuItem>
                                <MenuItem value="Drama">Drama</MenuItem>
                                <MenuItem value="Fantasy">Fantasy</MenuItem>
                                <MenuItem value="Comedy">Comedy</MenuItem>
                                <MenuItem value="Biography">Biography</MenuItem>
                                <MenuItem value="History">History</MenuItem>
                                <MenuItem value="Western">Western</MenuItem>
                                <MenuItem value="Literature">Literature</MenuItem>
                                <MenuItem value="Poetry">Poetry</MenuItem>
                                <MenuItem value="Philosophy">Philosophy</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl className={classes.mb2}>
                            <TextField
                                label="Price"
                                name="price"
                                required
                                value={book.price}
                                onChange={updateBookField}
                                onBlur={validateForm}
                                error={errors.price.length > 0}
                                helperText={errors.price}
                            />
                        </FormControl>
                        <FormControl className={classes.mb2}>
                            <TextField
                                label="Quantity"
                                name="quantity"
                                type="number"
                                value={book.quantity}
                                onChange={updateBookField}
                                onBlur={validateForm}
                                error={errors.quantity.length > 0}
                                helperText={errors.quantity}
                            />
                        </FormControl>
                    </FormGroup>
                    <div className={classes.btnContainer}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                                navigate(-1)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isInvalid}>
                            {bookIsbn ? "Update Book" : "Add Book"}
                        </Button>
                    </div>
                </form>
            </Container>
        </>
    )
}
