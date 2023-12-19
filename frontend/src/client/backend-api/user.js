// const serverUrl = "https://bookhive-fe.onrender.com"
const serverUrl = "http://localhost:8080"

const UserApi = {
  borrowBook: async (isbn, userId) => {
    const res = await fetch(`${serverUrl}/v1/user/borrow`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId }),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    
    return res.json()
  },
  acceptBorrow: async (isbn, userId, borrowReqId) => {
    const res = await fetch(`${serverUrl}/v1/user/accept-borrow`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId, borrowReqId}),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  returnBook: async (isbn, userId) => {
    const res = await fetch(`${serverUrl}/v1/user/return`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId }),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  acceptReturn: async (isbn, userId) => {
    const res = await fetch(`${serverUrl}/v1/user/accept-return`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId }),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  getBorrowBook: async () => {
    const res = await fetch(`${serverUrl}/v1/user/borrowed-books`, { method: "GET", credentials:'include'})
    return res.json()
  },
  register: async (username, password, role) => {
    const res = await fetch(`${serverUrl}/v1/user/register`, {
      method: "POST",
      body: JSON.stringify({ username, password, role}),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  login: async (username, password) => {
    const res = await fetch(`${serverUrl}/v1/user/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  getProfile: async () => {
    const res = await fetch(`${serverUrl}/v1/user/profile`, { method: "GET", credentials:'include'})
    return res.json()
  },
  logout: async () => {
    const res = await fetch(`${serverUrl}/v1/user/logout`, { method: "GET", credentials:'include' })
    return res.json()
  },
}

module.exports = { UserApi }
