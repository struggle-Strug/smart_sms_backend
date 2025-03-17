module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS square_logs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              status VARCHAR(255) DEFAULT NULL,
              request_date_time TIMESTAMP NULL DEFAULT NULL,
              remarks VARCHAR(255) DEFAULT NULL,
              updated DATE DEFAULT CURRENT_DATE,
              created DATE DEFAULT CURRENT_DATE
          );
      `;
      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating squareLogs table:", err.message);
          return res.status(500).send("Error initializing squareLogs table.");
        }
        res.send("SquareLogs table initialized successfully.");
      });
    },

    // Load Square Logs
    loadSquareLogs: (req, res) => {
      const sql = `SELECT * FROM square_logs`;
      db.query(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading square logs:", err.message);
          return res.status(500).send("Error loading square logs.");
        }
        res.json(rows);
      });
    },

    // Save or Update Square Log
    saveSquareLog: (req, res) => {
      const { id, status, request_date_time, remarks } = req.body;

      if (id) {
        // Update existing log
        db.query(
          `UPDATE square_logs SET 
            status = ?, 
            request_date_time = ?, 
            remarks = ?, 
            updated = NOW() 
          WHERE id = ?`,
          [status, request_date_time, remarks, id],
          (err) => {
            if (err) {
              console.error("Error updating square log:", err.message);
              return res.status(500).send("Error updating square log.");
            }
            res.json({ success: true, id: id });
          }
        );
      } else {
        // Insert new log
        db.query(
          `INSERT INTO square_logs 
            (status, request_date_time, remarks, created, updated) 
            VALUES (?, ?, ?, NOW(), NOW())`,
          [status, request_date_time, remarks],
          (err, result) => {
            if (err) {
              console.error("Error inserting square log:", err.message);
              return res.status(500).send("Error inserting square log.");
            }
            res.json({ success: true, id: result.insertId });
          }
        );
      }
    },

    // Delete Square Log by ID
    deleteSquareLogById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM square_logs WHERE id = ?`;

      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting square log:", err.message);
          return res.status(500).send("Error deleting square log.");
        }
        res.json({ success: true });
      });
    },

    // Edit Square Log by ID
    editSquareLog: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM square_logs WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving square log:", err.message);
          return res.status(500).send("Error retrieving square log.");
        }
        res.json(row);
      });
    },

    // Search Square Logs
    searchSquareLogs: (req, res) => {
      const { status, remarks } = req.body;
      let sql;
      let params = [];

      if ((status || remarks).trim() !== "") {
        sql = `
          SELECT * FROM square_logs 
          WHERE status LIKE ?
          OR remarks LIKE ?`;
        params = Array(2).fill(`%${query}%`);
      } else {
        sql = `SELECT * FROM square_logs`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching square logs:", err.message);
          return res.status(500).send("Error searching square logs.");
        }
        res.json(rows);
      });
    },

    // Get Latest Log by Request Date Time
    getLatestLogByRequestDateTime: (req, res) => {
      const sql = `
        SELECT * FROM square_logs
        ORDER BY request_date_time DESC
        LIMIT 1`;

      db.query(sql, [], (err, row) => {
        if (err) {
          console.error("Error fetching latest square log:", err.message);
          return res.status(500).send("Error fetching latest square log.");
        }
        res.json(row);
      });
    },
  };
};
