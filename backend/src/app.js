const dotenv = require("dotenv")
const cors = require('cors')
dotenv.config()

const express = require("express")
const proxy = require('express-http-proxy')

const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require('body-parser');
const sessions = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(sessions);
const { apiV1 } = require("./routes")
const { connectDb } = require("./db")
const { UserModel } = require("./models/user")

const http = require('http');
const https = require('https');
const fs = require('fs');

// const options = {
//   key: fs.readFileSync('../config/cert.key'),
//   cert: fs.readFileSync('../config/cert.crt')
// };

const socketIO = require('socket.io');
const app = express()

//HTTP server
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  }
});

// HTTPS server
// const httpsServer = https.createServer(options, app, (req, res) => {
//   // res.writeHead(200, {'Content-Type': 'text/plain'});
//   // res.end('HTTPS server running on port 8080\n');
// });
// const io = socketIO(httpsServer, {
//   cors: {
//     origin: '*',
//     methods: ["GET", "POST"],
//   }
// });


// Increase the payload size limit (adjust the value as needed)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
// Update the cors options to allow your React app's origin
// const corsOptions = {
//   origin: 'http://localhost:3000',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 204,
// };
const corsOptions = {
  origin: 'https://bookhive-oab8.onrender.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('borrowRequest', (data) => {
    console.log("data",data)
    io.emit('newBorrowRequest', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const sessionStore = new MongoDBStore({
  // MongoDB connection options
  uri: process.env.DB_URI,
  collection: 'sessions', 
  expires: 1000 * 60 * 60 * 24 * 1, // Optional, session expiration in milliseconds (1 days in this example)
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
    // cookie: {maxAge: 1000 * 60 * 60 * 48, sameSite: 'none', secure:false, httpOnly:false},
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
    const admin = await UserModel.findOne({ email: "admin@gmail.com" })
    if (admin == null) {
      await UserModel.create({ email: "admin@gmail.com", username: "admin", password: "admin", role: "admin" })
    }
    const guest = await UserModel.findOne({ email: "guest@gmail.com" })
    if (guest == null) {
      await UserModel.create({ email: "guest@gmail.com", username: "guest", password: "guest", role: "guest" })
    }
  })
  .then(() => {
    // httpsServer.listen(8080, () => console.log("Server is listening on https://localhost:8080"))
    server.listen(8000, () => console.log("Server is listening on http://localhost:8000"))
  })
  .catch((err) => {
    console.error("Failed to connect to database", err)
    process.exit(1)
  })
