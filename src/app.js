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
  const { fileName } = req.query;

  try {
    const filesResponse = await axios.get(FILES_API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    const files = filesResponse.data.files;
    const allFilesData = [];
    let processedFiles = 0;

    const processFile = (file) => {
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
              console.log(
                `Processed file: ${file}, Processed files count: ${processedFiles}`
              );
              if (processedFiles === (fileName ? 1 : files.length)) {
                console.log("Sending response with all files data");
                res.json(allFilesData);
              }
            });
        })
        .catch((error) => {
          console.error(`Error fetching file ${file}: `, error);
          processedFiles++;
          if (processedFiles === (fileName ? 1 : files.length)) {
            res.json(allFilesData);
          }
        });
    };

    if (fileName) {
      const matchedFile = files.find((file) => file.includes(fileName));
      console.log("Matched file:", matchedFile);
      if (matchedFile) {
        processFile(matchedFile);
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } else {
      files.forEach(processFile);
    }
  } catch (error) {
    console.error("Error fetching files: ", error);
    res.status(500).json({ error: "Error fetching files" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
