module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS payment_methods (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(255) DEFAULT NULL,
                remarks VARCHAR(255),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating paymentMethods table:", err.message);
            return res.status(500).send("Error initializing paymentMethods table.");
          }
          res.send("PaymentMethods table initialized successfully.");
        });
      },

      //Load PaymentMethods
      load: (req, res) => {
          
        const sql = "SELECT * FROM payment_methods";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading PaymentMethods:", err.message);
            return res.status(500).send("Error loading PaymentMethods.");
          }
          res.json(rows);
        });
      },

      //Get PaymentMethod by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM payment_methods WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching PaymentMethods:", err.message);
            return res.status(500).send("Error fetching PaymentMethods.");
          }
          res.json(rows[0]);
        });
      },

      //Save PaymentMethod
      save: (req, res) => {
        const { id, name, code, remarks } = req.body;
        let sql, params;

        if (id) {
          // Update existing category
          sql = `UPDATE payment_methods 
                  SET 
                      name = ?, 
                      code = ?, 
                      remarks = ?, 
                      updated = NOW() 
                  WHERE id = ?;`;
          params = [name, code, remarks, id];
        } else {
          // Insert new category
          sql = `INSERT INTO payment_methods (name, code, remarks, created, updated) 
                  VALUES (?, ?, ?, NOW(), NOW());
                `;
          params = [name, code, remarks];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving PaymentMethods:", err.message);
            return res.status(500).send("Error saving PaymentMethods.");
          }
          res.send("PaymentMethod saved successfully.");
        });
      },

      //Delete PaymentMethod
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM payment_methods WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting PaymentMethod:", err.message);
            return res.status(500).send("Error deleting PaymentMethod.");
          }
          res.send("PaymentMethod deleted successfully.");
        });
      },

      //searchId
      searchPaymentMethod: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM payment_methods 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM payment_methods`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching payment_methods:", err.message);
            return res.status(500).send("Error fetching payment_methods.");
          }
          res.json(rows);
        });
      },
    };
  };
  