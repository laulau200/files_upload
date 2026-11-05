function PhotoList({ photos, onEdit, onDelete }) {
  return (
    <ul className="photo-list">
      {photos.map((photo) => (
        <li key={photo.id} className="photo-item">
          <img 
            src={`http://localhost:3001/uploads/${photo.filename}`} 
            alt={photo.title || 'Photo'} 
            className="photo-thumbnail"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
          />
          <div className="photo-info">
            <h3>{photo.title || 'Untitled'}</h3>
            <p className="photo-description">{photo.description}</p>
            <small>Added: {new Date(photo.created_at).toLocaleDateString()}</small>
          </div>
          <div className="photo-actions">
            <button className="btn-edit" onClick={() => onEdit(photo)}>Edit</button>
            <button className="btn-delete" onClick={() => onDelete(photo.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default PhotoList;