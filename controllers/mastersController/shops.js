module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS shops (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                code VARCHAR(255) DEFAULT NULL,
                address VARCHAR(255),
                phone_number VARCHAR(255),
                fax_number VARCHAR(255),
                contact_person VARCHAR(255),
                email VARCHAR(255),
                remarks VARCHAR(255),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating shops table:", err.message);
            return res.status(500).send("Error initializing shops table.");
          }
          res.send("Shops table initialized successfully.");
        });
      },

      //Load shops
      load: (req, res) => {
          
        const sql = "SELECT * FROM shops";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading shops:", err.message);
            return res.status(500).send("Error loading shops.");
          }
          res.json(rows);
        });
      },

      //Get shop by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM shops WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching shop:", err.message);
            return res.status(500).send("Error fetching shop.");
          }
          res.json(rows[0]);
        });
      },

      //Save shop
      save: (req, res) => {
        const {
          id,
          name,
          code,
          address,
          phone_number,
          fax_number,
          contact_person,
          email,
          remarks,
        } = req.body;
        let sql, params;

        if (id) {
          // Update existing category
          sql = `UPDATE shops SET name = ?, code = ?, address = ?, phone_number = ?, fax_number = ?, contact_person = ?, email = ?, remarks = ?, updated = NOW() WHERE id = ?`;
          params = [
            name,
            code,
            address,
            phone_number,
            fax_number,
            contact_person,
            email,
            remarks,
            id,
          ];
        } else {
          // Insert new category
          sql = `INSERT INTO shops (name, code, address, phone_number, fax_number, contact_person, email, remarks, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
          params = [
            name,
            code,
            address,
            phone_number,
            fax_number,
            contact_person,
            email,
            remarks,
          ];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving shop:", err.message);
            return res.status(500).send("Error saving shop.");
          }
          res.send("Shop saved successfully.");
        });
      },

      //Delete customer
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM shops WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting shop:", err.message);
            return res.status(500).send("Error deleting shop.");
          }
          res.send("Shop deleted successfully.");
        });
      },

      //edit shop
      edit: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM shops WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching shop:", err.message);
            return res.status(500).send("Error fetching shop.");
          }
          res.json(rows[0]);
        });
      },

      //searchshops
      searchShops: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM shops 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM shops`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching shops:", err.message);
            return res.status(500).send("Error fetching shops.");
          }
          res.json(rows);
        });
      },
    };
  };
  