import { useState, useEffect } from 'react';

function PhotoForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    filename: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        filename: initialData.filename || '',
        title: initialData.title || '',
        description: initialData.description || ''
      });
    } else {
      setFormData({ filename: '', title: '', description: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.filename.trim()) {
      alert('Filename is required');
      return;
    }
    onSubmit(formData);
    if (!initialData) {
      setFormData({ filename: '', title: '', description: '' }); // Reset form after add
    }
  };

  return (
    <form onSubmit={handleSubmit} className="photo-form">
      <div className="form-group">
        <label htmlFor="filename">Filename *</label>
        <input
          type="text"
          id="filename"
          name="filename"
          value={formData.filename}
          onChange={handleChange}
          placeholder="e.g., image1.jpg"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Photo title"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Photo description"
          rows="3"
        />
      </div>
      
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {initialData ? 'Update Photo' : 'Add Photo'}
        </button>
        {initialData && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default PhotoForm;