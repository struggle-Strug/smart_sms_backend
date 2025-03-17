const path = require("path");
const fs = require("fs");
// const xlsx = require("xlsx");
// const csv = require("csv-parser");

// ExcelをCSVに変換する関数
function convertExcelToCsv(excelFilePath, csvFilePath, callback) {
  const xlsx = require("xlsx");

  try {
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    fs.writeFile(csvFilePath, sheetData, callback);
  } catch (error) {
    callback(error);
  }
}

// CSVをSQLiteテーブルにインポートする関数
function importCsvToTable(db, tableName, csvFilePath, callback) {
  const csv = require("csv-parser");
  const fs = require("fs");

  const data = [];
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", () => {
      let totalLines = data.length;
      let updatedLines = 0;
      let importedLines = 0;
      let newRecords = 0;

      // データベース更新処理
      data.forEach((row) => {
        const keys = Object.keys(row);
        const values = Object.values(row);

        // データが既に存在する場合は更新、存在しない場合は挿入
        const placeholders = keys.map(() => "?").join(",");
        const updateFields = keys.map((key) => `${key} = ?`).join(",");
        const query = `
          INSERT INTO ${tableName} (${keys.join(",")})
          VALUES (${placeholders})
          ON DUPLICATE KEY UPDATE ${updateFields};
        `;

        db.query(query, [...values, ...values], (err, result) => {
          if (err) {
            console.error(`Failed to insert/update ${tableName}:`, err);
          } else {
            if (result.affectedRows === 1) newRecords++; // New record inserted
            if (result.affectedRows === 2) updatedLines++; // Existing record updated
            importedLines++;
          }
        });
      });

      callback(null, { totalLines, updatedLines, importedLines, newRecords });
    })
    .on("error", (err) => {
      callback(err);
    });
}

function saveImportLog(db, log, callback) {
  const query = `
    INSERT INTO data_conversions 
    (file_name, complete_time, total_line_count, updated_record, imported_line_count, new_record)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    log.file_name,
    log.complete_time,
    log.total_line_count,
    log.updated_record,
    log.imported_line_count,
    log.new_record,
  ];

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Failed to insert into data_conversions:", err);
      return callback(err);
    }
    callback(null, result);
  });

}

module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS data_conversions (
                file_name VARCHAR(255) DEFAULT NULL, -- ファイル名
                complete_time DATE NOT NULL, -- 完了時間
                total_line_count INT NOT NULL, -- 総行数
                updated_record INT NOT NULL, -- 更新されたレコード数
                imported_line_count INT NOT NULL, -- インポートされた行数
                new_record INT NOT NULL -- 新規レコード数
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating dataConversions table:", err.message);
            return res.status(500).send("Error initializing dataConversions table.");
          }
          res.send("DataConversions table initialized successfully.");
        });
      },

      getFormattedDate: (req, res) => {
        const now = new Date();
        now.setHours(now.getHours() + 9); // 日本時間に変換 (UTC+9)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0"); // 月は0から始まるので+1
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      },

      loadDataConversions: (req, res) => {
        const sql = "SELECT * FROM data_conversions";
        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading dataConversions:", err.message);
            return res.status(500).send("Error loading dataConversions.");
          }
          res.json(rows);
        });
      },

      importExcelToDatabase: (req, res) => {
        const { excelDirPath, csvDirPath } = req.body;
        fs.readdir(excelDirPath, (err, files) => {
            if (err) return callback(err);
        
            const excelFiles = files.filter((file) => file.endsWith(".xlsx"));
            let remaining = excelFiles.length;
            const logs = [];
        
            if (remaining === 0) return callback(null, "No Excel files to import.");
        
            excelFiles.forEach((file) => {
              const tableName = path.basename(file, ".xlsx"); // Excelファイル名からテーブル名を取得
              const excelFilePath = path.join(excelDirPath, file);
              const csvFilePath = path.join(csvDirPath, `${tableName}.csv`);
        
              // ExcelをCSVに変換
              convertExcelToCsv(excelFilePath, csvFilePath, (err) => {
                if (err) return res.json(err);
        
                // CSVをテーブルにインポート
                importCsvToTable(db, tableName, csvFilePath, (err, stats) => {
                  if (err) return res.json(err);
        
                  // 更新ログを記録
                  const log = {
                    file_name: file,
                    complete_time: getFormattedDate(),
                    total_line_count: stats.newRecords,
                    // total_line_count: stats.totalLines,
                    updated_record: stats.updatedLines,
                    imported_line_count: stats.importedLines,
                    new_record: stats.totalLines,
                    // new_record: stats.newRecords,
                  };
                  logs.push(log);
        
                  saveImportLog(db, log, (err) => {
                    if (err) console.error("Failed to save import log:", err);
                  });
        
                  remaining -= 1;
                  if (remaining === 0) {
                    res.json(logs);
                  }
                });
              });
            });
          });
      }
    };
  };
  