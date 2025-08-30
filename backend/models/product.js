import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    productId : {
        type: String,
        required: true,
        unique: true
    },
    name : {
        type: String,
        required: true
    },
    altName : {
        type: [String],
        default: []
    },
    price : {
        type: Number,
        required: true
    },
    labledPrice : {
        type: Number,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    images : {
        type: [String],
        required: true,
        default: ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhbmR5QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IlNhbmRlZXBhIiwibGFzdE5hbWUiOiJDaGF0aHVtaW5hIiwicm9sZSI6ImFkbWluIiwicGhvbmUiOiJOb3QgZ2l2ZW4iLCJpc0Rpc2FibGVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaWF0IjoxNzU2NTQ3Mjk0fQ.P0FKIJmmBW4S8byuQ6fDDWO8UPFkbLU8AoYfujyEFRM"]
    },
    stock : {
        type: Number,
        required: true
    },
});

const Product = mongoose.model("Product", productSchema);

export default Product;