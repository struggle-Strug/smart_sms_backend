module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS vendors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name_primary VARCHAR(255) NOT NULL,
                name_secondary VARCHAR(255) DEFAULT NULL,
                code VARCHAR(255) DEFAULT NULL,
                name_kana VARCHAR(255) DEFAULT NULL,
                phone_number VARCHAR(255) NOT NULL,
                fax_number VARCHAR(255) DEFAULT NULL,
                zip_code INT DEFAULT NULL,
                address VARCHAR(255) NOT NULL,
                contact_person VARCHAR(255) DEFAULT NULL,
                email VARCHAR(255) DEFAULT NULL,
                terms_of_trade VARCHAR(255) DEFAULT NULL,
                remarks VARCHAR(255) DEFAULT NULL,
                classification1 VARCHAR(255) DEFAULT NULL,
                classification2 VARCHAR(255) DEFAULT NULL,
                tax_calculation VARCHAR(255) DEFAULT NULL,
                closing_date INT DEFAULT NULL,
                payment_date INT DEFAULT NULL,
                payment_method VARCHAR(255) DEFAULT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating vendors table:", err.message);
          return res.status(500).send("Error initializing vendors table.");
        }
        res.send("Vendors table initialized successfully.");
      });
    },

    //Load vendors
    load: (req, res) => {
      const sql = "SELECT * FROM vendors";

      db.query(sql, (err, rows) => {
        if (err) {
          console.error("Error loading vendors:", err.message);
          return res.status(500).send("Error loading vendors.");
        }
        res.json(rows);
      });
    },

    //Get vendor by ID
    getById: (req, res) => {
      const id = req.params.id;
      const sql = "SELECT * FROM vendors WHERE id = ?";
      db.query(sql, [id], (err, rows) => {
        if (err) {
          console.error("Error fetching vendor:", err.message);
          return res.status(500).send("Error fetching vendor.");
        }
        res.json(rows[0]);
      });
    },

    //Save vendor
    save: (req, res) => {
      const {
        id,
        name_primary,
        code,
        name_secondary,
        name_kana,
        phone_number,
        fax_number,
        zip_code,
        address,
        contact_person,
        email,
        terms_of_trade,
        remarks,
        classification1,
        classification2,
        tax_calculation,
        closing_date,
        payment_date,
        payment_method,
      } = req.body;

      let sql, params;

      if (id) {
        // Update existing category
        sql = `UPDATE vendors SET name_primary = ?, code = ?, name_secondary = ?, name_kana = ?, phone_number = ?, fax_number = ?, zip_code = ?, address = ?, contact_person = ?, email = ?, terms_of_trade = ?, remarks = ?, classification1 = ?, classification2 = ?, tax_calculation = ?, closing_date = ?, payment_date = ?, payment_method = ?, updated = NOW() WHERE id = ?`;
        params = [
          name_primary,
          code,
          name_secondary,
          name_kana,
          phone_number,
          fax_number,
          zip_code,
          address,
          contact_person,
          email,
          terms_of_trade,
          remarks,
          classification1,
          classification2,
          tax_calculation,
          closing_date,
          payment_date,
          payment_method,
          id,
        ];
      } else {
        // Insert new category
        sql = `INSERT INTO vendors (name_primary, code, name_secondary, name_kana, phone_number, fax_number, zip_code, address, contact_person, email, terms_of_trade, remarks, classification1, classification2, tax_calculation, closing_date, payment_date, payment_method, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        params = [
          name_primary,
          code,
          name_secondary,
          name_kana,
          phone_number,
          fax_number,
          zip_code,
          address,
          contact_person,
          email,
          terms_of_trade,
          remarks,
          classification1,
          classification2,
          tax_calculation,
          closing_date,
          payment_date,
          payment_method,
        ];
      }

      db.query(sql, params, (err) => {
        if (err) {
          console.error("Error saving vendors:", err.message);
          return res.status(500).send("Error saving vendors.");
        }
        res.send("Vendor saved successfully.");
      });
    },

    //Delete vendor
    deleteById: (req, res) => {
      const id = req.params.id;
      const sql = "DELETE FROM vendors WHERE id = ?";
      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting vendors:", err.message);
          return res.status(500).send("Error deleting vendors.");
        }
        res.send("Vendor deleted successfully.");
      });
    },

    //searchId
    searchIdVendors: (req, res) => {
      const { id } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example

      let sql;
      let params = [];

      if (id.trim() !== "") {
        sql = `
              SELECT * FROM vendors 
              WHERE id LIKE ?
              `;
        params = [`%${id}%`];
      } else {
        sql = `SELECT * FROM vendors`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching vendors:", err.message);
          return res.status(500).send("Error fetching vendors.");
        }
        res.json(rows);
      });
    },

    //searchName
    searchNameVendors: (req, res) => {
      const { name_primary } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example

      let sql;
      let params = [];

      if (name_primary.trim() !== "") {
        sql = `
              SELECT * FROM vendors 
              WHERE name_primary LIKE ?
              `;
        params = [`%${name_primary}%`];
      } else {
        sql = `SELECT * FROM vendors`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching vendors:", err.message);
          return res.status(500).send("Error fetching vendors.");
        }
        res.json(rows);
      });
    },

    //searchCode
    loadVendorByCode: (req, res) => {
      const { code } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example

      let sql;
      let params = [];

      if (code.trim() !== "") {
        sql = `
              SELECT * FROM vendors 
              WHERE code LIKE ?
              `;
        params = [`%${code}%`];
      } else {
        sql = `SELECT * FROM vendors`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching vendors:", err.message);
          return res.status(500).send("Error fetching vendors.");
        }
        res.json(rows);
      });
    },

    //search
    searchVendors: (req, res) => {
      const {
        name_primary,
        name_secondary,
        name_kana,
        id,
        classification1,
        classification2,
      } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example
      let sql;
      let params = [];

      if (
        (
          name_primary ||
          name_secondary ||
          name_kana ||
          id ||
          classification1 ||
          classification2
        ).trim() !== ""
      ) {
        sql = `
              SELECT * FROM vendors 
              WHERE name_primary LIKE ? 
              OR name_secondary LIKE ? 
              OR name_kana LIKE ? 
              OR id LIKE ? 
              OR classification1 LIKE ? 
              OR classification2 LIKE ?
              `;
        params = [
          name_primary || "%", // Fallback to '%' if the query is not provided
          name_secondary || "%",
          name_kana || "%",
          id || "%",
          classification1 || "%",
          classification2 || "%",
        ];
      } else {
        sql = `SELECT * FROM vendors`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching vendors:", err.message);
          return res.status(500).send("Error fetching vendors.");
        }
        res.json(rows);
      });
    },
  };
};
