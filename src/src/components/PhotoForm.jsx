import { useState, useEffect } from 'react';

function PhotoForm({ onSubmit, initialData, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Populate form when editing an existing photo
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      // Show existing image if editing
      if (initialData.filename) {
        setPreview(`http://localhost:3001/uploads/${initialData.filename}`);
      }
    } else {
      // Reset form when adding a new photo
      setTitle('');
      setDescription('');
      setFile(null);
      setPreview(null);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a temporary URL for live preview
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Append the new file if one was selected
    if (file) {
      formData.append('image', file); // 'image' must match backend's upload.single('image')
    } 
    // If editing and NO new file was selected, tell backend to keep the old filename
    else if (initialData && initialData.filename) {
      formData.append('filename', initialData.filename);
    }
    
    formData.append('title', title);
    formData.append('description', description);

    // Pass FormData up to App.js
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="photo-form">
      <div className="form-group">
        <label htmlFor="imageUpload">Image File *</label>
        <input 
          type="file" 
          id="imageUpload" 
          name="image" 
          accept="image/*" 
          onChange={handleFileChange} 
          required={!initialData} // Required only when adding a new photo
        />
        {preview && (
          <img src={preview} alt="Preview" className="image-preview" />
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input 
          type="text" 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Enter photo title"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Enter photo description"
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