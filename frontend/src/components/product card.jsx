export default function ProductCard(props) {
    console.log(props);

    return(
        <div className="product-card">
            <h1>{props.name}</h1>
            <h1>{props.description}</h1>
            <h1>{props.price}</h1>
            <button>Add to cart</button>
        </div>
        
    )
}