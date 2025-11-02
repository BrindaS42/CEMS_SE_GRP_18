import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error('Cloudinary cloud name or upload preset is not defined.');
    throw new Error('Upload configuration is missing.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { secure_url } = response.data;
    
    if (!secure_url) {
      throw new Error('Upload succeeded but no secure_url was returned.');
    }

    return secure_url;

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.response?.data || error.message);
    throw new Error('Image upload failed.');
  }
};