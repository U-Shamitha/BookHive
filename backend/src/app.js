const dotenv = require("dotenv")
const cors = require('cors')
dotenv.config()

const express = require("express")

const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const sessions = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(sessions);
const { apiV1 } = require("./routes")
const { connectDb } = require("./db")
const { UserModel } = require("./models/user")

const http = require('http');
const app = express()
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('borrowRequest', (data) => {
    io.emit('newBorrowRequest', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(cors({origin: 'https://bookhive-oab8.onrender.com',
credentials: true,}))

const sessionStore = new MongoDBStore({
  // MongoDB connection options
  uri: process.env.DB_URI,
  collection: 'sessions', // Optional, the collection name for sessions
  expires: 1000 * 60 * 60 * 24 * 7, // Optional, session expiration in milliseconds (7 days in this example)
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

// Catch errors in the store initialization
sessionStore.on('error', function (error) {
  console.error('MongoDB store error:', error);
});

app.set('trust proxy', 1)
app.use(
  sessions({
    name: 'connect.sid',
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    // cookie: { maxAge: 1000 * 60 * 60 * 24 },
    cookie: {maxAge: 1000 * 60 * 60 * 48, sameSite: 'None', secure:true},
    resave: false,
  })
)

app.use("/v1", apiV1)

app.use((req, res) => {
  return res.status(404).json({ error: "Route not found" })
})

app.use((err, req, res, next) => {
  console.error("Error:", err)
  return res.status(500).json({ error: "Unknown server error" })
})

connectDb()
  .then(async () => {
    const admin = await UserModel.findOne({ username: "admin" })
    if (admin == null) {
      await UserModel.create({ username: "admin", password: "admin", role: "admin" })
    }
    const guest = await UserModel.findOne({ username: "guest" })
    if (guest == null) {
      await UserModel.create({ username: "guest", password: "guest", role: "guest" })
    }
  })
  .then(() => {
    server.listen(8080, () => console.log("Server is listening on http://localhost:8080"))
  })
  .catch((err) => {
    console.error("Failed to connect to database", err)
    process.exit(1)
  })
