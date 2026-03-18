import type { FurnitureItem } from '../../models/FurnitureItem';
import './FurnitureShowcaseSection.css';

// Sample furniture data with Unsplash images as fallback
const SAMPLE_FURNITURE: FurnitureItem[] = [
  {
    id: 'sample-1',
    name: 'Modern Lounge Chair',
    type: 'chair',
    color: '#8B4513',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sample-2',
    name: 'Elegant Dining Table',
    type: 'table',
    color: '#654321',
    price: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=500&fit=crop',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sample-3',
    name: 'Comfortable Sofa',
    type: 'couch',
    color: '#696969',
    price: 125000,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sample-4',
    name: 'King Size Bed',
    type: 'bed',
    color: '#F5F5DC',
    price: 175000,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=500&fit=crop',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sample-5',
    name: 'Executive Desk',
    type: 'desk',
    color: '#2F4F4F',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&h=500&fit=crop',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sample-6',
    name: 'Bookshelf Unit',
    type: 'shelf',
    color: '#8B7355',
    price: 38000,
    imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&h=500&fit=crop',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const FurnitureShowcaseSection = () => {
  return (
    <section className="furniture-showcase-section">
      <div className="furniture-showcase-container">
        <h2 className="furniture-showcase-title">Our Furniture Collection</h2>
        <p className="furniture-showcase-subtitle">
          Explore our curated selection of quality furniture pieces
        </p>
        
        <div className="furniture-grid">
          {SAMPLE_FURNITURE.map((item) => (
            <div key={item.id} className="furniture-card" style={{ '--swatch-color': item.color } as React.CSSProperties}>
              <div className="furniture-card-image-wrapper">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="furniture-card-image"
                  loading="lazy"
                />
                <div className="furniture-card-type-badge">{item.type}</div>
              </div>
              
              <div className="furniture-card-content">
                <h3 className="furniture-card-title">{item.name}</h3>
                
                <div className="furniture-card-details">
                  <div className="furniture-card-color">
                    <span className="color-label">Color:</span>
                    <div 
                      className="color-swatch"
                      title={item.color}
                    />
                  </div>
                  
                  <div className="furniture-card-price">
                    Rs. {item.price.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
