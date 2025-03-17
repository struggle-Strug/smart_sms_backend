module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS delivery_customers (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name_primary VARCHAR(255) NOT NULL,
              name_secondary VARCHAR(255) DEFAULT NULL,
              code VARCHAR(255) DEFAULT NULL,
              honorific VARCHAR(255) DEFAULT NULL,
              phone_number VARCHAR(255) NOT NULL,
              fax_number VARCHAR(255) DEFAULT NULL,
              zip_code VARCHAR(255) DEFAULT NULL,
              address VARCHAR(255) NOT NULL,
              email VARCHAR(255) DEFAULT NULL,
              remarks VARCHAR(255) DEFAULT NULL,
              billing_code VARCHAR(255) NOT NULL,
              billing_information VARCHAR(255) DEFAULT NULL,
              monthly_sales_target INT DEFAULT NULL,
              created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating deliveryCustomers table:", err.message);
            return res.status(500).send("Error initializing  deliveryCustomers table.");
          }
          res.send("DeliveryCustomers table initialized successfully.");
        });
      },

      //Load DeliveryCustomers
    load: (req, res) => {
        
      const sql = "SELECT * FROM delivery_customers";

      db.query(sql, (err, rows) => {
        if (err) {
          console.error("Error loading delivery_customers:", err.message);
          return res.status(500).send("Error loading delivery_customers.");
        }
        res.json(rows);
      });
    },

    //Get DeliveryCustomer by ID
    getById: (req, res) => {
      const id = req.params.id;
      const sql = "SELECT * FROM delivery_customers WHERE id = ?";
      db.query(sql, [id], (err, rows) => {
        if (err) {
          console.error("Error fetching delivery_customer:", err.message);
          return res.status(500).send("Error fetching delivery_customer.");
        }
        res.json(rows[0]);
      });
    },

    //Save DeliveryCustomer
    save: (req, res) => {
      const {
        id,
        name_primary,
        name_secondary,
        code,
        honorific,
        phone_number,
        fax_number,
        zip_code,
        address,
        email,
        remarks,
        billing_code,
        billing_information,
        monthly_sales_target,
      } = req.body;
      let sql, params;

      if (id) {
        // Update existing category
        sql = `UPDATE delivery_customers SET name_primary = ?, name_secondary = ?, code = ?, honorific = ?, phone_number = ?, fax_number = ?, zip_code = ?, address = ?, email = ?, remarks = ?, billing_code = ?, billing_information = ?, monthly_sales_target = ?, updated = NOW() WHERE id = ?`;
        params = [
          name_primary,
          name_secondary,
          code,
          honorific,
          phone_number,
          fax_number,
          zip_code,
          address,
          email,
          remarks,
          billing_code,
          billing_information,
          monthly_sales_target,
          id,
        ];
      } else {
        // Insert new category
        sql = `INSERT INTO delivery_customers (name_primary, name_secondary, code, honorific, phone_number, fax_number, zip_code, address, email, remarks, billing_code, billing_information, monthly_sales_target, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        params = [
          name_primary,
          name_secondary,
          code,
          honorific,
          phone_number,
          fax_number,
          zip_code,
          address,
          email,
          remarks,
          billing_code,
          billing_information,
          monthly_sales_target,
        ];
      }

      db.query(sql, params, (err) => {
        if (err) {
          console.error("Error saving delivery_customer:", err.message);
          return res.status(500).send("Error saving delivery_customer.");
        }
        res.send("Delivery_customer saved successfully.");
      });
    },

    //Delete customer
    deleteById: (req, res) => {
      const id = req.params.id;
      const sql = "DELETE FROM delivery_customers WHERE id = ?";
      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting delivery_customer:", err.message);
          return res.status(500).send("Error deleting delivery_customer.");
        }
        res.send("Delivery_customer deleted successfully.");
      });
    },

    //search
    searchDeliveryCustomers: (req, res) => {
      const { name_primary, name_secondary, id } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example
      let sql;
      let params = [];
            
      if ((name_primary || name_secondary || id).trim() !== "") {
          sql = `
              SELECT * FROM delivery_customers 
              WHERE name_primary LIKE ? 
              OR name_secondary LIKE ? 
              OR id LIKE ? 
              `;
          params = [
            name_primary || '%',  // Fallback to '%' if the query is not provided
            name_secondary || '%',
            id || '%',
          ];
        } else {
          sql = `SELECT * FROM delivery_customers`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching delivery_customer:", err.message);
            return res.status(500).send("Error fetching delivery_customer.");
          }
          res.json(rows);
        });
      },
    } ;
  };
  