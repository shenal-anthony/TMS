import React, { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const Feedbacks = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [touristId, setTouristId] = useState(""); // controlled input
  const [rating, setRating] = useState(5); // default rating
  const [uploaded, setUploaded] = useState({ profileImage: null, documents: [] });
  const [feedbacks, setFeedbacks] = useState([]); // Store feedbacks
  const [loading, setLoading] = useState(true); // Loading state for feedbacks

  // Fetch feedbacks when the component mounts
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/auth/view/feedbacks`);
        setFeedbacks(res.data.feedbacks);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!touristId || !rating) {
      alert("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("touristId", touristId);
    formData.append("rating", rating);
    formData.append("dateSubmitted", new Date().toISOString());

    if (profileImage) formData.append("profileImage", profileImage);
    documents.forEach((doc) => formData.append("documents", doc));

    try {
      const res = await axios.post(`${apiUrl}/api/auth/upload/feedbacks`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploaded({
        profileImage: res.data.profileImage,
        documents: res.data.documents,
      });

      // Fetch updated feedbacks after successful upload
      const updatedFeedbacks = await axios.get(`${apiUrl}/api/auth/view/feedbacks`);
      setFeedbacks(updatedFeedbacks.data.feedbacks);

      alert("Upload success");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <h2>Upload Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tourist ID:</label>
          <input
            type="number"
            value={touristId}
            onChange={(e) => setTouristId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Rating:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
          />
        </div>
        <div>
          <label>Documents (max 3):</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setDocuments(Array.from(e.target.files))}
          />
        </div>
        <button type="submit">Upload</button>
      </form>

      {uploaded.profileImage && (
        <div>
          <h4>Uploaded Profile Image:</h4>
          <img
            src={`${apiUrl}${uploaded.profileImage}`}
            alt="Profile"
            width="150"
            style={{ borderRadius: "8px", marginBottom: "1rem" }}
          />
        </div>
      )}

      {uploaded.documents.length > 0 && (
        <div>
          <h4>Uploaded Documents:</h4>
          {uploaded.documents.map((doc, idx) => (
            <img
              key={idx}
              src={`${apiUrl}${doc}`}
              alt={`Document ${idx + 1}`}
              width="100"
              style={{ margin: "0.5rem" }}
            />
          ))}
        </div>
      )}

      {/* Display previously uploaded feedbacks */}
      <h2>Uploaded Feedbacks</h2>
      {loading ? (
        <p>Loading feedbacks...</p>
      ) : (
        <div>
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback, idx) => (
              <div key={idx}>
                <h3>Feedback from Tourist ID: {feedback.touristId}</h3>
                <p>Rating: {feedback.rating}</p>
                <p>Date Submitted: {new Date(feedback.dateSubmitted).toLocaleString()}</p>
                <div>
                  <h4>Uploaded Files:</h4>
                  {feedback.fileUrls.map((url, fileIdx) => (
                    <img
                      key={fileIdx}
                      src={`${apiUrl}${url}`}
                      alt={`Uploaded File ${fileIdx + 1}`}
                      width="100"
                      style={{ margin: "0.5rem" }}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>No feedbacks available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
