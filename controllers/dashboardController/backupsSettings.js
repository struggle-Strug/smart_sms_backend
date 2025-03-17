
const path = require("path");
const fs = require("fs");
const fastcsv = require("fast-csv");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

module.exports = (db) => {
    return {
        loadAllTablesData: (req, res) => {
            // Query to get all table names
            db.query(
              "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()",
              [],
              (err, tables) => {
                if (err) {
                  console.error("Error fetching table names:", err.message);
                  return res.status(500).json({ error: "Error fetching table names" });
                }
          
                const allData = {};
                let remaining = tables.length;
          
                if (remaining === 0) {
                  // No tables in the database
                  return res.json(allData);
                }
          
                // Fetch data from each table
                tables.forEach((table) => {
                  const tableName = table.name;
          
                  db.query(`SELECT * FROM \`${tableName}\``, [], (err, rows) => {
                    if (err) {
                      console.error(`Error fetching data from table ${tableName}:`, err.message);
                      return res
                        .status(500)
                        .json({ error: `Error fetching data from table ${tableName}` });
                    }
          
                    allData[tableName] = rows;
                    remaining--;
          
                    // Send response once all tables are processed
                    if (remaining === 0) {
                      res.json(allData);
                    }
                  });
                });
              }
            );
        },

        loadAllTablesDataAndExportToCSV: (req, res) => {
            const { outputDir } = req.body; // Output directory for CSV files
          
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }
          
            // Query to get all table names
            db.query(
              "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE()",
              (err, tables) => {
                if (err) {
                  console.error("Error retrieving tables:", err);
                  return res.status(500).json({ error: "Error retrieving tables" });
                }
          
                let completedTables = 0;
                const totalTables = tables.length;
          
                if (totalTables === 0) {
                  return res.json({ message: "No tables found in the database." });
                }
          
                tables.forEach((table) => {
                  const tableName = table.name;
          
                  db.query(`SELECT * FROM \`${tableName}\``, (err, rows) => {
                    if (err) {
                      console.error(`Error retrieving data from table ${tableName}:`, err);
                      return res.status(500).json({ error: `Error retrieving data from table ${tableName}` });
                    }
          
                    if (rows.length > 0) {
                      const csvWriter = createCsvWriter({
                        path: path.join(outputDir, `${tableName}.csv`),
                        header: Object.keys(rows[0]).map((column) => ({
                          id: column,
                          title: column,
                        })),
                      });
          
                      csvWriter
                        .writeRecords(rows)
                        .then(() => {
                          console.log(`Data from table ${tableName} has been written to ${tableName}.csv`);
                          completedTables++;
          
                          if (completedTables === totalTables) {
                            res.json({ message: "Backup created successfully.", outputDir });
                          }
                        })
                        .catch((err) => {
                          console.error(`Error writing CSV for table ${tableName}:`, err);
                          res.status(500).json({ error: `Error writing CSV for table ${tableName}` });
                        });
                    } else {
                      completedTables++;
                      if (completedTables === totalTables) {
                        res.json({ message: "Backup created successfully.", outputDir });
                      }
                    }
                  });
                });
              }
            );
        },

        convertToCSV: (req, res) => {
            const { rows } = req.body;
            if (!rows || rows.length === 0) {
              return ""; // Return an empty string if there are no rows
            }
          
            const headers = Object.keys(rows[0]); // Extract column names as headers
            const csvRows = rows.map((row) =>
              headers
                .map((header) => {
                  const value = row[header] || ""; // Get the value or empty string if undefined
                  return `"${value.toString().replace(/"/g, '""')}"`; // Escape double quotes
                })
                .join(",")
            );
          
            return [headers.join(","), ...csvRows].join("\n"); // Combine headers and rows
        },

        importAllCsvToDatabase: (req, res) => {
            const { csvDirPath } = req.body;
          
            if (!csvDirPath) {
              return res.status(400).json({ error: "CSV directory path is required." });
            }
          
            fs.readdir(csvDirPath, (err, files) => {
              if (err) {
                console.error("Error reading directory:", err);
                return res.status(500).json({ error: "Error reading directory." });
              }
          
              const csvFiles = files.filter((file) => file.endsWith(".csv"));
              if (csvFiles.length === 0) {
                return res.status(404).json({ message: "No CSV files found." });
              }
          
              let remaining = csvFiles.length;
          
              csvFiles.forEach((file) => {
                const tableName = path.basename(file, ".csv"); // Extract table name
                const filePath = path.join(csvDirPath, file);
          
                importCsvToTable(tableName, filePath, (err) => {
                  if (err) {
                    console.error(`Error importing ${file}:`, err);
                    return res.status(500).json({ error: `Error importing ${file}.` });
                  }
          
                  remaining -= 1;
                  if (remaining === 0) {
                    res.json({ message: "CSV import completed successfully." });
                  }
                });
              });
            });
        },

        importCsvToTable: (req, res) => {
            const { tableName, filePath } = req.body;
          
            if (!tableName || !filePath) {
              return res
                .status(400)
                .json({ error: "Both tableName and filePath are required." });
            }
          
            const rows = [];
          
            fs.createReadStream(filePath)
              .pipe(fastcsv.parse({ headers: true }))
              .on("data", (row) => {
                rows.push(row);
              })
              .on("end", () => {
                if (rows.length === 0) {
                  return res.status(404).json({
                    message: `No data found in file: ${filePath}.`,
                  });
                }
          
                const columns = Object.keys(rows[0]); // Get column names from the CSV
                const placeholders = columns.map(() => "?").join(",");
                const sql = `INSERT INTO ${tableName} (${columns.join(",")}) VALUES (${placeholders})`;
          
                const values = rows.map((row) =>
                  columns.map((col) => row[col] || null)
                );
          
                db.query(sql, [values], (err, results) => {
                  if (err) {
                    console.error(`Error inserting data into ${tableName}:`, err);
                    return res.status(500).json({
                      error: `Error inserting data into table ${tableName}.`,
                    });
                  }
          
                  res.json({
                    message: `Data successfully imported into ${tableName}.`,
                    affectedRows: results.affectedRows,
                  });
                });
              })
              .on("error", (error) => {
                console.error(`Error reading CSV file ${filePath}:`, error);
                res.status(500).json({
                  error: `Error reading CSV file ${filePath}.`,
                });
              });
        }
    }
}
  