const { model, Schema } = require('mongoose');

const BorrowDetailsModel = model(
    "borrowDetails",
    new Schema({ 
        borrower: { type: Schema.Types.ObjectId, ref: "users" }, 
        borrowerName: String,
        status: { type: String, default: 'requested' },
        borrowedOn: String, 
        returnReq: {
            reqDate: {type: String, default:''},
            status: {type: String, default:''},
        },
        returnedOn: String
    })
)

module.exports = { BorrowDetailsModel}