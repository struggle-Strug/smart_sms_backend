module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS pos_coordinations (
                id INT AUTO_INCREMENT PRIMARY KEY, -- ID
                api_key VARCHAR(255) DEFAULT NULL, -- APIキー
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 作成日時
                sync_interval VARCHAR(255) DEFAULT NULL -- 同期インターバル
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating posCoordinationSettings table:", err.message);
            return res.status(500).send("Error initializing posCoordinationSettings table.");
          }
          res.send("PosCoordinationSettings table initialized successfully.");
        });
      },

      // Load posCoordinationSetting
      load: (req, res) => {
        const sql = "SELECT * FROM pos_coordinations";
        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading posCoordinationSettings:", err.message);
            return res.status(500).send("Error loading posCoordinationSettings.");
          }
          res.json(rows);
        });
      },

      //Get posCoordinationSetting By ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM pos_coordinations WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching posCoordinationSettings:", err.message);
            return res.status(500).send("Error fetching posCoordinationSettings.");
          }
          res.json(rows[0]);
        });
      },

      //Save
      save: (req, res) => {
        const { api_key, sync_interval } = req.body;
        let sql, params;

        if (id) {
          // Update existing admin setting
          sql = `UPDATE pos_coordinations SET api_key = ?, sync_interval = ?, updated = NOW() WHERE id = ?`;
          params = [api_key, sync_interval, id];
        } else {
          // Insert new admin setting
          sql = `INSERT INTO pos_coordinations (api_key, created) VALUES (?, NOW()`;
          params = [api_key];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving posCoordinationSettings:", err.message);
            return res.status(500).send("Error saving posCoordinationSettings.");
          }
          res.send("PosCoordinationSettings saved successfully.");
        });
      },

      //Delete catagory
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM pos_coordinations WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting posCoordinationSettings:", err.message);
            return res.status(500).send("Error deleting posCoordinationSettings.");
          }
          res.send("PosCoordinationSettings deleted successfully.");
        });
      },
    };
  };
  