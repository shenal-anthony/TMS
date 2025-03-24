// const apiUrl = import.meta.env.VITE_API_URL;

import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Events = () => {
  const [formData, setFormData] = useState({
    accommodationName: '',
    locationUrl: '',
    contactNumber: '',
    amenities: '',
    serviceUrl: '',
    accommodationType: ''
  });
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [picture, setPicture] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      // Append the date/time in ISO format
      data.append('updatedAt', updatedAt.toISOString());
      
      // Append file
      if (picture) {
        data.append('picture', picture);
      }

      const response = await axios.post(`${apiUrl}/api/tourists/accommodations`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Accommodation added successfully!');
      // Reset form
      setFormData({
        accommodationName: '',
        locationUrl: '',
        contactNumber: '',
        amenities: '',
        serviceUrl: '',
        accommodationType: ''
      });
      setUpdatedAt(new Date());
      setPicture(null);
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error adding accommodation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Accommodation</h2>
      <form onSubmit={handleSubmit}>
        {/* Text Inputs */}
        <div className="form-group">
          <label>Accommodation Name:</label>
          <input
            type="text"
            name="accommodationName"
            value={formData.accommodationName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location URL:</label>
          <input
            type="text"
            name="locationUrl"
            value={formData.locationUrl}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Contact Number:</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Amenities:</label>
          <input
            type="text"
            name="amenities"
            value={formData.amenities}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Service URL:</label>
          <input
            type="text"
            name="serviceUrl"
            value={formData.serviceUrl}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Accommodation Type:</label>
          <input
            type="text"
            name="accommodationType"
            value={formData.accommodationType}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date/Time Picker */}
        <div className="form-group">
          <label>Updated At:</label>
          <DatePicker
            selected={updatedAt}
            onChange={(date) => setUpdatedAt(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="date-picker-input"
          />
        </div>

        {/* File Input */}
        <div className="form-group">
          <label>Accommodation Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPicture(e.target.files[0])}
            required
          />
          <small>Max 5MB (JPEG, JPG, PNG, GIF)</small>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Add Accommodation'}
        </button>
      </form>

      <style jsx>{`
        .form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input, .date-picker-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        small {
          display: block;
          color: #666;
          font-size: 0.8em;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default Events;
