const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 5000;
const API_URL = "https://echo-serv.tbxnet.com/v1/secret/files";
const TOKEN = "aSuperSecretKey";

app.get("/files", async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    const files = response.data.files;
    res.json(files);
  } catch (error) {
    console.error("Error fetching files: ", error);
    res.status(500).json({ error: "Error fetching files" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
