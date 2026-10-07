import { useState, useEffect } from 'react'
import './index.css'

function StarRating({ rating }) {
  return (
    <span className="review-stars">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [reviews, setReviews] = useState({})

  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductDesc, setNewProductDesc] = useState('')
  const [reviewForms, setReviewForms] = useState({})
  const [expandedReviews, setExpandedReviews] = useState({})

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
      [productId]: { ...prev[productId], [field]: value }
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

  const toggleReviews = (pId) => {
    setExpandedReviews(prev => ({ ...prev, [pId]: !prev[pId] }))
  }

  return (
    <div className="app-root">
      {/* Navbar */}
      <nav className="navbar">
        <span className="nav-logo">Nexus Store</span>
        <span className="nav-badge">⚡ {products.length} Products Live</span>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">
          <span className="hero-dot"></span>
          E-Commerce Platform
        </div>
        <h1 className="hero-title">Discover Products</h1>
        <p className="hero-subtitle">
          Browse our catalog, add products to the database, and leave reviews — all running on a live Kubernetes cluster on AWS.
        </p>
      </div>

      {/* Main layout: sidebar + grid */}
      <div className="main-layout">

        {/* Sidebar: Add Product Form */}
        <aside className="sidebar">
          <div className="form-card">
            <div className="form-title">Add New Product</div>
            <div className="form-subtitle">Pushes directly to MongoDB on EKS</div>
            <div className="divider"></div>
            <form onSubmit={handleAddProduct} className="field-group">
              <div className="field-wrapper">
                <label className="field-label">Product Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Wireless Headphones"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                />
              </div>
              <div className="field-wrapper">
                <label className="field-label">Price (USD)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 49.99"
                  value={newProductPrice}
                  onChange={e => setNewProductPrice(e.target.value)}
                />
              </div>
              <div className="field-wrapper">
                <label className="field-label">Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe the product..."
                  value={newProductDesc}
                  onChange={e => setNewProductDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                + Create Product
              </button>
            </form>
          </div>
        </aside>

        {/* Right: Product Grid */}
        <div>
          <div className="catalog-header">
            <span className="catalog-title">Product Catalog</span>
            <span className="catalog-count">{products.length} item{products.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="products-grid">
            {products.map(product => {
              const pId = product._id || product.id
              const productReviews = reviews[pId] || []
              const avgRating = productReviews.length > 0
                ? Math.round(productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length)
                : null
              const isExpanded = expandedReviews[pId]

              return (
                <div key={pId} className="product-card">
                  <div className="card-accent-bar"></div>
                  <div className="card-body">
                    <div className="card-top">
                      <h2 className="product-name">{product.name}</h2>
                      <span className="product-price-badge">${product.price}</span>
                    </div>

                    {avgRating && (
                      <div style={{ marginBottom: '0.6rem' }}>
                        <StarRating rating={avgRating} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                          ({productReviews.length} review{productReviews.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    )}

                    <p className="product-description">{product.description}</p>

                    {/* Reviews */}
                    <div className="reviews-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="reviews-label">Reviews</span>
                        {productReviews.length > 0 && (
                          <button
                            className="btn-secondary"
                            onClick={() => toggleReviews(pId)}
                            style={{ width: 'auto', padding: '0.2rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
                          >
                            {isExpanded ? 'Hide' : `Show ${productReviews.length}`}
                          </button>
                        )}
                      </div>

                      {productReviews.length === 0 ? (
                        <div className="no-reviews">No reviews yet · Be the first!</div>
                      ) : isExpanded ? (
                        productReviews.map((review, idx) => (
                          <div key={review.id || idx} className="review-item">
                            <div className="review-meta">
                              <span className="review-author">{review.user || review.user_name}</span>
                              <StarRating rating={review.rating} />
                            </div>
                            {review.comment && <p className="review-comment">{review.comment}</p>}
                          </div>
                        ))
                      ) : (
                        <div className="no-reviews" style={{ cursor: 'pointer' }} onClick={() => toggleReviews(pId)}>
                          {productReviews.length} review{productReviews.length !== 1 ? 's' : ''} · click to expand
                        </div>
                      )}
                    </div>

                    {/* Write Review */}
                    <div className="review-form-section">
                      <div className="review-form-label">Write a Review</div>
                      <form onSubmit={(e) => handleAddReview(e, pId)} className="review-form">
                        <div className="review-form-row">
                          <input
                            required
                            type="text"
                            placeholder="Your name"
                            value={reviewForms[pId]?.user_name || ''}
                            onChange={e => handleReviewChange(pId, 'user_name', e.target.value)}
                          />
                          <input
                            required
                            type="number"
                            min="1"
                            max="5"
                            placeholder="1-5"
                            value={reviewForms[pId]?.rating || ''}
                            onChange={e => handleReviewChange(pId, 'rating', e.target.value)}
                          />
                        </div>
                        <textarea
                          rows="2"
                          placeholder="Share your thoughts..."
                          value={reviewForms[pId]?.comment || ''}
                          onChange={e => handleReviewChange(pId, 'comment', e.target.value)}
                        />
                        <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem' }}>
                          Submit Review
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )
            })}

            {products.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🛍️</div>
                <div className="empty-text">No products yet</div>
                <div className="empty-sub">Add your first product using the form on the left!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
