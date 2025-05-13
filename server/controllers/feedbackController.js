const path = require("path");
const feedback = require("../models/feedbackModel"); // adjust path as needed


const uploadFiles = async (req, res) => {
  try {
    const fileFields = req.files;
    const profileImage = fileFields["profileImage"]?.[0];
    const documents = fileFields["documents"] || [];

    // Step 1: Build file URLs
    const profileImageUrl = profileImage
      ? path.join("/uploads/profile", profileImage.filename)
      : null;

    const documentUrls = documents.map((file) =>
      path.join("/uploads/docs", file.filename)
    );

    // Step 2: Create feedback text by combining file URLs
    const urls = [];
    if (profileImageUrl) urls.push(profileImageUrl);
    urls.push(...documentUrls);
    const feedbackText = urls.join(",");
    

    // Step 3: Extract body fields
    const { touristId, rating, dateSubmitted } = req.body;

    // Step 4: Save to DB
    const newFeedback = await feedback.createFeedback({
      touristId,
      rating,
      feedbackText,
      dateSubmitted,
    });
    console.log("🚀 ~ feedbackController.js:69 ~ uploadFiles ~ newFeedback:", newFeedback);

    // Step 5: Respond
    res.status(201).json({
      message: "Files uploaded and feedback saved!",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload and DB save failed." });
  }
};


const viewAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await feedback.getAllFeedbacks(); // assuming it returns all rows
    console.log("🚀 ~ feedbackController.js:54 ~ viewAllFeedbacks ~ feedbacks:", feedbacks);

    const parsedFeedbacks = feedbacks.map((fb) => {
      const fileUrls = fb.feedback_text ? fb.feedback_text.split(",") : [];
      return {
        touristId: fb.tourist_id,
        rating: fb.rating,
        dateSubmitted: fb.date_submitted,
        fileUrls,
      };
    });

    res.status(200).json({ feedbacks: parsedFeedbacks });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ error: "Failed to fetch feedbacks." });
  }
};

module.exports = {
  viewAllFeedbacks,
  uploadFiles
};
