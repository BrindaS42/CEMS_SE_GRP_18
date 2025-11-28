import { pythonClient } from "../services/ai.service.js";

export const getRecommendations = async (req, res) => {
    try {
      const response = await pythonClient.get(`/recommend/hybrid/${req.user.id}`);
      return res.json(response.data);
    } catch (err) {
      console.error("Hybrid Recommendation Error:", err);
      return res.status(500).json({ error: "Hybrid recommendation failed" });
    }
  };

export const getContentBasedRecommendations = async (req, res) => {
  try {
    const response = await pythonClient.get(`/recommend/content-based/${req.user.id}`);
    return res.json(response.data);
  } catch (err) {
    console.error("Content-Based Recommendation Error:", err);
    return res.status(500).json({ error: "Content-based recommendation failed" });
  }
};

  export const queryChatBot = async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Query required" });
  
      const response = await pythonClient.post("/bot/query", {
        question: query, // The python service expects 'question'
        user_role: req.user.role,
        user_id: req.user.id,
      });
  
      return res.json(response.data);
    } catch (err) {
      console.error("Chatbot Error:", err)
      return res.status(500).json({ error: "Chatbot failed" });
    }
  };

  export const rebuildSearchIndex = async (req, res) => {
    try {
      const response = await pythonClient.post("/recommend/rebuild");
      return res.json(response.data);
    } catch (err) {
      console.error("Rebuild Index Error:", err);
      return res.status(500).json({ error: "Rebuilding search index failed" });
    }
  };