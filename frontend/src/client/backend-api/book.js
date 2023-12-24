const serverUrl = "https://bookhive-fe.onrender.com"
// const serverUrl = "https://localhost:8080"

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
    console.log(data)
    const formData = new FormData();

    // Iterate over each field in the data object and append it to the FormData
    for (const [key, value] of Object.entries(data)) {
      if(key=="priceHistory" || key=="quantityHistory"){
        value.forEach(item => {
          formData.append(`${key}[]`, JSON.stringify(item));
        });
      }else{
        formData.append(key, value);
      }
    }
    console.log(formData)

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
