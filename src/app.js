const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 5000;

app.get("/api/data", async (req, res) => {
  try {
    const response = await axios.get(
      "https://echo-serv.tbxnet.com/v1/echo?text=Test"
    );
    const reformattedData = response.data;
    res.json(reformattedData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
