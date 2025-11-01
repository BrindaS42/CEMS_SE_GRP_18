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

  export const queryChatBot = async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) return res.status(400).json({ error: "Question required" });
  
      const response = await pythonClient.post("/bot/query", {
        question,
        user_role: req.user.role,
        user_id: req.user.id,
      });
  
      return res.json(response.data);
    } catch (err) {
      console.error("Chatbot Error:", err)
      return res.status(500).json({ error: "Chatbot failed" });
    }
  };