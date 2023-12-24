const serverUrl = "https://bookhive-fe.onrender.com"
// const serverUrl = "https://localhost:8080"

const UserApi = {
  borrowBook: async (isbn, userId, dueDate) => {
    const res = await fetch(`${serverUrl}/v1/user/borrow`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId, dueDate }),
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
  editBorrowReq: async (isbn, userId, borrowReqId, dueDate) => {
    const res = await fetch(`${serverUrl}/v1/user/edit-borrow-req`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId, borrowReqId, dueDate}),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  rejectBorrowReq: async (isbn, userId, borrowReqId) => {
    const res = await fetch(`${serverUrl}/v1/user/reject-borrow-req`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId, borrowReqId}),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  deleteBorrowReq: async (isbn, userId, borrowReqId) => {
    console.log({ isbn, userId, borrowReqId})
    const res = await fetch(`${serverUrl}/v1/user/delete-borrow-req`, {
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
  rejectReturnReq: async (isbn, userId) => {
    const res = await fetch(`${serverUrl}/v1/user/reject-return-req`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId }),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  deleteBorrowReq: async (isbn, userId, returnReqId) => {
    console.log({ isbn, userId, returnReqId})
    const res = await fetch(`${serverUrl}/v1/user/delete-borrow-req`, {
      method: "POST",
      body: JSON.stringify({ isbn, userId, returnReqId}),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  getBorrowBook: async () => {
    const res = await fetch(`${serverUrl}/v1/user/borrowed-books`, { method: "GET", credentials:'include'})
    return res.json()
  },
  register: async (email, username, password, role) => {
    const res = await fetch(`${serverUrl}/v1/user/register`, {
      method: "POST",
      body: JSON.stringify({ email, username, password, role}),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  login: async (email, password) => {
    const res = await fetch(`${serverUrl}/v1/user/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
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
