module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS primary_sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                remarks VARCHAR(255) DEFAULT NULL,
                code VARCHAR(255) DEFAULT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating primarySections table:", err.message);
            return res.status(500).send("Error initializing primarySections table.");
          }
          res.send("PrimarySections table initialized successfully.");
        });
      },

      //Load PrimarySection
      load: (req, res) => {
          
        const sql = "SELECT * FROM primary_sections";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading PrimarySections:", err.message);
            return res.status(500).send("Error loading PrimarySections.");
          }
          res.json(rows);
        });
      },

      //Get PrimarySection by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM primary_sections WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching PrimarySections:", err.message);
            return res.status(500).send("Error fetching PrimarySections.");
          }
          res.json(rows[0]);
        });
      },

      //Save PrimarySection
      save: (req, res) => {
        const { id, name, code, remarks } = req.body;
        let sql, params;

        if (id) {
          // Update existing PrimarySection
          sql = `UPDATE primary_sections 
                  SET 
                      name = ?, 
                      code = ?, 
                      remarks = ?, 
                      updated = NOW() 
                  WHERE id = ?;`;
          params = [name, code, remarks, id];
        } else {
          // Insert new PrimarySection
          sql = `INSERT INTO primary_sections (name, code, remarks, created, updated) 
                  VALUES (?, ?, ?, NOW(), NOW());
                `;
          params = [name, code, remarks];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving PaymentMethods:", err.message);
            return res.status(500).send("Error saving PaymentMethods.");
          }
          res.send("PrimarySection saved successfully.");
        });
      },

      //Delete PrimarySection
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM primary_sections WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting PrimarySections:", err.message);
            return res.status(500).send("Error deleting PrimarySections.");
          }
          res.send("PrimarySection deleted successfully.");
        });
      },

      //searchId
      searchPrimarySections: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM primary_sections 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM primary_sections`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching PrimarySections:", err.message);
            return res.status(500).send("Error fetching PrimarySections.");
          }
          res.json(rows);
        });
      },
    };
  };
  