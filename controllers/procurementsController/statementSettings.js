module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS statement_settings (
              id INT AUTO_INCREMENT PRIMARY KEY,
              output_format VARCHAR(255) DEFAULT 'csv',
              remarks VARCHAR(255) DEFAULT 'null',
              created DATE DEFAULT CURRENT_DATE,
              updated DATE DEFAULT CURRENT_DATE
          );
      `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating statementSettings table:", err.message);
          return res
            .status(500)
            .send("Error initializing statementSettings table.");
        }
        res.send("StatementSettings table initialized successfully.");
      });
    },

    // Load Statement Settings
    loadStatementSettings: (req, res) => {
      const sql = `SELECT * FROM statement_settings`;
      db.query(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading statement settings:", err.message);
          return res.status(500).send("Error loading statement settings.");
        }
        res.json(rows);
      });
    },

    // Get Statement Setting by ID
    getStatementSettingById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM statement_settings WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving statement setting:", err.message);
          return res.status(500).send("Error retrieving statement setting.");
        }
        res.json(row);
      });
    },

    // Edit Statement Setting
    editStatementSetting: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM statement_settings WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error editing statement setting:", err.message);
          return res.status(500).send("Error editing statement setting.");
        }
        res.json(row);
      });
    },

    // Save or Update Statement Setting
    saveStatementSetting: (req, res) => {
      const { id, output_format, remarks } = req.body;

      if (id) {
        db.query(
          `UPDATE statement_settings SET 
              output_format = ?, 
              remarks = ?, 
              updated = NOW() 
          WHERE id = ?`,
          [output_format, remarks, id],
          (err) => {
            if (err) {
              console.error("Error updating statement setting:", err.message);
              return res.status(500).send("Error updating statement setting.");
            }
            res.json({ success: true, id });
          }
        );
      } else {
        db.query(
          `INSERT INTO statement_settings 
            (output_format, remarks, created, updated) 
            VALUES (?, ?, NOW(), NOW())`,
          [output_format, remarks],
          (err, result) => {
            if (err) {
              console.error("Error inserting statement setting:", err.message);
              return res.status(500).send("Error inserting statement setting.");
            }
            res.json({ success: true, id: result.insertId });
          }
        );
      }
    },

    // Delete Statement Setting by ID
    deleteStatementSettingById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM statement_settings WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting statement setting:", err.message);
          return res.status(500).send("Error deleting statement setting.");
        }
        res.json({ success: true });
      });
    },
  };
};
