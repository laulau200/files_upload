import React, { useState, useEffect } from 'react';
import './Diaporama.css'; // Create this CSS file for styling
import axios from 'axios';  // Import Axios


const Diaporama = () => {
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Fetch photos from the backend API
    fetch('/api/photos')
      .then((response) => response.json())
      .then((data) => {
        setPhotos(data);
        setIsLoading(false);
      })
      .catch((error) => console.error('Error fetching photos:', error));
  }, []);
  
  // Add Photo Button
    const handleAddPhoto = async () => {
        try {
            const response = await axios.post('/api/photos', { filename: 'new_photo.jpg', title: 'New Title', description: 'New Description' }); // Adjust fields as needed
            setPhotos([...photos, response.data]);  // Add new photo to the state
        } catch (error) {
            console.error('Error adding photo:', error);
        }
    };

    // Delete Photo Button - Implement this based on your needs
    const handleDeletePhoto = async (id) => {
      try {
          await axios.delete(`/api/photos/${id}`);
          setPhotos(photos.filter((photo) => photo.id !== id)); // Remove from state
      } catch (error) {
          console.error('Error deleting photo:', error);
      }
    };

    // ... (previous logic for navigation, etc.)
};

export default Diaporama;