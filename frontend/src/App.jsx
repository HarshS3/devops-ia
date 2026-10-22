import { useState, useEffect } from 'react'
import './index.css'

// Contemporary product silhouette illustration with dynamic palettes
function ProductIllustration({ colorIndex = 0 }) {
  const palettes = [
    { primary: '#EBEF29', dark: '#18181B', accent: '#71717A', light: '#FFFFFF', highlight: '#FF5722' },
    { primary: '#A78BFA', dark: '#18181B', accent: '#EBEF29', light: '#F4F4F5', highlight: '#7C3AED' },
    { primary: '#38BDF8', dark: '#0F172A', accent: '#F43F5E', light: '#FFFFFF', highlight: '#0284C7' },
    { primary: '#F97316', dark: '#18181B', accent: '#EBEF29', light: '#FFFBEB', highlight: '#EA580C' },
    { primary: '#10B981', dark: '#064E3B', accent: '#FDE047', light: '#F0FDF4', highlight: '#059669' },
    { primary: '#F43F5E', dark: '#18181B', accent: '#A78BFA', light: '#FFF1F2', highlight: '#E11D48' }
  ]
  const p = palettes[colorIndex % palettes.length]

  return (
    <svg className="product-art" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sole / Foundation */}
      <path d="M40 185C70 190 140 192 210 190C280 188 330 180 355 170C360 168 365 174 362 179C352 195 320 206 250 208C170 210 65 208 32 198C28 196 29 188 34 186L40 185Z" fill={p.dark} />
      <path d="M48 178C90 182 170 183 235 180C300 178 340 172 355 166C358 165 360 168 358 171C348 182 315 190 250 192C175 194 75 193 42 186C39 185 41 179 45 178L48 178Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M60 188C110 191 190 191 260 188C310 186 338 181 350 176" stroke={p.primary} strokeWidth="4" strokeLinecap="round" />

      {/* Main Upper Body */}
      <path d="M65 180C50 170 52 140 85 130C105 125 140 135 170 115C195 98 220 70 245 68C270 66 285 85 285 105C285 115 275 125 270 132C300 135 340 145 355 166C340 172 290 178 220 180C140 182 85 182 65 180Z" fill={p.light} />
      
      {/* Front Accent Panel */}
      <path d="M255 130C285 133 325 142 355 166C340 172 295 178 230 180C260 165 265 145 255 130Z" fill={p.primary} />
      
      {/* Dynamic Graphic Lines */}
      <path d="M120 145C160 130 210 138 250 152" stroke={p.dark} strokeWidth="12" strokeLinecap="round" />
      <path d="M110 155C150 142 205 148 245 164" stroke={p.primary} strokeWidth="8" strokeLinecap="round" />
      
      {/* Heel & Collar */}
      <path d="M65 180C50 170 52 140 85 130C95 126 108 127 120 132C105 150 95 168 65 180Z" fill={p.accent} />
      <path d="M225 70C238 67 252 68 262 76C275 88 280 102 278 114C268 108 255 105 240 108L225 70Z" fill={p.dark} />
      
      {/* Laces */}
      <path d="M175 110L195 118M190 98L212 106M208 86L230 94M225 74L245 82" stroke={p.dark} strokeWidth="4.5" strokeLinecap="round" />
      
      {/* Brand Identity Stamp */}
      <circle cx="102" cy="142" r="14" fill={p.primary} stroke={p.dark} strokeWidth="2.5" />
      <polygon points="102,133 105,140 112,141 107,145 108,152 102,148 96,152 97,145 92,141 99,140" fill={p.dark} />

      {/* Pull Tag */}
      <rect x="52" y="136" width="10" height="22" rx="3" fill={p.highlight} transform="rotate(-15 52 136)" />
    </svg>
  )
}

