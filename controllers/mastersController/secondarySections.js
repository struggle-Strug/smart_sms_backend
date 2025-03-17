module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS secondary_sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(255) DEFAULT NULL,
                remarks VARCHAR(255) DEFAULT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating secondarySections table:", err.message);
            return res.status(500).send("Error initializing secondarySections table.");
          }
          res.send("SecondarySections table initialized successfully.");
        });
      },

      //Load SecondarySections
      load: (req, res) => {
          
        const sql = "SELECT * FROM secondary_sections";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading SecondarySections:", err.message);
            return res.status(500).send("Error loading SecondarySections.");
          }
          res.json(rows);
        });
      },

      //Get SecondarySection by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM secondary_sections WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching SecondarySections:", err.message);
            return res.status(500).send("Error fetching SecondarySections.");
          }
          res.json(rows[0]);
        });
      },

      //Save SecondarySection
      save: (req, res) => {
        const { id, name, code, remarks } = req.body;
        let sql, params;

        if (id) {
          // Update existing PrimarySection
          sql = `UPDATE secondary_sections 
                  SET 
                      name = ?, 
                      code = ?, 
                      remarks = ?, 
                      updated = NOW() 
                  WHERE id = ?;`;
          params = [name, code, remarks, id];
        } else {
          // Insert new PrimarySection
          sql = `INSERT INTO secondary_sections (name, code, remarks, created, updated) 
                  VALUES (?, ?, ?, NOW(), NOW());
                `;
          params = [name, code, remarks];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving SecondarySections:", err.message);
            return res.status(500).send("Error saving SecondarySections.");
          }
          res.send("SecondarySection saved successfully.");
        });
      },

      //Delete SecondarySection
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM secondary_sections WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting SecondarySections:", err.message);
            return res.status(500).send("Error deleting SecondarySections.");
          }
          res.send("SecondarySection deleted successfully.");
        });
      },

      //searchId
      searchSecondarySections: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM secondary_sections 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM secondary_sections`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching SecondarySections:", err.message);
            return res.status(500).send("Error fetching SecondarySections.");
          }
          res.json(rows);
        });
      },
    };
  };
  