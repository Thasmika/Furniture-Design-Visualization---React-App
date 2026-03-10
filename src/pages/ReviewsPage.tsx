import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import './ReviewsPage.css';

interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: Date;
}

export const ReviewsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      rating: 5,
      comment: 'Amazing tool! Really helped me visualize my room design before buying furniture.',
      date: new Date('2024-02-10'),
    },
    {
      id: '2',
      userName: 'Sarah Smith',
      userEmail: 'sarah@example.com',
      rating: 4,
      comment: 'Great app with intuitive interface. Would love to see more furniture options.',
      date: new Date('2024-02-08'),
    },
    {
      id: '3',
      userName: 'Mike Johnson',
      userEmail: 'mike@example.com',
      rating: 5,
      comment: 'The 3D visualization is fantastic! Saved me from making expensive mistakes.',
      date: new Date('2024-02-05'),
    },
  ]);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (newReview.comment.trim().length < 10) {
      alert('Please write at least 10 characters');
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userName: user.email?.split('@')[0] || 'Anonymous',
      userEmail: user.email || '',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date(),
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="reviews-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-item" onClick={() => navigate('/')}>
          <span className="sidebar-icon">📊</span>
          <span>Dashboard</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('/')}>
          <span className="sidebar-icon">📁</span>
          <span>My Designs</span>
        </div>
        <div className="sidebar-item active">
          <span className="sidebar-icon">⭐</span>
          <span>Reviews</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('/profile')}>
          <span className="sidebar-icon">👤</span>
          <span>Profile</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="reviews-header">
          <div>
            <h1>Customer Reviews</h1>
            <p className="subtitle">See what our users are saying</p>
          </div>
          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="write-review-btn"
          >
            ✍️ Write a Review
          </button>
        </div>

        {/* Overall Rating */}
        <div className="overall-rating-card">
          <div className="rating-summary">
            <div className="rating-number">{averageRating}</div>
            <div className="rating-details">
              {renderStars(parseFloat(averageRating))}
              <div className="rating-count">Based on {reviews.length} reviews</div>
            </div>
          </div>
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="rating-bar-row">
                  <span className="star-label">{star} ★</span>
                  <div className="rating-bar">
                    <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="rating-count-label">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="review-form-card">
            <h3>Write Your Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Your Rating</label>
                {renderStars(newReview.rating, true, (rating) =>
                  setNewReview({ ...newReview, rating })
                )}
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with the Furniture Design Visualizer..."
                  rows={5}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          <h3>All Reviews ({reviews.length})</h3>
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="reviewer-name">{review.userName}</div>
                    <div className="review-date">{formatDate(review.date)}</div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              <div className="review-comment">{review.comment}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
