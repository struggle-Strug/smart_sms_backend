module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS shipping_methods (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                code VARCHAR(255) DEFAULT NULL,
                remarks VARCHAR(255),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating shippingMethods table:", err.message);
            return res.status(500).send("Error initializing shippingMethods table.");
          }
          res.send("ShippingMethods table initialized successfully.");
        });
      },

      //Load ShippingMethods
      load: (req, res) => {
          
        const sql = "SELECT * FROM shipping_methods";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading shippingMethods:", err.message);
            return res.status(500).send("Error loading shippingMethods.");
          }
          res.json(rows);
        });
      },

      //Get ShippingMethod by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM shipping_methods WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching ShippingMethod:", err.message);
            return res.status(500).send("Error fetching ShippingMethod.");
          }
          res.json(rows[0]);
        });
      },

      //Save ShippingMethod
      save: (req, res) => {
        const { id, name, code, remarks }  = req.body;
        let sql, params;

        if (id) {
          // Update existing category
          sql = `UPDATE shipping_methods SET name = ?, code = ?, remarks = ?, updated = NOW() WHERE id = ?`;
          params = [name, code, remarks, id];
        } else {
          // Insert new category
          sql = `INSERT INTO shipping_methods (name, code, remarks, created, updated) VALUES (?, ?, ?, NOW(), NOW())`;
          params = [name, code, remarks];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving shippingMethod:", err.message);
            return res.status(500).send("Error saving shippingMethod.");
          }
          res.send("ShippingMethod saved successfully.");
        });
      },

      //Delete ShippingMethod
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM shipping_methods WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting ShippingMethod:", err.message);
            return res.status(500).send("Error deleting ShippingMethod.");
          }
          res.send("ShippingMethod deleted successfully.");
        });
      },

      //edit ShippingMethod
      edit: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM shipping_methods WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching ShippingMethod:", err.message);
            return res.status(500).send("Error fetching ShippingMethod.");
          }
          res.json(rows[0]);
        });
      },

      //searchShippingMethods
      searchShippingMethods: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM shipping_methods 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM shipping_methods`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching shippingMethods:", err.message);
            return res.status(500).send("Error fetching shippingMethods.");
          }
          res.json(rows);
        });
      },
    };
  };
  