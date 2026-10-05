import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# PostgreSQL connection
db_uri = os.environ.get('DATABASE_URL') or 'postgresql://postgres:postgres@localhost:5432/ecommerce'
app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(50), nullable=False) # String because MongoDB IDs are strings
    user_name = db.Column(db.String(80), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

with app.app_context():
    db.create_all()

@app.route('/reviews/<product_id>', methods=['GET'])
def get_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id).all()
    return jsonify([{'id': r.id, 'product_id': r.product_id, 'user': r.user_name, 'rating': r.rating, 'comment': r.comment} for r in reviews])

@app.route('/reviews', methods=['POST'])
def add_review():
    data = request.json
    new_review = Review(
        product_id=data['product_id'],
        user_name=data['user_name'],
        rating=data['rating'],
        comment=data.get('comment', '')
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify({'message': 'Review added successfully'}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3002)
