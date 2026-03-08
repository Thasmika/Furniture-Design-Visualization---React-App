interface StarRatingProps {
  rating: number; // 1-5
  className?: string;
}

export const StarRating = ({ rating, className = '' }: StarRatingProps) => {
  const clampedRating = Math.max(1, Math.min(5, Math.round(rating)));
  
  return (
    <div className={`star-rating ${className}`} aria-label={`${clampedRating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= clampedRating ? 'star-filled' : 'star-empty'}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
};
