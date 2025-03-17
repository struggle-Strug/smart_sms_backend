module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS pos_pvs_mappings (
                id INT AUTO_INCREMENT PRIMARY KEY, -- MySQL equivalent for AUTOINCREMENT
                pos_id VARCHAR(255),
                pvs_id VARCHAR(255),
                created DATE DEFAULT CURRENT_DATE,  -- Current date as default for created
                updated DATE DEFAULT CURRENT_DATE   -- Current date as default for updated
            );
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating posPvsMappings table:", err.message);
          return res
            .status(500)
            .send("Error initializing posPvsMappings table.");
        }
        res.send("PosPvsMappings table initialized successfully.");
      });
    },

    // Load POS-PVS Mappings
    loadPosPvsMappings: (req, res) => {
      const sql = `SELECT * FROM pos_pvs_mappings`;
      db.query(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading POS-PVS mappings:", err.message);
          return res.status(500).send("Error loading POS-PVS mappings.");
        }
        res.json(rows);
      });
    },

    // Get POS-PVS Mapping by ID
    getPosPvsMappingById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM pos_pvs_mappings WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving POS-PVS mapping:", err.message);
          return res.status(500).send("Error retrieving POS-PVS mapping.");
        }
        if (!row) {
          return res.status(404).send("POS-PVS mapping not found.");
        }
        res.json(row);
      });
    },

    // Save POS-PVS Mapping
    savePosPvsMapping: (req, res) => {
      const { id, pos_id, pvs_id } = req.body;

      if (id) {
        // Check if the record exists
        db.query(
          `SELECT id FROM pos_pvs_mappings WHERE id = ?`,
          [id],
          (err, rows) => {
            if (err) {
              console.error(
                "Error checking POS-PVS mapping existence:",
                err.message
              );
              return res
                .status(500)
                .send("Error checking POS-PVS mapping existence.");
            }

            if (rows.length > 0) {
              // Record exists, update it
              const sql = `UPDATE pos_pvs_mappings SET pos_id = ?, pvs_id = ?, updated = CURRENT_TIMESTAMP WHERE id = ?`;
              db.query(sql, [pos_id, pvs_id, id], (err) => {
                if (err) {
                  console.error("Error updating POS-PVS mapping:", err.message);
                  return res
                    .status(500)
                    .send("Error updating POS-PVS mapping.");
                }
                res.send("POS-PVS mapping updated successfully.");
              });
            } else {
              // Record does not exist, insert it
              const sql = `INSERT INTO pos_pvs_mappings (pos_id, pvs_id, created, updated) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
              db.query(sql, [pos_id, pvs_id], (err) => {
                if (err) {
                  console.error(
                    "Error inserting POS-PVS mapping:",
                    err.message
                  );
                  return res
                    .status(500)
                    .send("Error inserting POS-PVS mapping.");
                }
                res.send("POS-PVS mapping inserted successfully.");
              });
            }
          }
        );
      } else {
        // No ID, insert new record
        const sql = `INSERT INTO pos_pvs_mappings (pos_id, pvs_id, created, updated) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        db.query(sql, [pos_id, pvs_id], (err) => {
          if (err) {
            console.error("Error inserting POS-PVS mapping:", err.message);
            return res.status(500).send("Error inserting POS-PVS mapping.");
          }
          res.send("POS-PVS mapping inserted successfully.");
        });
      }
    },

    // Delete POS-PVS Mapping by ID
    deletePosPvsMappingById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM pos_pvs_mappings WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting POS-PVS mapping:", err.message);
          return res.status(500).send("Error deleting POS-PVS mapping.");
        }
        res.send("POS-PVS mapping deleted successfully.");
      });
    },

    // Search PosPvsMappings
    searchPosPvsMappings: (req, res) => {
      const { pos_id, pvs_id } = req.query; // Assuming the search query is passed as a URL query parameter (e.g., ?query=example)

      let sql;
      let params = [];

      // If a query is provided, search using LIKE for the relevant columns
      if ((pos_id || pvs_id).trim() !== "") {
        sql = `
            SELECT * FROM pos_pvs_mappings 
            WHERE pos_id LIKE ? 
            OR pvs_id LIKE ? 
          `;
        params = [
          pos_id || "%", // Fallback to '%' if the query is not provided
          pvs_id || "%",
        ];
      } else {
        sql = `SELECT * FROM pos_pvs_mappings`; // Return all inventories if no query is provided
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching POS-PVS mapping:", err.message);
          return res.status(500).send("Error searching POS-PVS mapping.");
        }

        res.json(rows); // Return the results as JSON
      });
    },

    // Search PosPvsMappingsByPos
    searchPosPvsMappingsByPos: (req, res) => {
      const { pos_id } = req.query; // Assuming the search query is passed as a URL query parameter (e.g., ?query=example)

      let sql;
      let params = [];

      // If a query is provided, search using LIKE for the relevant columns
      if (pos_id.trim() !== "") {
        sql = `
            SELECT * FROM pos_pvs_mappings 
            WHERE pos_id LIKE ? 
          `;
        params = [
          pos_id || "%", // Fallback to '%' if the query is not provided
        ];
      } else {
        sql = `SELECT * FROM pos_pvs_mappings`; // Return all inventories if no query is provided
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching POS-PVS mapping:", err.message);
          return res.status(500).send("Error searching POS-PVS mapping.");
        }

        res.json(rows); // Return the results as JSON
      });
    },

    // Search PosPvsMappingsByPvsId
    searchPosPvsMappingsByPvsId: (req, res) => {
      const { pvs_id } = req.query; // Assuming the search query is passed as a URL query parameter (e.g., ?query=example)

      let sql;
      let params = [];

      // If a query is provided, search using LIKE for the relevant columns
      if (pvs_id.trim() !== "") {
        sql = `
            SELECT * FROM pos_pvs_mappings 
            WHERE pvs_id LIKE ? 
          `;
        params = [pvs_id || "%"];
      } else {
        sql = `SELECT * FROM pos_pvs_mappings`; // Return all inventories if no query is provided
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching POS-PVS mapping:", err.message);
          return res.status(500).send("Error searching POS-PVS mapping.");
        }

        res.json(rows); // Return the results as JSON
      });
    },

    // Delete POS-PVS Mappings by PVS ID
    deletePosPvsMappingsByPvsId: (req, res) => {
      const { pvs_id } = req.params;
      const sql = `DELETE FROM pos_pvs_mappings WHERE pvs_id = ?`;
      db.query(sql, [pvs_id], (err) => {
        if (err) {
          console.error(
            "Error deleting POS-PVS mappings by PVS ID:",
            err.message
          );
          return res
            .status(500)
            .send("Error deleting POS-PVS mappings by PVS ID.");
        }
        res.send("POS-PVS mappings deleted successfully by PVS ID.");
      });
    },
  };
};
