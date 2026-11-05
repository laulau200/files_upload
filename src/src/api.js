const API_BASE_URL = 'http://localhost:3001/api';

export const getPhotos = async () => {
  const response = await fetch(`${API_BASE_URL}/photos`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch photos');
  }
  return response.json();
};

export const addPhoto = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/photos`, {
    method: 'POST',
    body: formData, // Browser handles Content-Type automatically
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add photo');
  }
  return response.json();
};

export const updatePhoto = async (id, formData) => {
  const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update photo');
  }
  return response.json();
};

export const deletePhoto = async (id) => {
  const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete photo');
  }
  return response.json();
};