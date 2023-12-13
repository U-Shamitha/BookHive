import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom"
import {
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
} from "@mui/material"
import { NotificationManager } from "react-notifications"
import { BackendApi } from "../../client/backend-api"
import { useUser } from "../../context/user-context"
import { TabPanel } from "../tabs/tab"
import { makeChartOptions } from "./chart-options"
import classes from "./styles.module.css"

import io from 'socket.io-client';

const serverUrl = "https://bookhive-fe.onrender.com"
const socket = io(serverUrl);

export const Book = () => {
    const { bookIsbn } = useParams()
    const { user, isAdmin } = useUser()
    const navigate = useNavigate()
    const [book, setBook] = useState(null)
    const [chartOptions, setChartOptions] = useState(null)
    const [openTab, setOpenTab] = useState(0)

    const sendRefreshRequest = () => {
        // Emit the borrow request to the server
        console.log("emitting refresh req", user._id)
        socket.emit('borrowRequest', user._id);
      };

    const borrowBook = () => {
        if (book && user) {
            BackendApi.user
                .borrowBook(book.isbn, user._id)
                .then(({ book, error }) => {
                    if (error) {
                        NotificationManager.error(error)
                    } else {
                        setBook(book)
                        sendRefreshRequest()
                    }
                })
                .catch(console.error)
        }
    }

    const returnBook = () => {
        if (book && user) {
            BackendApi.user
                .returnBook(book.isbn, user._id)
                .then(({ book, error }) => {
                    if (error) {
                        NotificationManager.error(error)
                    } else {
                        setBook(book)
                        sendRefreshRequest()
                    }
                })
                .catch(console.error)
        }
    }

    useEffect(() => {
        // Listen for new borrow requests
        socket.on('newBorrowRequest', (data) => {
            BackendApi.book
                .getBookByIsbn(bookIsbn)
                .then(({ book, error }) => {
                    if (error) {
                        NotificationManager.error(error)
                    } else {
                        setBook(book)
                    }
                })
                .catch(console.error)
        });
    
        // Clean up the event listener
        return () => {
          socket.off('newBorrowRequest');
        };
      }, []);

    useEffect(() => {
        if (bookIsbn) {
            BackendApi.book
                .getBookByIsbn(bookIsbn)
                .then(({ book, error }) => {
                    if (error) {
                        NotificationManager.error(error)
                    } else {
                        setBook(book)
                    }
                })
                .catch(console.error)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookIsbn])

    return (
        book && (
            <div className={classes.wrapper}>
                <Typography variant="h5" align="center" style={{ marginBottom: 20 }}>
                    Book Details
                </Typography>
                <Card sx={{padding:'10px'}}>
                    <Tabs
                        value={openTab}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={(e, tabIndex) => {
                            setOpenTab(tabIndex)
                            if (book && tabIndex > 0) {
                                setChartOptions(
                                    makeChartOptions(
                                        tabIndex,
                                        tabIndex === 1 ? book.priceHistory : book.quantityHistory
                                    )
                                )
                            }
                        }}
                        centered
                    >
                        <Tab label="Book Details" tabIndex={0} />
                        <Tab label="Price History" tabIndex={1} />
                        <Tab label="Quantity History" tabIndex={2} />
                        <Tab label="Borrow History" tabIndex={3} />
                    </Tabs>

                    <TabPanel value={openTab} index={0}>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell variant="head" component="th" width="200">
                                            Name
                                        </TableCell>
                                        <TableCell>{book.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" component="th">
                                            ISBN
                                        </TableCell>
                                        <TableCell>{book.isbn}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" component="th">
                                            Category
                                        </TableCell>
                                        <TableCell>{book.category}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" component="th">
                                            Quantity
                                        </TableCell>
                                        <TableCell>{book.quantity}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" component="th">
                                            Available
                                        </TableCell>
                                        <TableCell>{book.availableQuantity}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" component="th">
                                            Price
                                        </TableCell>
                                        <TableCell>${book.price}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </TabPanel>

                    <TabPanel value={openTab} index={3}>
                        <CardContent>
                            <Table>
                                <TableHead>
                                    <TableCell>Borrower</TableCell>
                                    <TableCell>Borrowed On</TableCell>
                                    <TableCell>Returned On</TableCell>
                                </TableHead>
                                <TableBody>
                                    {book.borrowedBy2.map((borrowDetail) =>
                                    (borrowDetail.status=='accepted') ?
                                        <TableRow>                                            
                                            <TableCell>{borrowDetail['borrowerName']}</TableCell>
                                            <TableCell>{borrowDetail['borrowedOn']}</TableCell>
                                            <TableCell>{borrowDetail['returnedOn']}</TableCell>
                                        </TableRow>
                                    :
                                    null
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </TabPanel>

                    <TabPanel value={openTab} index={1}>
                        <CardContent>
                            {book && book.priceHistory.length > 0 ? (
                                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                            ) : (
                                <h3>No history found!</h3>
                            )}
                        </CardContent>
                    </TabPanel>

                    <TabPanel value={openTab} index={2}>
                        <CardContent>
                            {book && book.quantityHistory.length > 0 ? (
                                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                            ) : (
                                <h3>No history found!</h3>
                            )}
                        </CardContent>
                    </TabPanel>

                    <CardActions disableSpacing>
                        <div className={classes.btnContainer}>
                            {isAdmin ? (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    component={RouterLink}
                                    to={`/admin/books/${bookIsbn}/edit`}
                                >
                                    Edit Book
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        onClick={borrowBook}
                                        disabled={book && user && (book.borrowedBy.includes(user._id) || book.borrowedBy2.some(borrowDetails => borrowDetails.borrower === user._id && (borrowDetails.status == 'requested' || borrowDetails.returnedOn == '')))}
                                    >
                                        Request Borrow
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={returnBook}
                                        disabled={book && user && book.borrowedBy.includes(user._id) && book.borrowedBy2.some(borrowDetails => borrowDetails.borrower==user._id && borrowDetails.returnReq.status=='requested')}
                                    >
                                        Request Return
                                    </Button>
                                </>
                            )}
                            <Button type="submit" variant="text" color="primary" onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                        </div>
                    </CardActions>
                </Card>
            </div>
        )
    )
}