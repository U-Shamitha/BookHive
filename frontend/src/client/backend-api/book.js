// const serverUrl = "https://bookhive-fe.onrender.com"
const serverUrl = "http://localhost:8080"

const BookApi = {
  getAllBooks: async () => {
    const res = await fetch(`${serverUrl}/v1/book`, { method: "GET", credentials:'include' })
    return res.json()
  },
  getBookByIsbn: async (bookIsbn) => {
    const res = await fetch(`${serverUrl}/v1/book/${bookIsbn}`, { method: "GET", credentials:'include' })
    return res.json()
  },
  addBook: async (data) => {
    const res = await fetch(`${serverUrl}/v1/book`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  patchBookByIsbn: async (bookIsbn, data) => {
    const res = await fetch(`${serverUrl}/v1/book/${bookIsbn}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      credentials:'include'
    })
    return res.json()
  },
  deleteBook: async (bookIsbn) => {
    const res = await fetch(`${serverUrl}/v1/book/${bookIsbn}`, { method: "DELETE", credentials:'include' })
    return res.json()
  },
}

module.exports = { BookApi }
