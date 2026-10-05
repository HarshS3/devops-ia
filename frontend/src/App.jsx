import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState({})

  const productApiUrl = import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:3001'
  const reviewApiUrl = import.meta.env.VITE_REVIEW_API_URL || 'http://localhost:3002'

  useEffect(() => {
    fetch(`${productApiUrl}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        data.forEach(product => {
          fetch(`${reviewApiUrl}/reviews/${product._id || product.id}`)
            .then(res => res.json())
            .then(reviewData => {
              setReviews(prev => ({ ...prev, [product._id || product.id]: reviewData }))
            })
            .catch(err => console.error(err))
        })
      })
      .catch(err => console.error(err))
  }, [productApiUrl, reviewApiUrl])

  return (
    <div className="App">
      <h1>E-Commerce Catalog</h1>
      <div className="products-container">
        {products.map(product => (
          <div key={product._id || product.id} className="product-card">
            <h2>{product.name} - ${product.price}</h2>
            <p>{product.description}</p>
            <h3>Reviews:</h3>
            <div className="reviews">
              {reviews[product._id || product.id]?.length > 0 ? (
                reviews[product._id || product.id].map(review => (
                  <p key={review.id}><strong>{review.user} ({review.rating}/5):</strong> {review.comment}</p>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          </div>
        ))}
        {products.length === 0 && <p>Loading products...</p>}
      </div>
    </div>
  )
}

export default App
