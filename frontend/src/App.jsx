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
    <div className="App">
      <h1>E-Commerce Catalog</h1>

      <div className="add-product-form" style={{ padding: '20px', border: '1px solid #ccc', margin: '20px auto', maxWidth: '500px', borderRadius: '8px' }}>
        <h3>Add New Product to Database</h3>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input required type="text" placeholder="Product Name" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
          <input required type="number" placeholder="Price" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
          <textarea required placeholder="Description" value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} />
          <button type="submit">Create Product</button>
        </form>
      </div>

      <div className="products-container">
        {products.map(product => {
          const pId = product._id || product.id;
          return (
            <div key={pId} className="product-card" style={{ padding: '20px', border: '1px solid #ddd', margin: '20px', borderRadius: '8px', textAlign: 'left' }}>
              <h2>{product.name} - ${product.price}</h2>
              <p>{product.description}</p>

              <hr />
              <h3>Reviews:</h3>
              <div className="reviews" style={{ marginBottom: '15px' }}>
                {reviews[pId]?.length > 0 ? (
                  reviews[pId].map(review => (
                    <div key={review.id} style={{ background: '#f9f9f9', padding: '10px', margin: '5px 0', borderRadius: '4px' }}>
                      <strong>{review.user} ({review.rating}/5):</strong> {review.comment}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#888' }}>No reviews yet.</p>
                )}
              </div>

              <form onSubmit={(e) => handleAddReview(e, pId)} style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                <h4>Write a Review</h4>
                <input required type="text" placeholder="Your Name" value={reviewForms[pId]?.user_name || ''} onChange={e => handleReviewChange(pId, 'user_name', e.target.value)} />
                <input required type="number" min="1" max="5" placeholder="Rating (1-5)" value={reviewForms[pId]?.rating || ''} onChange={e => handleReviewChange(pId, 'rating', e.target.value)} />
                <textarea placeholder="Comment" value={reviewForms[pId]?.comment || ''} onChange={e => handleReviewChange(pId, 'comment', e.target.value)} />
                <button type="submit" style={{ alignSelf: 'flex-start' }}>Submit Review</button>
              </form>
            </div>
          )
        })}
        {products.length === 0 && <p>Loading products or database is empty...</p>}
      </div>
    </div>
  )
}

export default App
