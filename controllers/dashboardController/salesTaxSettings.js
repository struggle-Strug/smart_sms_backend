module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS taxes (
                id INT AUTO_INCREMENT PRIMARY KEY, -- 消費税コード（主キー・自動増分）
                tax_rate INT NOT NULL, -- 消費税率（null不可）
                start_date DATE NOT NULL, -- 適用開始日（null不可）
                end_date DATE DEFAULT NULL, -- 適用終了日（null可）
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新日時（null可、デフォルトは現在の日時）
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 作成日時（null可、デフォルトは現在の日時）
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating salesTaxes table:", err.message);
            return res.status(500).send("Error initializing salesTaxes table.");
          }
          res.send("SalesTaxes table initialized successfully.");
        });
      },

      // Load salesTaxes
      load: (req, res) => {
        const sql = "SELECT * FROM taxes";
        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading taxes:", err.message);
            return res.status(500).send("Error loading taxes.");
          }
          res.json(rows);
        });
      },

      //Get posCoordinationSetting By ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM taxes WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching taxes:", err.message);
            return res.status(500).send("Error fetching taxes.");
          }
          res.json(rows[0]);
        });
      },

      //Save
      save: (req, res) => {
        const { id, tax_rate, start_date, end_date } = req.body;
        let sql, params;

        if (id) {
          // Update existing admin setting
          sql = `UPDATE taxes SET tax_rate = ?, start_date = ?, end_date = ?, updated = NOW() WHERE id = ?`;
          params = [tax_rate, start_date, end_date, id];
        } else {
          // Insert new admin setting
          sql = `INSERT INTO taxes (tax_rate, start_date, end_date, created, updated) VALUES (?, ?, ?, NOW(), NOW())`;
          params = [tax_rate, start_date, end_date];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving taxes:", err.message);
            return res.status(500).send("Error saving taxes.");
          }
          res.send("Taxes saved successfully.");
        });
      },

      //Delete catagory
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM taxes WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting taxes:", err.message);
            return res.status(500).send("Error deleting taxes.");
          }
          res.send("Taxes deleted successfully.");
        });
      },
    };
  };
  