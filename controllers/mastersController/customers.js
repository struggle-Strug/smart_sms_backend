module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {

      const sql = `
          CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name_primary VARCHAR(255) NOT NULL,
            name_secondary VARCHAR(255) DEFAULT NULL,
            code VARCHAR(255) DEFAULT NULL,
            name_kana VARCHAR(255) DEFAULT NULL,
            honorific VARCHAR(255) DEFAULT NULL,
            phone_number VARCHAR(255) NOT NULL,
            fax_number VARCHAR(255) DEFAULT NULL,
            zip_code VARCHAR(255) DEFAULT NULL,
            address VARCHAR(255) NOT NULL,
            email VARCHAR(255) DEFAULT NULL,
            remarks VARCHAR(255) DEFAULT NULL,
            billing_code VARCHAR(255) NOT NULL,
            billing_information VARCHAR(255) DEFAULT NULL,
            deposit_method VARCHAR(255) DEFAULT NULL,
            classification1 VARCHAR(255) DEFAULT NULL,
            classification2 VARCHAR(255) DEFAULT NULL,
            monthly_sales_target INT DEFAULT NULL,
            tax_calculation INT DEFAULT NULL,
            closing_date DATE DEFAULT NULL,
            deposit_date DATE DEFAULT NULL,
            created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating customers table:", err.message);
          return res.status(500).send("Error initializing customers table.");
        }
        res.send("Customers table initialized successfully.");
      });
    },

    //Load customers
    load: (req, res) => {
        
      const sql = "SELECT * FROM customers";

      db.query(sql, (err, rows) => {
        if (err) {
          console.error("Error loading customers:", err.message);
          return res.status(500).send("Error loading customers.");
        }
        res.json(rows);
      });
    },

    //Get customer by ID
    getById: (req, res) => {
      const id = req.params.id;
      const sql = "SELECT * FROM customers WHERE id = ?";
      db.query(sql, [id], (err, rows) => {
        if (err) {
          console.error("Error fetching customer:", err.message);
          return res.status(500).send("Error fetching customer.");
        }
        res.json(rows[0]);
      });
    },

    //Save customer
    save: (req, res) => {
      const {
        id,
        name_primary,
        name_secondary,
        code,
        name_kana,
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
        closing_date,//追加
        deposit_date,//追加
        deposit_method,//追加
        classification1, // 区分１//追加
        classification2, // 区分２//追加
        tax_calculation,//追加
      } = req.body;
      let sql, params;

      if (id) {
        // Update existing category
        sql = `UPDATE customers SET name_primary = ?, code = ?, name_secondary = ?, name_kana = ?, honorific = ?, phone_number = ?, fax_number = ?, zip_code = ?, address = ?, email = ?, remarks = ?, billing_code = ?, billing_information = ?, monthly_sales_target = ?, closing_date = ?, deposit_date = ?, deposit_method = ?, classification1 = ?, classification2 = ?, tax_calculation = ?, updated = NOW() WHERE id = ?`;
        params = [
          name_primary,
          code,
          name_secondary,
          name_kana,
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
          closing_date,//追加
          deposit_date,//追加
          deposit_method,//追加
          classification1, // 区分１//追加
          classification2, // 区分２//追加
          tax_calculation,//追加
          id,
        ];
      } else {
        // Insert new category
        sql = `INSERT INTO customers (name_primary, code, name_secondary, name_kana, honorific, phone_number, fax_number, zip_code, address, email, remarks, billing_code, billing_information, monthly_sales_target, closing_date, deposit_date, deposit_method, classification1, classification2, tax_calculation, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        params = [
          name_primary,
          code,
          name_secondary,
          name_kana,
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
          closing_date,//追加
          deposit_date,//追加
          deposit_method,//追加
          classification1, // 区分１//追加
          classification2, // 区分２//追加
          tax_calculation,//追加
        ];
      }

      db.query(sql, params, (err) => {
        if (err) {
          console.error("Error saving customer:", err.message);
          return res.status(500).send("Error saving customer.");
        }
        res.send("Customer saved successfully.");
      });
    },

    //Delete customer
    deleteById: (req, res) => {
      const id = req.params.id;
      const sql = "DELETE FROM customers WHERE id = ?";
      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting customer:", err.message);
          return res.status(500).send("Error deleting customer.");
        }
        res.send("Customer deleted successfully.");
      });
    },

    //edit customer
    edit: (req, res) => {
      const id = req.params.id;
      const sql = "SELECT * FROM customers WHERE id = ?";
      db.query(sql, [id], (err, rows) => {
        if (err) {
          console.error("Error fetching customer:", err.message);
          return res.status(500).send("Error fetching customer.");
        }
        res.json(rows[0]);
      });
    },

    //searchId
    searchIdCustomers: (req, res) => {
      const { id } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
      
      let sql;
      let params = [];
      
      if (id.trim() !== "") {
        sql = `
            SELECT * FROM customers 
            WHERE id LIKE ?
            `;
        params = [`%${id}%`];
      } else {
        sql = `SELECT * FROM customers`;
      }
    
      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching customers:", err.message);
          return res.status(500).send("Error fetching customers.");
        }
        res.json(rows);
      });
    },

    //searchName
    searchNameCustomers: (req, res) => {
      const { name_primary } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
      
      let sql;
      let params = [];
      
      if (name_primary.trim() !== "") {
        sql = `
            SELECT * FROM customers 
            WHERE name_primary LIKE ?
            `;
        params = [`%${name_primary}%`];
      } else {
        sql = `SELECT * FROM customers`;
      }
    
      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching customers:", err.message);
          return res.status(500).send("Error fetching customers.");
        }
        res.json(rows);
      });
    },
    
    //searchCode
    loadCustomerByCode: (req, res) => {
      const { code } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
      
      let sql;
      let params = [];
      
      if (code.trim() !== "") {
        sql = `
            SELECT * FROM customers 
            WHERE id LIKE ?
            `;
        params = [`%${code}%`];
      } else {
        sql = `SELECT * FROM customers`;
      }
    
      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching customers:", err.message);
          return res.status(500).send("Error fetching customers.");
        }
        res.json(rows);
      });
    },

    //search
    searchCustomers: (req, res) => {
      const { name_primary, name_secondary, name_kana, id, code } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example
      let sql;
      let params = [];
    
      if ((name_primary || name_secondary || name_kana || id || code).trim() !== "") {
        sql = `
            SELECT * FROM customers 
            WHERE name_primary LIKE ? 
            OR name_secondary LIKE ? 
            OR name_kana LIKE ? 
            OR id LIKE ? 
            OR code LIKE ?
            `;
        params = [
          name_primary || '%',  // Fallback to '%' if the query is not provided
          name_secondary || '%',
          name_kana || '%',
          id || '%',
          code || '%',
        ];
      } else {
        sql = `SELECT * FROM customers`;
      }
    
      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching customers:", err.message);
          return res.status(500).send("Error fetching customers.");
        }
        res.json(rows);
      });
    },
  };
};
