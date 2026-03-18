import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../components/AppNavBar';
import { useToast } from '../components/Toast';
import {
  fetchFurnitureItems,
  addFurnitureItem,
  updateFurnitureItem,
  deleteFurnitureItem,
} from '../services/furnitureService';
import type { FurnitureItem, FurnitureType } from '../models/FurnitureItem';
import './ManagePage.css';

const FURNITURE_TYPES: FurnitureType[] = [
  'chair',
  'table',
  'couch',
  'bed',
  'desk',
  'shelf',
  'cabinet',
  'lamp',
];

interface FormData {
  name: string;
  type: FurnitureType;
  color: string;
  price: string;
  imageUrl: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  color?: string;
  price?: string;
  imageUrl?: string;
}

export const ManagePage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Furniture items state
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'chair',
    color: '#000000',
    price: '',
    imageUrl: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load furniture items on mount
  useEffect(() => {
    loadFurnitureItems();
  }, []);

  const loadFurnitureItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedItems = await fetchFurnitureItems();
      setItems(fetchedItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load furniture items';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.type) {
      errors.type = 'Type is required';
    }

    if (!formData.color.trim()) {
      errors.color = 'Color is required';
    } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(formData.color)) {
      errors.color = 'Color must be a valid hex code (e.g., #FF5733)';
    }

    if (!formData.price.trim()) {
      errors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 0) {
        errors.price = 'Price must be a non-negative number';
      }
    }

    if (!formData.imageUrl.trim()) {
      errors.imageUrl = 'Image URL is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const priceInCents = Math.round(parseFloat(formData.price) * 100);

      await addFurnitureItem({
        name: formData.name,
        type: formData.type,
        color: formData.color,
        price: priceInCents,
        imageUrl: formData.imageUrl,
      });

      showSuccess('Furniture item added successfully');
      
      // Clear form
      setFormData({
        name: '',
        type: 'chair',
        color: '#000000',
        price: '',
        imageUrl: '',
      });
      setFormErrors({});

      // Refresh table
      await loadFurnitureItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add furniture item';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (item: FurnitureItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      type: item.type,
      color: item.color,
      price: (item.price / 100).toFixed(2),
      imageUrl: item.imageUrl,
    });
    setFormErrors({});
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!editingId || !validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const priceInCents = Math.round(parseFloat(formData.price) * 100);

      await updateFurnitureItem(editingId, {
        name: formData.name,
        type: formData.type,
        color: formData.color,
        price: priceInCents,
        imageUrl: formData.imageUrl,
      });

      showSuccess('Furniture item updated successfully');

      // Clear edit state
      setEditingId(null);
      setFormData({
        name: '',
        type: 'chair',
        color: '#000000',
        price: '',
        imageUrl: '',
      });
      setFormErrors({});

      // Refresh table
      await loadFurnitureItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update furniture item';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'chair',
      color: '#000000',
      price: '',
      imageUrl: '',
    });
    setFormErrors({});
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteFurnitureItem(deleteConfirmId);
      showSuccess('Furniture item deleted successfully');
      setDeleteConfirmId(null);

      // Refresh table
      await loadFurnitureItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete furniture item';
      showError(errorMessage);
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const formatPrice = (priceInCents: number): string => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <div className="manage-page">
      <AppNavBar />
      <header className="manage-header">
        <div className="header-content">
          <h1>Manage Furniture Library</h1>
          <button type="button" onClick={() => navigate('/editor')} className="btn-back">
            Back to Editor
          </button>
        </div>
      </header>

      <main className="manage-content">
        {/* Add/Edit Form */}
        <section className="form-section">
          <h2>{editingId ? 'Edit Furniture Item' : 'Add New Furniture Item'}</h2>
          <form onSubmit={editingId ? handleEditSubmit : handleAddSubmit} className="furniture-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type">Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={formErrors.type ? 'error' : ''}
                  disabled={isSubmitting}
                >
                  {FURNITURE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.type && <span className="error-message">{formErrors.type}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="color">Color (Hex) *</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="color-picker"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="color-picker"
                    aria-label="Color picker"
                  />
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className={formErrors.color ? 'error' : ''}
                    disabled={isSubmitting}
                    placeholder="#000000"
                  />
                </div>
                {formErrors.color && <span className="error-message">{formErrors.color}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="price">Price (USD) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={formErrors.price ? 'error' : ''}
                  disabled={isSubmitting}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {formErrors.price && <span className="error-message">{formErrors.price}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL *</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className={formErrors.imageUrl ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="https://example.com/image.jpg"
              />
              {formErrors.imageUrl && <span className="error-message">{formErrors.imageUrl}</span>}
            </div>

            <div className="form-actions">
              {editingId ? (
                <>
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Item'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-cancel-edit"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Item'}
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Furniture Table */}
        <section className="table-section">
          <h2>Furniture Items</h2>

          {error && (
            <div className="error-banner">
              {error}
              <button type="button" onClick={loadFurnitureItems} className="btn-retry">
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading furniture items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🪑</div>
              <h3>No furniture items yet</h3>
              <p>Add your first furniture item using the form above.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="furniture-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Color</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="item-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </td>
                      <td>{item.name}</td>
                      <td className="type-cell">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </td>
                      <td>
                        <div className="color-display">
                          <span
                            className="color-swatch"
                            style={{ '--swatch-color': item.color } as React.CSSProperties}
                          ></span>
                          <span className="color-hex">{item.color}</span>
                        </div>
                      </td>
                      <td className="price-cell">{formatPrice(item.price)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="btn-edit"
                            disabled={isSubmitting}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item.id)}
                            className="btn-delete"
                            disabled={isSubmitting}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Furniture Item?</h2>
            <p>
              Are you sure you want to delete this furniture item? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button type="button" onClick={handleDeleteCancel} className="btn-cancel">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteConfirm} className="btn-confirm-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
