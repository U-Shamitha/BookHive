// const serverUrl = "https://bookhive-fe.onrender.com"
// const serverUrl = "http://localhost:8000"
const serverUrl = "https://localhost:8080"

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
    const formData = new FormData();

    // Iterate over each field in the data object and append it to the FormData
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value);
    }

    const res = await fetch(`${serverUrl}/v1/book`, {
      method: "POST",
      body: formData,
      // headers: { "Content-Type": 'multipart/form-data' },
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