function StarRating({ rating }) {
  return (
    <span className="star-rating-stars">
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
  
  // UI states (modal & feedback)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const productApiUrl = import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:3001'
  const reviewApiUrl = import.meta.env.VITE_REVIEW_API_URL || 'http://localhost:3002'

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

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
        setIsModalOpen(false)
        fetchProductsAndReviews()
        showToast('✓ Product added successfully to the catalog!')
      })
      .catch(err => {
        console.error(err)
        showToast('❌ Failed to add product')
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
        user_name: form.user_name || 'Anonymous User',
        rating: Number(form.rating) || 5,
        comment: form.comment || ''
      })
    })
      .then(res => res.json())
      .then(() => {
        setReviewForms(prev => ({ ...prev, [productId]: {} }))
        fetchProductsAndReviews()
        showToast('⭐ Review submitted successfully!')
      })
      .catch(err => {
        console.error(err)
        showToast('❌ Failed to submit review')
      })
  }

  const toggleReviews = (pId) => {
    setExpandedReviews(prev => ({ ...prev, [pId]: !prev[pId] }))
  }

  // Filtered products list
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cardBackdrops = ['#FFF5EB', '#F0FDF4', '#F0F9FF', '#FAF5FF', '#FFFBEB', '#FFF1F2']
  const tagList = ['FEATURED', 'IN STOCK', 'TRENDING', 'NEW RELEASE']

  return (
    <div className="app-container">
      {/* 1. SIMPLE CLEAN TICKER */}
      <div className="brand-ticker">
        <div className="ticker-track">
          <div className="ticker-item"><span>✦ CONTEMPORARY STREETWEAR &amp; FOOTWEAR</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>✦ DESIGNED FOR EVERYDAY EXPRESSION</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>✦ LIVE CATALOG WITH REAL-TIME REVIEWS</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>✦ FREE STANDARD SHIPPING ON ALL ORDERS</span><span className="ticker-star">★</span></div>
          {/* Duplicate track for seamless infinite marquee */}
          <div className="ticker-item"><span>✦ CONTEMPORARY STREETWEAR &amp; FOOTWEAR</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>✦ DESIGNED FOR EVERYDAY EXPRESSION</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>✦ LIVE CATALOG WITH REAL-TIME REVIEWS</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>✦ FREE STANDARD SHIPPING ON ALL ORDERS</span><span className="ticker-star">★</span></div>
        </div>
      </div>

      {/* 2. SIMPLE SPA NAVBAR */}
      <header className="brand-navbar">
        <div className="nav-brand">
          <span className="brand-logo">KINETIC</span>
          <span className="brand-tag">STUDIO</span>
        </div>

        <div className="nav-actions">
          <span className="items-badge">
            <span className="live-dot"></span>
            {products.length} {products.length === 1 ? 'Item' : 'Items'} Live
          </span>

          <button 
            type="button" 
            className="btn-add-product"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Product
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION (SIMPLE, ORIGINAL, BOLD) */}
      <section className="hero-banner">
        <div className="hero-grid-pattern"></div>
        <div className="hero-inner">
          <div className="hero-pill">ORIGINAL STREETWEAR &amp; ESSENTIALS</div>

          <h1 className="hero-heading">
            BOLD ESSENTIALS FOR<br />
            <span className="hero-highlight">EVERYDAY EXPRESSION.</span>
          </h1>

          <p className="hero-text">
            Explore our curated catalog of footwear and apparel. 
            Browse items, add products to the store, and share your genuine feedback with community reviews.
          </p>

          <div className="hero-btn-group">
            <a href="#catalog" className="btn-primary-action">
              Browse Collection ↓
            </a>
            <button 
              type="button" 
              className="btn-secondary-action"
              onClick={() => setIsModalOpen(true)}
            >
              + Add New Item
            </button>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT CATALOG */}
      <main id="catalog" className="catalog-wrapper">
        <div className="catalog-header-bar">
          <div>
            <div className="catalog-eyebrow">CURATED COLLECTION</div>
            <h2 className="catalog-main-title">ALL PRODUCTS</h2>
          </div>

          <div className="search-bar-container">
            <input 
              type="text" 
              className="catalog-search-input"
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="product-cards-grid">
          {filteredProducts.map((product, index) => {
            const pId = product._id || product.id
            const productReviews = reviews[pId] || []
            const avgRating = productReviews.length > 0
              ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
              : null
            const isExpanded = expandedReviews[pId]
            const bgTone = cardBackdrops[index % cardBackdrops.length]
            const tag = tagList[index % tagList.length]

            // Price formatting
            const formattedPrice = typeof product.price === 'number'
              ? `₹${product.price.toLocaleString('en-IN')}`
              : `₹${product.price}`

            return (
              <article key={pId} className="item-card">
                {/* Visual Artwork Box */}
                <div className="item-visual-box" style={{ backgroundColor: bgTone }}>
                  <span className="item-tag">{tag}</span>
                  <ProductIllustration colorIndex={index} />
                </div>

                {/* Content Body */}
                <div className="item-content-body">
                  <div className="item-header-row">
                    <h3 className="item-title">{product.name}</h3>
                    <span className="item-price">{formattedPrice}</span>
                  </div>

                  {/* Rating Line */}
                  <div className="item-rating-row">
                    <StarRating rating={avgRating ? Math.round(Number(avgRating)) : 5} />
                    <span className="item-rating-text">
                      {avgRating ? `${avgRating} (${productReviews.length})` : 'New'}
                    </span>
                  </div>

                  <p className="item-desc">{product.description}</p>

                  {/* Action Buttons */}
                  <div className="item-action-footer">
                    <button 
                      type="button" 
                      className="btn-order"
                      onClick={() => showToast(`🛒 "${product.name}" added to bag!`)}
                    >
                      Add to Bag
                    </button>

                    <button
                      type="button"
                      className="btn-reviews-toggle"
                      onClick={() => toggleReviews(pId)}
                    >
                      {isExpanded ? 'Hide Reviews' : `Reviews (${productReviews.length})`}
                    </button>
                  </div>
                </div>

                {/* Collapsible Reviews Section */}
                {isExpanded && (
                  <div className="item-reviews-tray">
                    <div className="tray-header">
                      <span className="tray-title">CUSTOMER REVIEWS</span>
                      <span className="tray-count">{productReviews.length} total</span>
                    </div>

                    <div className="tray-reviews-scroll">
                      {productReviews.length === 0 ? (
                        <div className="tray-empty">
                          No reviews yet for this product. Be the first to review!
                        </div>
                      ) : (
                        productReviews.map((review, rIdx) => (
                          <div key={review.id || rIdx} className="review-card">
                            <div className="review-card-top">
                              <span className="reviewer-author">{review.user || review.user_name || 'Anonymous'}</span>
                              <StarRating rating={review.rating} />
                            </div>
                            {review.comment && (
                              <p className="review-card-comment">"{review.comment}"</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Submit Review Form */}
                    <form onSubmit={(e) => handleAddReview(e, pId)} className="add-review-box">
                      <div className="box-title">LEAVE A REVIEW</div>
                      <div className="review-inputs-row">
                        <input
                          required
                          type="text"
                          className="simple-input"
                          placeholder="Your Name"
                          value={reviewForms[pId]?.user_name || ''}
                          onChange={e => handleReviewChange(pId, 'user_name', e.target.value)}
                        />
                        <select
                          required
                          className="simple-input"
                          value={reviewForms[pId]?.rating || '5'}
                          onChange={e => handleReviewChange(pId, 'rating', e.target.value)}
                        >
                          <option value="5">5 ★ (Excellent)</option>
                          <option value="4">4 ★ (Good)</option>
                          <option value="3">3 ★ (Average)</option>
                          <option value="2">2 ★ (Fair)</option>
                          <option value="1">1 ★ (Poor)</option>
                        </select>
                      </div>

                      <textarea
                        rows="2"
                        className="simple-textarea"
                        placeholder="Write your review..."
                        value={reviewForms[pId]?.comment || ''}
                        onChange={e => handleReviewChange(pId, 'comment', e.target.value)}
                      />

                      <button type="submit" className="btn-submit-review">
                        Submit Review
                      </button>
                    </form>
                  </div>
                )}
              </article>
            )
          })}

          {/* Empty Catalog State */}
          {filteredProducts.length === 0 && (
            <div className="catalog-empty-box">
              <div className="empty-box-icon">🛍️</div>
              <h3 className="empty-box-title">
                {products.length === 0 ? 'NO PRODUCTS IN CATALOG' : 'NO MATCHING ITEMS FOUND'}
              </h3>
              <p className="empty-box-sub">
                {products.length === 0 
                  ? 'Get started by creating your first product using the button below.'
                  : 'Try clearing your search query to see all available items.'}
              </p>
              {products.length === 0 && (
                <button 
                  type="button" 
                  className="btn-add-product"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Add First Product
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 5. ADD PRODUCT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="modal-tag">CATALOG MANAGEMENT</span>
                <h3 className="modal-heading">Add New Product</h3>
              </div>
              <button 
                type="button" 
                className="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="modal-form-body">
              <div className="form-field">
                <label className="input-label">Product Name</label>
                <input
                  required
                  type="text"
                  className="simple-input"
                  placeholder="e.g. Kinetic Pulse Low"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="input-label">Price (INR ₹)</label>
                <input
                  required
                  type="number"
                  className="simple-input"
                  placeholder="e.g. 3499"
                  value={newProductPrice}
                  onChange={e => setNewProductPrice(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="input-label">Description</label>
                <textarea
                  required
                  rows="4"
                  className="simple-textarea"
                  placeholder="Describe the product, materials, and fit..."
                  value={newProductDesc}
                  onChange={e => setNewProductDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-modal-submit">
                + Create Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="app-toast">
          {toastMessage}
        </div>
      )}

      {/* 7. SIMPLE AUTHENTIC FOOTER */}
      <footer className="brand-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">KINETIC</span>
            <p className="footer-desc">
              Contemporary footwear and daily essentials engineered for modern lifestyle and comfort.
            </p>
          </div>
          <div className="footer-right">
            <span>© 2026 Kinetic Studio. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
