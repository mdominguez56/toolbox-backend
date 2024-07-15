const express = require("express");
const axios = require("axios");
const csvParser = require("csv-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;
const FILES_API_URL = "https://echo-serv.tbxnet.com/v1/secret/files";
const FILE_API_URL = "https://echo-serv.tbxnet.com/v1/secret/file";
const TOKEN = "aSuperSecretKey";

app.use(cors());

app.get("/files/data", async (req, res) => {
  try {
    const filesResponse = await axios.get(FILES_API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    const files = filesResponse.data.files;
    const allFilesData = [];
    let processedFiles = 0;

    files.forEach((file) => {
      axios
        .get(`${FILE_API_URL}/${file}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
          responseType: "stream",
        })
        .then((fileResponse) => {
          const fileData = [];
          fileResponse.data
            .pipe(csvParser())
            .on("data", (row) => {
              if (row.file && row.text && row.number && row.hex) {
                fileData.push({
                  text: row.text,
                  number: parseInt(row.number, 10),
                  hex: row.hex,
                });
              }
            })
            .on("end", () => {
              allFilesData.push({ file, lines: fileData });
              processedFiles++;
              if (processedFiles === files.length) {
                res.json(allFilesData);
              }
            });
        })
        .catch((error) => {
          console.error(`Error fetching file ${file}: `, error);
          processedFiles++;
          if (processedFiles === files.length) {
            res.json(allFilesData);
          }
        });
    });
  } catch (error) {
    console.error("Error fetching files: ", error);
    res.status(500).json({ error: "Error fetching files" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
