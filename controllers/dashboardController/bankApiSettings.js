module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS bank_apis (
                id INT AUTO_INCREMENT PRIMARY KEY, -- ID
                api_key VARCHAR(255) DEFAULT NULL -- APIキー
            );

        `;
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating bankApiSettings table:", err.message);
            return res.status(500).send("Error initializing bankApiSettings table.");
          }
          res.send("BankApiSettings table initialized successfully.");
        });
      },

      // Load bankAPIs from the database
      load: (req, res) => {
        const sql = "SELECT * FROM bank_apis";
        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading bankapis:", err.message);
            return res.status(500).send("Error loading bankapis.");
          }
          res.json(rows);
        });
      },

      //Get BankApi By ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM  bank_apis WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching bankapis:", err.message);
            return res.status(500).send("Error fetching bankapis.");
          }
          res.json(rows[0]);
        });
      },

      //Save
      save: (req, res) => {
        const { id, api_key } = req.body;
        let sql, params;

        if (id) {
          // Update existing admin setting
          sql = `UPDATE bank_apis SET api_key = ? WHERE id = ?`;
          params = [api_key, id];
        } else {
          // Insert new admin setting
          sql = `INSERT INTO bank_apis (api_key) VALUES (?)`;
          params = [api_key];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving bankapis:", err.message);
            return res.status(500).send("Error saving bankapis.");
          }
          res.send("BankApi saved successfully.");
        });
      },

      //delete by ID
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM bank_apis WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting bankapi:", err.message);
            return res.status(500).send("Error deleting bankapi.");
          }
          res.send("Bankapi deleted successfully.");
        });
      },
    };
  };
  