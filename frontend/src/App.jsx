import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState({})

  // Product form state
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductDesc, setNewProductDesc] = useState('')

  // Review form state - keyed by product id
  const [reviewForms, setReviewForms] = useState({})

  const productApiUrl = import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:3001'
  const reviewApiUrl = import.meta.env.VITE_REVIEW_API_URL || 'http://localhost:3002'

  const fetchProductsAndReviews = () => {
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
  }

  useEffect(() => {
    fetchProductsAndReviews()
  }, [productApiUrl, reviewApiUrl])

  const handleAddProduct = (e) => {
    e.preventDefault()
    fetch(`${productApiUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProductName,
        price: Number(newProductPrice),
        description: newProductDesc
      })
    })
      .then(res => res.json())
      .then(() => {
        setNewProductName('')
        setNewProductPrice('')
        setNewProductDesc('')
        fetchProductsAndReviews()
      })
  }

  const handleReviewChange = (productId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }))
  }

  const handleAddReview = (e, productId) => {
    e.preventDefault()
    const form = reviewForms[productId] || {}
    fetch(`${reviewApiUrl}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        user_name: form.user_name || 'Anonymous',
        rating: Number(form.rating) || 5,
        comment: form.comment || ''
      })
    })
      .then(res => res.json())
      .then(() => {
        setReviewForms(prev => ({ ...prev, [productId]: {} }))
        fetchProductsAndReviews()
      })
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Nexus Store</h1>
      </div>

      <div className="form-card">
        <h3>Add New Product to Database</h3>
        <form onSubmit={handleAddProduct} className="input-group">
          <input required type="text" placeholder="Product Name" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
          <input required type="number" placeholder="Price ($)" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
          <textarea required placeholder="Product Description" rows="3" value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} />
          <button type="submit">Create Product</button>
        </form>
      </div>

      <div className="products-grid">
        {products.map(product => {
          const pId = product._id || product.id;
          return (
            <div key={pId} className="product-card">
              <div className="product-header">
                <h2 className="product-title">{product.name}</h2>
                <span className="product-price">${product.price}</span>
              </div>
              <p className="product-desc">{product.description}</p>

              <div className="reviews-section">
                <h4>Customer Reviews</h4>
                {reviews[pId]?.length > 0 ? (
                  reviews[pId].map(review => (
                    <div key={review.id} className="review-item">
                      <span className="review-author">{review.user}</span>
                      <span className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No reviews yet. Be the first!</p>
                )}
              </div>

              <form onSubmit={(e) => handleAddReview(e, pId)} className="review-form">
                <h4>Write a Review</h4>
                <input required type="text" placeholder="Your Name" value={reviewForms[pId]?.user_name || ''} onChange={e => handleReviewChange(pId, 'user_name', e.target.value)} />
                <input required type="number" min="1" max="5" placeholder="Rating (1-5)" value={reviewForms[pId]?.rating || ''} onChange={e => handleReviewChange(pId, 'rating', e.target.value)} />
                <textarea placeholder="Comment" rows="2" value={reviewForms[pId]?.comment || ''} onChange={e => handleReviewChange(pId, 'comment', e.target.value)} />
                <button type="submit">Submit Review</button>
              </form>
            </div>
          )
        })}
        {products.length === 0 && <div className="loading-state">Loading products or database is empty...</div>}
      </div>
    </div>
  )
}

export default App
