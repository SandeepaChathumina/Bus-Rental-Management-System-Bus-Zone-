import Product from "../models/product.js";

export function createProduct(req, res) {
    if(req.user == null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if(req.user.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
    }

    const product = new Product(req.body);

    product.save().then(
        ()=> {
            res.json({ message: "Product created successfully" });
        }
    ).catch(
        (err) => {
            console.log(err);
            res.status(500).json({ message: "Error creating product" });
        }
    )
}

export function getProducts(req, res) {
    Product.find().then(
        (products) => {
            res.json(products);
        }
    ).catch(
        (err) => {
            res.status(500).json({ message: "Error fetching products" });
        }
    )
}

export function deleteProduct(req, res) {
    if(req.user == null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    if(req.user.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
    }

    Product.findOneAndDelete({ productId: req.params.productId }).then(
        () => {
            res.json({ message: "Product deleted successfully" });
        }
    ).catch(
        (err) => {
            res.status(500).json({ message: "Error deleting product" });
        }
    )
}

export function updateProduct(req, res) {
    if(req.user == null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    
    if(req.user.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
    }

    Product.findOneAndUpdate({ productId: req.params.productId }, req.body).then(
        () => {
            res.json({ message: "Product updated successfully" });
        }
    ).catch(
        (err) => {
            res.status(500).json({ message: "Error updating product" });
        }
    )
}