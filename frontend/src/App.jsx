import { useState, useEffect } from 'react'
import './index.css'

// Dynamic sneaker SVG artwork with custom palette per card
function SneakerIllustration({ colorIndex = 0 }) {
  const palettes = [
    { upper: '#EBEF29', sole: '#18181B', accent: '#3F3F46', base: '#FFFFFF', tag: '#FF5722' },
    { upper: '#A78BFA', sole: '#18181B', accent: '#EBEF29', base: '#F4F4F5', tag: '#7C3AED' },
    { upper: '#38BDF8', sole: '#0F172A', accent: '#F43F5E', base: '#FFFFFF', tag: '#0284C7' },
    { upper: '#F97316', sole: '#18181B', accent: '#EBEF29', base: '#FFFBEB', tag: '#EA580C' },
    { upper: '#10B981', sole: '#064E3B', accent: '#FDE047', base: '#F0FDF4', tag: '#059669' },
    { upper: '#F43F5E', sole: '#18181B', accent: '#A78BFA', base: '#FFF1F2', tag: '#E11D48' }
  ]
  const p = palettes[colorIndex % palettes.length]

  return (
    <svg className="sneaker-art" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dynamic Sole */}
      <path d="M40 185C70 190 140 192 210 190C280 188 330 180 355 170C360 168 365 174 362 179C352 195 320 206 250 208C170 210 65 208 32 198C28 196 29 188 34 186L40 185Z" fill={p.sole} />
      <path d="M48 178C90 182 170 183 235 180C300 178 340 172 355 166C358 165 360 168 358 171C348 182 315 190 250 192C175 194 75 193 42 186C39 185 41 179 45 178L48 178Z" fill="#FFFFFF" opacity="0.9" />
      <path d="M60 188C110 191 190 191 260 188C310 186 338 181 350 176" stroke={p.upper} strokeWidth="4" strokeLinecap="round" />

      {/* Sneaker Upper Body */}
      <path d="M65 180C50 170 52 140 85 130C105 125 140 135 170 115C195 98 220 70 245 68C270 66 285 85 285 105C285 115 275 125 270 132C300 135 340 145 355 166C340 172 290 178 220 180C140 182 85 182 65 180Z" fill={p.base} />
      
      {/* Front Overlay / Mudguard */}
      <path d="M255 130C285 133 325 142 355 166C340 172 295 178 230 180C260 165 265 145 255 130Z" fill={p.upper} />
      
      {/* Comet Signature Streaks */}
      <path d="M120 145C160 130 210 138 250 152" stroke={p.sole} strokeWidth="12" strokeLinecap="round" />
      <path d="M110 155C150 142 205 148 245 164" stroke={p.upper} strokeWidth="8" strokeLinecap="round" />
      
      {/* Heel Counter & Ankle Collar */}
      <path d="M65 180C50 170 52 140 85 130C95 126 108 127 120 132C105 150 95 168 65 180Z" fill={p.accent} />
      <path d="M225 70C238 67 252 68 262 76C275 88 280 102 278 114C268 108 255 105 240 108L225 70Z" fill={p.sole} />
      
      {/* Sneaker Laces & Tongue */}
      <path d="M175 110L195 118M190 98L212 106M208 86L230 94M225 74L245 82" stroke={p.sole} strokeWidth="4.5" strokeLinecap="round" />
      
      {/* Comet Retro Star Stamp */}
      <circle cx="102" cy="142" r="14" fill={p.upper} stroke={p.sole} strokeWidth="2.5" />
      <polygon points="102,133 105,140 112,141 107,145 108,152 102,148 96,152 97,145 92,141 99,140" fill={p.sole} />

      {/* Sneaker Heel Pull Tag */}
      <rect x="52" y="136" width="10" height="22" rx="3" fill={p.tag} transform="rotate(-15 52 136)" />
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
  
  // UI states for modal & filters (visual only)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')
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
        showToast('🔥 Sneaker Drop added to catalog successfully!')
      })
      .catch(err => {
        console.error(err)
        showToast('❌ Failed to create sneaker drop')
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
        user_name: form.user_name || 'Anonymous Sneakerhead',
        rating: Number(form.rating) || 5,
        comment: form.comment || ''
      })
    })
      .then(res => res.json())
      .then(() => {
        setReviewForms(prev => ({ ...prev, [productId]: {} }))
        fetchProductsAndReviews()
        showToast('⭐ Verdict posted to the Comet community!')
      })
      .catch(err => {
        console.error(err)
        showToast('❌ Failed to submit review')
      })
  }

  const toggleReviews = (pId) => {
    setExpandedReviews(prev => ({ ...prev, [pId]: !prev[pId] }))
  }

  // Visual card badges & backdrops
  const dropBadges = ['🔥 HOT DROP', '⚡ BESTSELLER', 'LIMITED RUN', 'RESTOCKED', 'COMMUNITY PICK']
  const cardBackdrops = ['#FFF5EB', '#F0FDF4', '#F0F9FF', '#FAF5FF', '#FFFBEB', '#FFF1F2']

  return (
    <div className="comet-app">
      {/* 1. ANNOUNCEMENT TICKER (wearcomet.com signature) */}
      <div className="comet-ticker">
        <div className="ticker-track">
          <div className="ticker-item"><span>⚡ NEVER SHY, NEVER SORRY</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>👟 FRESH DROPS EVERY MONTH</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>⚡ 4 LAKH+ SNEAKERHEADS ACROSS INDIA</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>👟 FREE PREPAID DELIVERY &amp; 7-DAY EASY EXCHANGES</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>⚡ BREAK THE LOOP WITH COMET</span><span className="ticker-star">★</span></div>
          {/* Duplicate track for seamless infinite scroll */}
          <div className="ticker-item"><span>⚡ NEVER SHY, NEVER SORRY</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>👟 FRESH DROPS EVERY MONTH</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>⚡ 4 LAKH+ SNEAKERHEADS ACROSS INDIA</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>👟 FREE PREPAID DELIVERY &amp; 7-DAY EASY EXCHANGES</span><span className="ticker-star">★</span></div>
          <div className="ticker-item"><span>⚡ BREAK THE LOOP WITH COMET</span><span className="ticker-star">★</span></div>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="comet-navbar">
        <div className="nav-left">
          <a href="#drops" className="comet-logo">
            <span className="logo-text">COMET</span>
            <span className="logo-dot"></span>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#drops" className="nav-link active">SNEAKERS</a></li>
              <li><a href="#drops" className="nav-link">LATEST DROPS</a></li>
              <li><a href="#manifesto" className="nav-link">ABOUT COMET</a></li>
              <li><a href="#community" className="nav-link">REVIEWS</a></li>
            </ul>
          </nav>
        </div>

        <div className="nav-right">
          <div className="drop-status-pill">
            <span className="pulse-dot"></span>
            <span>DROP #28 LIVE</span>
          </div>

          <button 
            type="button" 
            className="btn-launch-drop"
            onClick={() => setIsModalOpen(true)}
          >
            + LAUNCH DROP
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION (EDITORIAL STREETWEAR BANNER) */}
      <section className="comet-hero">
        <div className="hero-backdrop-pattern"></div>
        <div className="hero-glow-blob"></div>

        <div className="hero-content">
          <div className="hero-tagline-badge">
            <span>⚡ INDIA'S DISRUPTIVE SNEAKER BRAND</span>
          </div>

          <h1 className="hero-title">
            NEVER SHY,<br />
            <span className="hero-title-highlight">NEVER SORRY.</span>
          </h1>

          <p className="hero-desc">
            We build bold, unapologetic unisex sneakers designed to break the repetitive loop of boring footwear. 
            Engineered with cloud-comfort soles, vibrant colorways, and street culture attitude.
          </p>

          <div className="hero-actions">
            <a href="#drops" className="btn-hero-primary">
              EXPLORE DROPS 👟
            </a>
            <button 
              type="button" 
              className="btn-hero-secondary"
              onClick={() => setIsModalOpen(true)}
            >
              + CREATE SNEAKER DROP
            </button>
          </div>

          {/* Metrics Proof Bar */}
          <div className="hero-proof-grid">
            <div className="proof-item">
              <span className="proof-value">4,00,000+</span>
              <span className="proof-label">Happy Feet Across India</span>
            </div>
            <div className="proof-item">
              <span className="proof-value">4.9 ★</span>
              <span className="proof-label">Sneakerhead Community Rating</span>
            </div>
            <div className="proof-item">
              <span className="proof-value">100%</span>
              <span className="proof-label">Vegan &amp; Cruelty-Free</span>
            </div>
            <div className="proof-item">
              <span className="proof-value">₹0</span>
              <span className="proof-label">Free Shipping on Prepaid</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SNEAKER CATALOG SECTION */}
      <main id="drops" className="comet-catalog-section">
        <div className="catalog-top-bar">
          <div>
            <div className="section-eyebrow">FRESH ARRIVALS &amp; CLASSICS</div>
            <h2 className="section-title">THE SNEAKER VAULT</h2>
          </div>

          <div className="catalog-filter-tabs">
            {['ALL', 'RETRO LOWS', 'CHUNKY HIGHS', 'LIMITED RUNS'].map(filter => (
              <button
                key={filter}
                type="button"
                className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter} {filter === 'ALL' && `(${products.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Sneaker Cards Grid */}
        <div className="sneaker-grid">
          {products.map((product, index) => {
            const pId = product._id || product.id
            const productReviews = reviews[pId] || []
            const avgRating = productReviews.length > 0
              ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
              : '4.9'
            const isExpanded = expandedReviews[pId]
            const badgeText = dropBadges[index % dropBadges.length]
            const bgTone = cardBackdrops[index % cardBackdrops.length]
            
            // Format price in Indian Rupees (INR)
            const formattedPrice = typeof product.price === 'number'
              ? `₹${product.price.toLocaleString('en-IN')}`
              : `₹${product.price}`
            
            const mrpPrice = typeof product.price === 'number'
              ? `₹${Math.round(product.price * 1.38).toLocaleString('en-IN')}`
              : `₹4,999`

            return (
              <article key={pId} className="sneaker-card">
                {/* Visual Box with Sneaker Illustration */}
                <div className="sneaker-visual-box" style={{ backgroundColor: bgTone }}>
                  <span className="card-badge">{badgeText}</span>
                  <span className="card-drop-tag">DROP #{28 - (index % 10)}</span>
                  <SneakerIllustration colorIndex={index} />
                </div>

                {/* Sneaker Info */}
                <div className="sneaker-info">
                  <span className="sneaker-category">UNISEX RETRO SNEAKERS</span>
                  
                  <div className="sneaker-header-row">
                    <h3 className="sneaker-title">{product.name}</h3>
                    <div className="sneaker-price-box">
                      <span className="sneaker-price">{formattedPrice}</span>
                      <span className="sneaker-mrp">{mrpPrice}</span>
                    </div>
                  </div>

                  {/* Rating Score */}
                  <div className="sneaker-rating-bar">
                    <StarRating rating={Math.round(Number(avgRating))} />
                    <span className="rating-count-pill">
                      {avgRating} ({productReviews.length} {productReviews.length === 1 ? 'Review' : 'Reviews'})
                    </span>
                  </div>

                  {/* Swatches */}
                  <div className="swatches-row">
                    <span className="swatch-dot" style={{ backgroundColor: '#EBEF29' }}></span>
                    <span className="swatch-dot" style={{ backgroundColor: '#18181B' }}></span>
                    <span className="swatch-dot" style={{ backgroundColor: '#FAF9F5' }}></span>
                    <span className="swatch-dot" style={{ backgroundColor: '#A78BFA' }}></span>
                  </div>

                  <p className="sneaker-description">
                    {product.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="card-actions-row">
                    <button 
                      type="button" 
                      className="btn-cop-sneaker"
                      onClick={() => showToast(`🛒 "${product.name}" added to your bag!`)}
                    >
                      <span>ADD TO BAG</span>
                      <span>⚡</span>
                    </button>

                    <button
                      type="button"
                      className="btn-toggle-reviews"
                      onClick={() => toggleReviews(pId)}
                    >
                      {isExpanded ? 'CLOSE' : `REVIEWS (${productReviews.length})`}
                    </button>
                  </div>
                </div>

                {/* Collapsible Reviews Tray */}
                {isExpanded && (
                  <div className="reviews-tray">
                    <div className="reviews-tray-header">
                      <span className="reviews-tray-title">THE SNEAKERHEAD VERDICT</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--comet-text-muted)' }}>
                        {productReviews.length} Verified Reviews
                      </span>
                    </div>

                    <div className="reviews-list">
                      {productReviews.length === 0 ? (
                        <div className="no-reviews-box">
                          No reviews yet for this drop. Be the first to share your fit!
                        </div>
                      ) : (
                        productReviews.map((review, rIdx) => (
                          <div key={review.id || rIdx} className="review-item-card">
                            <div className="review-item-header">
                              <span className="reviewer-name">
                                {review.user || review.user_name || 'Sneakerhead'}
                                <span className="verified-badge">✓ Verified</span>
                              </span>
                              <StarRating rating={review.rating} />
                            </div>
                            {review.comment && (
                              <p className="review-comment-text">"{review.comment}"</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Post Review Form */}
                    <form onSubmit={(e) => handleAddReview(e, pId)} className="review-input-form">
                      <div className="form-mini-title">POST YOUR REVIEW</div>
                      <div className="review-form-row">
                        <input
                          required
                          type="text"
                          className="comet-input"
                          placeholder="Your Name (e.g. Rahul S.)"
                          value={reviewForms[pId]?.user_name || ''}
                          onChange={e => handleReviewChange(pId, 'user_name', e.target.value)}
                        />
                        <select
                          required
                          className="comet-input"
                          value={reviewForms[pId]?.rating || '5'}
                          onChange={e => handleReviewChange(pId, 'rating', e.target.value)}
                        >
                          <option value="5">5 ★ (Flawless)</option>
                          <option value="4">4 ★ (Great)</option>
                          <option value="3">3 ★ (Average)</option>
                          <option value="2">2 ★ (Okay)</option>
                          <option value="1">1 ★ (Poor)</option>
                        </select>
                      </div>

                      <textarea
                        rows="2"
                        className="comet-textarea"
                        placeholder="How's the comfort, fit, and aesthetic on feet?..."
                        value={reviewForms[pId]?.comment || ''}
                        onChange={e => handleReviewChange(pId, 'comment', e.target.value)}
                      />

                      <button type="submit" className="btn-post-review">
                        POST VERDICT ★
                      </button>
                    </form>
                  </div>
                )}
              </article>
            )
          })}

          {/* Empty Catalog State */}
          {products.length === 0 && (
            <div className="comet-empty-catalog">
              <div className="empty-sneaker-icon">👟</div>
              <h3 className="empty-title">NO SNEAKER DROPS FOUND</h3>
              <p className="empty-sub">
                Be the pioneer. Launch the first sneaker drop to the live catalog using the button below.
              </p>
              <button 
                type="button" 
                className="btn-launch-drop"
                onClick={() => setIsModalOpen(true)}
              >
                + LAUNCH FIRST DROP
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 5. MODAL: LAUNCH NEW SNEAKER DROP */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-eyebrow">CREATOR VAULT</span>
                <h3 className="modal-title">LAUNCH A SNEAKER DROP</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleAddProduct} className="modal-form">
                <div className="field-group">
                  <label className="field-label">Sneaker Name / Edition</label>
                  <input
                    required
                    type="text"
                    className="comet-input"
                    placeholder="e.g. Comet Aeon 'Midnight Volt'"
                    value={newProductName}
                    onChange={e => setNewProductName(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Retail Price (INR ₹)</label>
                  <input
                    required
                    type="number"
                    className="comet-input"
                    placeholder="e.g. 4299"
                    value={newProductPrice}
                    onChange={e => setNewProductPrice(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Sneaker Story &amp; Fit Details</label>
                  <textarea
                    required
                    rows="4"
                    className="comet-textarea"
                    placeholder="Describe the materials, colorway inspiration, and street-ready comfort..."
                    value={newProductDesc}
                    onChange={e => setNewProductDesc(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-submit-drop">
                  ⚡ DROP SNEAKER TO CATALOG
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#0F0F11',
          color: '#EBEF29',
          border: '2px solid #EBEF29',
          padding: '1rem 1.75rem',
          borderRadius: '8px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          fontSize: '0.9rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 9999,
          animation: 'slideUp 0.2s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* 7. FOOTER (COMET BRAND MANIFESTO) */}
      <footer id="manifesto" className="comet-footer">
        <div className="footer-inner">
          <div className="footer-top-row">
            <div className="footer-brand">
              <div className="footer-logo">COMET</div>
              <p className="footer-manifesto">
                Comet is India's homegrown sneaker movement — built for the non-conformists, 
                the creators, and anyone who refuses to wear plain black-and-white shoes. 
                Never shy. Never sorry.
              </p>
            </div>

            <div className="footer-links-group">
              <div>
                <h4 className="footer-col-title">COLLECTIONS</h4>
                <ul className="footer-links-list">
                  <li className="footer-link-item">AEON RETRO LOWS</li>
                  <li className="footer-link-item">XENO CHUNKY</li>
                  <li className="footer-link-item">SPACE RUNNERS</li>
                  <li className="footer-link-item">LIMITED COLLABS</li>
                </ul>
              </div>

              <div>
                <h4 className="footer-col-title">COMMUNITY</h4>
                <ul className="footer-links-list">
                  <li className="footer-link-item">SNEAKERHEAD REVIEWS</li>
                  <li className="footer-link-item">CREATOR PROGRAM</li>
                  <li className="footer-link-item">DISCORD VAULT</li>
                  <li className="footer-link-item">DROP CALENDAR</li>
                </ul>
              </div>

              <div>
                <h4 className="footer-col-title">NEED HELP?</h4>
                <ul className="footer-links-list">
                  <li className="footer-link-item">TRACK YOUR ORDER</li>
                  <li className="footer-link-item">EXCHANGE &amp; RETURNS</li>
                  <li className="footer-link-item">SNEAKER CARE GUIDE</li>
                  <li className="footer-link-item">CONTACT CREW</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom-row">
            <span>© {new Date().getFullYear()} COMET SNEAKERS. All rights reserved.</span>
            <span>Handcrafted with rebellious energy in India.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
