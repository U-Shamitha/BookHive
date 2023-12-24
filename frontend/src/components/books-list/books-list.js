import { useState, useEffect, useRef } from "react"
import { Link as RouterLink, resolvePath } from "react-router-dom"
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check"
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Card,
  CardContent,
  CardActions,
  Typography,
  TablePagination,
  Container,
  TextField,
  IconButton,
  AppBar,
  Tabs,
  Tab,
} from "@mui/material"
import { BackendApi } from "../../client/backend-api"
import { useUser } from "../../context/user-context"
import classes from "./styles.module.css"

import { socket } from "../../App"
import SearchBar from "../searchBar/searchBar"
import { BorrowReqForm } from "./borrowReq-form/borrowReqForm";
import { TabPanel } from "../tabs/tab";

export const BooksList = () => {
  const [books, setBooks] = useState([])
  const [borrowedBook, setBorrowedBook] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [activeBookIsbn, setActiveBookIsbn] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const { isAdmin, user } = useUser()
  const [activeTab, setActiveTab] = useState("book-list")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const count = { bReq: 0, rReq: 0, bBook: 0 }
  const [filteredBooks, setFilteredBooks] = useState([])
  const [openBreqDialog, setOpenBreqDialog] = useState(false)
  const [rReqTab, setRreqTabValue] = useState(0);
  const [bReqTab, setBreqTabValue] = useState(0);


  const handleRreqTabChange = (event, newValue) => {
    setRreqTabValue(newValue);
  };

  const handleBreqTabChange = (event, newValue) => {
    setBreqTabValue(newValue);
  };

  const handleBreqSubmit = (isbn, userId, borrowReqId, dueDate) => {
    console.log({isbn, userId, borrowReqId, dueDate})
    BackendApi.user.editBorrowReq(isbn, userId, borrowReqId, dueDate)
    .then(()=>
     {setOpenBreqDialog(false);
     fetchBooks().catch(console.error);
     sendRefreshRequest()}
     )
}

const handleBreqClose = () => {
    setOpenBreqDialog(false)
}

  const sendRefreshRequest = () => {
    // Emit the borrow request to the server
    socket.emit("borrowRequest", user._id)
  }

  const fetchBooks = async () => {
    const { books } = await BackendApi.book.getAllBooks()
    setBooks(books)
    setLoading(false)
  }

  const deleteBook = () => {
    if (activeBookIsbn && books.length) {
      BackendApi.book.deleteBook(activeBookIsbn).then(({ success }) => {
        fetchBooks().catch(console.error)
        setOpenModal(false)
        setActiveBookIsbn("")
        sendRefreshRequest()
      })
    }
  }

  const acceptBorrow = async (isbn, userId, borrowReqId) => {
    await BackendApi.user.acceptBorrow(isbn, userId, borrowReqId).then(({ success }) => {
      fetchBooks().catch(console.error)
      sendRefreshRequest()
    })
  }

  const rejectBorrowReq = async (isbn, userId, borrowReqId) => {
    await BackendApi.user.rejectBorrowReq(isbn, userId, borrowReqId).then(({ success }) => {
      fetchBooks().catch(console.error)
      sendRefreshRequest()
    })
  }

  const deleteBorrowReq = async(isbn, userId, borrowReqId) => {
    await BackendApi.user.deleteBorrowReq(isbn, userId, borrowReqId).then(({ success }) => {
      fetchBooks().catch(console.error)
      sendRefreshRequest()
    })
  }

  const acceptReturn = async (isbn, userId, borrowReqId) => {
    await BackendApi.user.acceptReturn(isbn, userId, borrowReqId).then(({ success }) => {
      fetchBooks().catch(console.error)
      sendRefreshRequest()
    })
  }

  const rejectReturnReq = async (isbn, userId, borrowReqId) => {
    await BackendApi.user.rejectReturnReq(isbn, userId, borrowReqId).then(({ success }) => {
      fetchBooks().catch(console.error)
      sendRefreshRequest()
    })
  }

  const deleteReturnReq = async(isbn, userId, returnReqId) => {
    await BackendApi.user.deleteReturnReq(isbn, userId, returnReqId).then(({ success }) => {
      fetchBooks().catch(console.error)
      sendRefreshRequest()
    })
  }

  const differenceInDays= (borrowedDate, dueDate) =>{

    const startDateTime = new Date(borrowedDate);
    const endDateTime = new Date(dueDate);

    // Calculate the time difference in milliseconds
    const timeDifference = endDateTime - startDateTime;

    // Convert milliseconds to days
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference+1
  }


  useEffect(() => {
    // Listen for changes
    socket.on("newBorrowRequest", (data) => {
      fetchBooks().catch(console.error)
    })

    // Clean up the event listener
    return () => {
      socket.off("newBorrowRequest")
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchBooks().catch(console.error)
  }, [user])

  useEffect(()=>{
    setLoading(true)
    var filtered = books;
    if(searchTerm!=""){
      filtered = books.filter((book) =>
      Object.values(book).some(
        (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    }
    setFilteredBooks(filtered)
    setLoading(false)
  }, [searchTerm, books])

  return (
    <div style={{ width: "90%", margin: "auto" }}>
      <div className={`${classes.pageHeader} ${classes.mb2}`}  
       style={{
        display: 'flex',
        gap: '40px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      >
          <Typography
            variant="h5"
            style={{ cursor: "pointer" }}
            color={activeTab == "book-list" ? "blue" : "black"}
            onClick={() => setActiveTab("book-list")}
          >
            Book List
          </Typography>
          {user && !isAdmin && (
            <Typography
              variant="h5"
              style={{ cursor: "pointer" }}
              color={activeTab == "borrowed-books" ? "blue" : "black"}
              onClick={() => setActiveTab("borrowed-books")}
            >
              Borrowed Books
            </Typography>
          )}
          {user && (
            <Typography
              variant="h5"
              style={{ cursor: "pointer" }}
              color={activeTab == "borrow-requests" ? "blue" : "black"}
              onClick={() => setActiveTab("borrow-requests")}
            >
              Borrow Requests
            </Typography>
          )}
          {user && (
            <Typography
              variant="h5"
              style={{ cursor: "pointer" }}
              color={activeTab == "return-requests" ? "blue" : "black"}
              onClick={() => setActiveTab("return-requests")}
            >
              Return Requests
            </Typography>
          )}
          <SearchBar sendSearchTerm={setSearchTerm} />
          {isAdmin && (
          <Button variant="contained" color="primary" component={RouterLink} to="/admin/books/add">
            Add Book
          </Button>
        )}
      </div>
      {!loading ? (
        <>
          {activeTab == "book-list" &&
            (filteredBooks.length > 0 ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    columnGap: "20px",
                  }}
                >
                  {filteredBooks.map((book) => (
                    <div key={book._id}>
                      <Container
                        width="100px"
                        height="100px"
                        component={Paper}
                        style={{
                          margin: "10px",
                          paddingTop: "5px",
                          paddingBottom: "15px",
                          minWidth: "250px",
                          flexShrink: "0",
                        }}
                      >
                        <div>
                          <div>
                            <p
                              style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}
                            >
                              {book.name}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignContent: "start",
                              }}
                            >
                              <div>
                                <p>{book.isbn}</p>
                                <p>Quantity: {book.quantity}</p>
                                <p>Available: {book.availableQuantity}</p>
                                <p>Price: ${book.price}</p>
                              </div>
                              {book.image && book.image.data && (
                                <img
                                  style={{ height: "120px", alignSelf: "center" }}
                                  src={`data:image/png;base64,${book.image.data}`}
                                ></img>
                              )}
                            </div>
                          </div>
                          <div className={classes.actionsContainer} style={{ padding: "10px 0px" }}>
                            <Button
                              variant="contained"
                              component={RouterLink}
                              size="small"
                              to={`/books/${book.isbn}`}
                            >
                              View
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  component={RouterLink}
                                  size="small"
                                  to={`/admin/books/${book.isbn}/edit`}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  size="small"
                                  onClick={(e) => {
                                    setActiveBookIsbn(book.isbn)
                                    setOpenModal(true)
                                  }}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Container>
                    </div>
                  ))}
                  <Modal open={openModal} onClose={(e) => setOpenModal(false)}>
                    <Card className={classes.conf_modal}>
                      <CardContent>
                        <h2>Are you sure?</h2>
                      </CardContent>
                      <CardActions className={classes.conf_modal_actions}>
                        <Button variant="contained" onClick={() => setOpenModal(false)}>
                          Cancel
                        </Button>
                        <Button variant="contained" color="secondary" onClick={deleteBook}>
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Modal>
                </div>
              </>
            ) : (
              <Typography variant="h5">No books found!</Typography>
            ))}

          {/* List of borrow requests */}
          {activeTab=="borrow-requests" && 
          <div style={{margin:'10px', marginBottom:'20px'}}>
            <AppBar position="static" style={{ background: 'white', color: 'black', width:'fit-content' }}>
              <Tabs value={bReqTab} onChange={handleBreqTabChange}>
                <Tab label="Recent" style={{ color: bReqTab === 0 ? 'blue' : 'black' }} />
                <Tab label="History" style={{ color: bReqTab === 1 ? 'blue' : 'black' }} />
              </Tabs>
            </AppBar>
          </div>}
          {user && isAdmin && activeTab == "borrow-requests" && filteredBooks.length > 0 && (
            <>
              { bReqTab==0 ?
                <>
                  {filteredBooks.map((book) => {
                    if (
                      book.borrowedBy2.some((borrowDetails) => borrowDetails.status == "requested")
                    ) {
                      count.bReq += 1
                      return (
                        <Container
                          height="100px"
                          component={Paper}
                          style={{
                            margin: "10px",
                            padding: "20px",
                            minWidth: "250px",
                            flexShrink: "0",
                            width: "800px",
                          }}
                        >
                          <h2>{`${book.name} - ${book.availableQuantity} left`}</h2>
                          <TableHead>
                            <TableCell>User Name</TableCell>
                            <TableCell>Requested On</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Accept Request</TableCell>
                            <TableCell>Reject Request</TableCell>
                          </TableHead>
                          {book.borrowedBy2.map((borrowDetails) =>
                            borrowDetails.status == "requested" ? (
                              <TableRow>
                                <TableCell>{borrowDetails.borrowerName}</TableCell>
                                <TableCell>{borrowDetails.borrowedOn}</TableCell>
                                <TableCell>{borrowDetails.dueDate}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      acceptBorrow(
                                        book.isbn,
                                        borrowDetails.borrower,
                                        borrowDetails._id
                                      )
                                    }
                                  >
                                    <CheckIcon/>
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() =>
                                      rejectBorrowReq(
                                        book.isbn,
                                        borrowDetails.borrower,
                                        borrowDetails._id
                                      )
                                    }
                                  >
                                    <ClearIcon/>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ) : null
                          )}
                        </Container>
                      )
                    }
                    return null
                  })}
                  {count.bReq == 0 && (
                    <Typography variant="h5" style={{padding:'20px'}}>No Borrow Requests Found!</Typography>
                  )}
                </> :
                <>
                  {/* Admin Borrow Req History */}
                  {books.some((book)=> book.borrowedBy2.some((borrowDetails)=> borrowDetails.status!="")) ?
                  <Container 
                    component={Paper}
                    style={{
                      margin: "10px",
                      marginTop: '20px',
                      padding: "20px",
                      minWidth: "250px",
                      flexShrink: "0",
                      width: 'fit-content',
                      // maxHeight: '600px',
                      // overflow: 'auto'
                    }}
                  >
                    <TableHead>
                      <TableCell>Book</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Requested On</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableHead>
              {filteredBooks.map((book) => {
                return book.borrowedBy2.slice().reverse().map(
                    (borrowDetails) =>
                    borrowDetails.status!="" && 
                    (<TableRow key={borrowDetails._id}>
                      <TableCell>{book.name}</TableCell>
                      <TableCell>{borrowDetails.borrowerName}</TableCell>
                      <TableCell>{borrowDetails.borrowedOn}</TableCell>
                      <TableCell>{borrowDetails.dueDate}</TableCell>
                      {borrowDetails.status=="accepted" && <TableCell><CheckIcon color="success" /></TableCell>}
                      {borrowDetails.status=="rejected" && <TableCell><ClearIcon color="error" /></TableCell>}
                    </TableRow>)
                   )
              })}
                  </Container>:
                  <Typography variant="h5" style={{padding:'20px'}}>No Borrow Request History Found!</Typography>
                  } 
                  
                </>
              }
            </>
          )}
          {user && !isAdmin && activeTab == "borrow-requests" && filteredBooks.length > 0 && (
            <>
              { bReqTab==0 ?
                <>
                  {filteredBooks.map((book) => {
                    if (
                      book.borrowedBy2.some(
                        (borrowDetails) =>
                          borrowDetails.borrower == user._id && borrowDetails.status == "requested"
                      )
                    ) {
                      count.bReq += 1
                      return (
                        <Container
                          height="100px"
                          component={Paper}
                          style={{
                            margin: "10px",
                            padding: "20px 40px",
                            minWidth: "250px",
                            flexShrink: "0",
                            maxWidth: "700px",
                            width:'650px'
                          }}
                        >
                          <h2
                            style={{ width: "fit-content !important" }}
                          >{`${book.name} - ${book.availableQuantity} left`}</h2>
                          <TableHead>
                            <TableCell>Requested On</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Edit</TableCell>
                            <TableCell>Delete</TableCell>
                          </TableHead>
                          {book.borrowedBy2.map((borrowDetails) =>
                            borrowDetails.status == "requested" &&
                            borrowDetails.borrower == user._id ? (
                              <TableRow>
                                <TableCell>{borrowDetails.borrowedOn}</TableCell>
                                <TableCell>{borrowDetails.dueDate}</TableCell>
                                <TableCell>
                                  <IconButton
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setOpenBreqDialog(true)}
                                  >
                                    <EditIcon/>
                                  </IconButton>
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    variant="contained"
                                    color="error"
                                    onClick={() =>
                                      deleteBorrowReq(
                                        book.isbn,
                                        user._id,
                                        borrowDetails._id
                                      )
                                    }
                                  >
                                    <DeleteIcon/>
                                  </IconButton>
                                </TableCell>
                                <BorrowReqForm
                                  open={openBreqDialog}
                                  handleSubmit={handleBreqSubmit}
                                  handleClose={handleBreqClose}
                                  isbn = {book.isbn}
                                  userId = {user._id}
                                  borrowReqId = {borrowDetails._id}
                                />
                              </TableRow>
                            ) : null
                          )}
                        </Container>
                      )
                    }
                    return null
                  })}
                  {count.bReq == 0 && (
                    <Typography variant="h5" style={{padding:'20px'}}>No Borrow Requests Found!</Typography>
                  )}
                  </> :
                  <>

                  {/*User Borrow Req History */}
                  {books.some((book)=> book.borrowedBy2.some((borrowDetails)=>borrowDetails.borrower==user._id && borrowDetails.status!="")) ?
                  <Container 
                    component={Paper}
                    style={{
                      margin: "10px",
                      marginTop: '20px',
                      padding: "20px",
                      minWidth: "250px",
                      flexShrink: "0",
                      width: 'fit-content',
                      // maxHeight: '600px',
                      // overflow: 'auto'
                    }}
                  >
                    <TableHead>
                      <TableCell>Book</TableCell>
                      <TableCell>Requested On</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Total Price</TableCell>
                      <TableCell>Status</TableCell>
                    </TableHead>
              {filteredBooks.map((book) => {
                return book.borrowedBy2.slice().reverse().map(
                    (borrowDetails) =>
                    borrowDetails.borrower==user._id && borrowDetails.status!="" && 
                    (<TableRow key={borrowDetails._id}>
                      <TableCell>{book.name}</TableCell>
                      <TableCell>{borrowDetails.borrowedOn}</TableCell>
                      <TableCell>{borrowDetails.dueDate}</TableCell>
                      <TableCell>${parseInt(book.price) * differenceInDays(borrowDetails.borrowedOn, borrowDetails.dueDate)}</TableCell>
                      {borrowDetails.status=="accepted" && <TableCell><CheckIcon color="success" /></TableCell>}
                      {borrowDetails.status=="rejected" && <TableCell><ClearIcon color="error" /></TableCell>}
                    </TableRow>)
                   )
              })}
                  </Container>:
                  <Typography variant="h5" style={{padding:'20px'}}>No Borrow Request History Found!</Typography>
                  } 
                </>
              }
            </>
          )}

          {/* List of return requests*/}
          {activeTab=="return-requests" && 
          <div style={{margin:'10px', marginBottom:'20px'}}>
            <AppBar position="static" style={{ background: 'white', color: 'black', width:'fit-content' }}>
              <Tabs value={rReqTab} onChange={handleRreqTabChange}>
                <Tab label="Recent" style={{ color: rReqTab === 0 ? 'blue' : 'black' }} />
                <Tab label="History" style={{ color: rReqTab === 1 ? 'blue' : 'black' }} />
              </Tabs>
            </AppBar>
          </div>}
          {user && isAdmin && activeTab == "return-requests" && filteredBooks.length > 0 && (
            <>
              {rReqTab==0 ? 
              <div> 
              <>
              {filteredBooks.map((book) => {
                if (
                  book.borrowedBy2.some(
                    (borrowDetails) => borrowDetails.returnReq.status == "requested"
                  )
                ) {
                  count.rReq += 1
                  return (
                    <Container
                      height="100px"
                      component={Paper}
                      style={{
                        margin: "10px",
                        padding: "20px",
                        minWidth: "250px",
                        flexShrink: "0",
                        width: '900px'
                      }}
                    >
                      <h2>{`${book.name} - ${book.availableQuantity} left`}</h2>
                      <TableHead>
                        <TableCell>User Name</TableCell>
                        <TableCell>Requested On</TableCell>
                        <TableCell>Borrowed On</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Total Price</TableCell>
                        <TableCell>Accept Request</TableCell>
                        <TableCell>Reject Request</TableCell>
                      </TableHead>
                      {book.borrowedBy2.map((borrowDetails) =>
                        borrowDetails.returnReq.status == "requested" ? (
                          <TableRow>
                            <TableCell>{borrowDetails.borrowerName}</TableCell>
                            <TableCell>{borrowDetails.returnReq.reqDate}</TableCell>
                            <TableCell>{borrowDetails.borrowedOn}</TableCell>
                            <TableCell>{borrowDetails.dueDate}</TableCell>
                            <TableCell>${parseInt(book.price) * differenceInDays(borrowDetails.borrowedOn, borrowDetails.dueDate)}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  acceptReturn(
                                    book.isbn,
                                    borrowDetails.borrower,
                                    borrowDetails._id
                                  )
                                }
                              >
                                <CheckIcon/>
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() =>
                                  rejectReturnReq(
                                    book.isbn,
                                    borrowDetails.borrower,
                                    borrowDetails._id
                                  )
                                }
                              >
                                <ClearIcon/>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : null
                      )}
                    </Container>
                  )
                }
                return null
              })}
              </>
              {count.rReq == 0 && (
                <Typography variant="h5" style={{padding:'20px'}}>No Return Requests Found!</Typography>
              )}
              </div>
              :

              // Admin Return Req History
              books.some((book)=> book.borrowedBy2.some((borrowDetails)=> borrowDetails.returnReq.status!="")) ?
              <Container 
                    component={Paper}
                    style={{
                      margin: "10px",
                      padding: "10px 20px",
                      minWidth: "250px",
                      flexShrink: "0",
                      width: 'fit-content',
                      // maxHeight: '320px',
                      // overflow: 'auto'
                    }}
                  >
                    <TableHead>
                      <TableCell>Book</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Requested On</TableCell>
                      <TableCell>Borrowed On</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Total Price</TableCell>
                      <TableCell>Status</TableCell>
                    </TableHead>
              {filteredBooks.map((book) => {
                  return book.borrowedBy2.slice().reverse().map(
                    (borrowDetails) =>
                    borrowDetails.returnReq.status!="" && (<TableRow key={borrowDetails._id}>
                      <TableCell>{book.name}</TableCell>
                      <TableCell>{borrowDetails.borrowerName}</TableCell>
                      <TableCell>{borrowDetails.returnReq.reqDate}</TableCell>
                      <TableCell>{borrowDetails.borrowedOn}</TableCell>
                      <TableCell>{borrowDetails.dueDate}</TableCell>
                      <TableCell>${parseInt(book.price) * differenceInDays(borrowDetails.borrowedOn, borrowDetails.dueDate)}</TableCell>
                      {borrowDetails.returnReq.status=="accepted" && <TableCell><CheckIcon color="success" /></TableCell>}
                      {borrowDetails.returnReq.status=="rejected" && <TableCell><ClearIcon color="error" /></TableCell>}
                    </TableRow>)
                   )
              })}
              </Container>
              :
              <Typography variant="h5" style={{padding:'20px'}}>No Return Requests History Found!</Typography>
              }
            </>
          )}
          {user && !isAdmin && activeTab == "return-requests" && books.length > 0 && (
            <>
              {
                <>
                { rReqTab ==0 ?
                  <>
                  {filteredBooks.map((book) => {
                    if (
                      book.borrowedBy2.some(
                        (borrowDetails) =>
                          borrowDetails.borrower == user._id &&
                          borrowDetails.returnReq.status == "requested"
                      )
                    ) {
                      count.rReq += 1
                      return (
                        <Container
                          width="100px"
                          height="100px"
                          component={Paper}
                          style={{
                            margin: "10px",
                            padding: "20px 40px",
                            minWidth: "250px",
                            flexShrink: "0",
                            maxWidth: "750px",
                            width: '750px'
                          }}
                        >
                          <h2>{`${book.name} - ${book.availableQuantity} left`}</h2>
                          <TableHead>
                            <TableCell>Requested On</TableCell>
                            <TableCell>Borrowed On</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Delete</TableCell>
                          </TableHead>
                          {book.borrowedBy2.map((borrowDetails) =>
                            borrowDetails.returnReq.status == "requested" &&
                            borrowDetails.borrower == user._id ? (
                              <TableRow>
                                <TableCell>{borrowDetails.returnReq.reqDate}</TableCell>
                                <TableCell>{borrowDetails.borrowedOn}</TableCell>
                                <TableCell>{borrowDetails.dueDate}</TableCell>
                                <TableCell>
                                  <IconButton
                                    variant="contained"
                                    color="error"
                                    onClick={() =>
                                      deleteReturnReq(
                                        book.isbn,
                                        user._id,
                                        borrowDetails._id
                                      )
                                    }
                                  >
                                    <DeleteIcon/>
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ) : null
                          )}
                        </Container>
                      )
                    }
                    return null
                  })}
                  {count.rReq == 0 && (
                    <Typography variant="h5" style={{padding:'20px'}}>No Return Requests Found!</Typography>
                  )}
                  </> :
                  <>
                  {/*User Return Req History */}
                  {books.some((book)=> book.borrowedBy2.some((borrowDetails)=>borrowDetails.borrower==user._id && borrowDetails.returnReq.status!="")) ?
                  <Container 
                    component={Paper}
                    style={{
                      margin: "10px",
                      marginTop: '20px',
                      padding: "20px",
                      minWidth: "250px",
                      flexShrink: "0",
                      width: 'fit-content',
                      maxHeight: '600px',
                      overflow: 'auto'
                    }}
                  >
                    <TableHead>
                      <TableCell>Book</TableCell>
                      <TableCell>Requested On</TableCell>
                      <TableCell>Borrowed On</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Total Price</TableCell>
                      <TableCell>Status</TableCell>
                    </TableHead>
              {filteredBooks.map((book) => {
                return book.borrowedBy2.slice().reverse().map(
                    (borrowDetails) =>
                    borrowDetails.borrower==user._id && borrowDetails.returnReq.status!="" && 
                    (<TableRow key={borrowDetails._id}>
                      <TableCell>{book.name}</TableCell>
                      <TableCell>{borrowDetails.returnReq.reqDate}</TableCell>
                      <TableCell>{borrowDetails.borrowedOn}</TableCell>
                      <TableCell>{borrowDetails.dueDate}</TableCell>
                      <TableCell>${parseInt(book.price) * differenceInDays(borrowDetails.borrowedOn, borrowDetails.dueDate)}</TableCell>
                      {borrowDetails.returnReq.status=="accepted" && <TableCell><CheckIcon color="success" /></TableCell>}
                      {borrowDetails.returnReq.status=="rejected" && <TableCell><ClearIcon color="error" /></TableCell>}
                    </TableRow>)
                   )
              })}
                  </Container>
                  :
                  <Typography variant="h5" style={{padding:'20px'}}>No Return Request History Found!</Typography>
            }
                  </>
                  }
                </>
              }
            </>
          )}

          {/* List of borrowed books*/}
          {user && !isAdmin && activeTab == "borrowed-books" && (
            <>
              {filteredBooks.length > 0 ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                      columnGap: "20px",
                    }}
                  >
                    {filteredBooks.map((book) => {
                      if (book.borrowedBy.some((borrower) => borrower == user._id)) {
                        count.bBook += 1
                        return (
                          <Container
                            component={Paper}
                            style={{
                              margin: "10px",
                              paddingBottom: "15px",
                              width: "300px",
                              flexShrink: "0",
                            }}
                          >
                            <div>
                              <p style={{ fontSize: "20px", fontWeight: "bold" }}>{book.name}</p>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignContent: "start",
                                }}
                              >
                                <div>
                                  <p>{book.isbn}</p>
                                  <p>Quantity: {book.quantity}</p>
                                  <p>Available: {book.availableQuantity}</p>
                                  <p>Price: ${book.price} per day</p>
                                </div>

                                {book.image && (
                                  <img
                                    style={{ height: "120px", alignSelf: "center" }}
                                    src={`data:image/png;base64,${book.image.data}`}
                                  ></img>
                                )}
                              </div>
                              <p>
                                Due Date:
                                {
                                  book.borrowedBy2.find(
                                    (borrowDetails) =>
                                      borrowDetails.borrower == user._id &&
                                      borrowDetails.returnReq.status != "accepted"
                                  ).dueDate
                                }
                              </p>
                              <p>Total Price: ${parseInt(book.price) * 
                              differenceInDays(
                                book.borrowedBy2.find(
                                  (borrowDetails) =>
                                    borrowDetails.borrower == user._id &&
                                    borrowDetails.returnReq.status != "accepted"
                                ).borrowedOn, 
                                book.borrowedBy2.find(
                                  (borrowDetails) =>
                                    borrowDetails.borrower == user._id &&
                                    borrowDetails.returnReq.status != "accepted"
                                ).dueDate)}</p>
                              <div className={classes.actionsContainer}>
                                <Button
                                  variant="contained"
                                  component={RouterLink}
                                  size="small"
                                  to={`/books/${book.isbn}`}
                                >
                                  View
                                </Button>
                                {/* <IconButton
                                  variant="contained"
                                  size="small"
                                  color="secondary"
                                  onClick={()=>setOpenBreqDialog(true)}
                                >
                                  <EditIcon/>
                                </IconButton> */}
                              </div>
                              <BorrowReqForm
                                  open={openBreqDialog}
                                  handleSubmit={handleBreqSubmit}
                                  handleClose={handleBreqClose}
                                  isbn = {book.isbn}
                                  userId = {user._id}
                                  borrowReqId = {
                                    book.borrowedBy2.find(
                                      (borrowDetails) =>
                                        borrowDetails.borrower == user._id &&
                                        borrowDetails.returnReq.status != "accepted"
                                    )._id}
                              />
                               </div>
                          </Container>
                        )
                      }
                      return null
                    })}
                    {count.bBook == 0 && (
                      <Typography variant="h5">No Books are Borrowed!</Typography>
                    )}
                  </div>
                </>
              ) : (
                <Typography variant="h5">No books issued!</Typography>
              )}
            </>
          )}
        </>
      ) : (
        <Typography variant="h5">Loading...</Typography>
      )}
    </div>
  )
}
