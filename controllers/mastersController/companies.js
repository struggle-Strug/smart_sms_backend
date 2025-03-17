module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS companies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                code VARCHAR(255) DEFAULT NULL,
                address VARCHAR(255),
                phone_number VARCHAR(255),
                fax_number VARCHAR(255),
                registration_number VARCHAR(255),
                representive_name VARCHAR(255),
                bank_name VARCHAR(255),
                bank_account_number VARCHAR(255),
                bank_branch_name VARCHAR(255),
                bank_branch_code INT,
                zip_code VARCHAR(255) DEFAULT NULL,
                account_holder_name VARCHAR(255) DEFAULT NULL,
                account_type VARCHAR(255),
                closing_date VARCHAR(255),
                deposit_date VARCHAR(255),
                deposit_method VARCHAR(255),
                payment_closing_day VARCHAR(255),
                payment_date VARCHAR(255),
                payment_method VARCHAR(255),
                remarks VARCHAR(255),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating companies table:", err.message);
            return res.status(500).send("Error initializing companies table.");
          }
          res.send("Companies table initialized successfully.");
        });
      },

      //Load Companies
      load: (req, res) => {
        const sql = "SELECT * FROM companies";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading companies:", err.message);
            return res.status(500).send("Error loading companies.");
          }
          res.json(rows);
        });
      },

      //getCompany by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM companies WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching companies:", err.message);
            return res.status(500).send("Error fetching companies.");
          }
          res.json(rows[0]);
        });
      },

      //save Company
      save: (req, res) => {
        const {
          id,
          name,
          code,
          address,
          phone_number,
          fax_number,
          registration_number,//追加
          representive_name,
          bank_name,
          bank_account_number,
          bank_branch_name,
          bank_branch_code,
          zip_code,
          account_holder_name,
          account_type,
          closing_date,//追加
          deposit_date,//追加
          deposit_method,//追加
          payment_closing_day,//追加
          payment_date,//追加
          payment_method,//追加
          remarks,
        } = req.body;
        let sql, params;
        
        if (id) {
          // Update existing category
          sql = `UPDATE companies SET 
                  name = ?, 
                  code = ?, 
                  address = ?, 
                  phone_number = ?, 
                  fax_number = ?, 
                  registration_number = ?, 
                  representive_name = ?, 
                  bank_name = ?, 
                  bank_account_number = ?, 
                  bank_branch_name = ?, 
                  bank_branch_code = ?, 
                  zip_code = ?,
                  account_holder_name = ?,
                  account_type = ?,
                  closing_date = ?,
                  deposit_date = ?,
                  deposit_method = ?,
                  payment_closing_day = ?,
                  payment_date = ?,
                  payment_method = ?,
                  remarks = ?, 
                  updated = NOW() 
              WHERE id = ?`;
          params = [
            name,
            code,
            address,
            phone_number,
            fax_number,
            registration_number,
            representive_name,
            bank_name,
            bank_account_number,
            bank_branch_name,
            bank_branch_code,
            zip_code,
            account_holder_name,
            account_type,
            closing_date,//追加
            deposit_date,//追加
            deposit_method,//追加
            payment_closing_day,//追加
            payment_date,//追加
            payment_method,//追加    
            remarks,
            id,
          ];
        } else {
          // Insert new category
          sql = `INSERT INTO companies 
            (name, code, address, phone_number, fax_number, registration_number, representive_name, bank_name, bank_account_number, bank_branch_name, bank_branch_code, zip_code, account_holder_name, account_type, closing_date, deposit_date, deposit_method, payment_closing_day, payment_date, payment_method, remarks, created, updated) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
          params = [
            name,
            code,
            address,
            phone_number,
            fax_number,
            registration_number,
            representive_name,
            bank_name,
            bank_account_number,
            bank_branch_name,
            bank_branch_code,
            zip_code,
            account_holder_name,
            account_type,
            closing_date,//追加
            deposit_date,//追加
            deposit_method,//追加
            payment_closing_day,//追加
            payment_date,//追加
            payment_method,//追加    
            remarks,
          ];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving company:", err.message);
            return res.status(500).send("Error saving company.");
          }
          res.send("Company saved successfully.");
        });
      },

      //delete Company by Id
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM companies WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting company:", err.message);
            return res.status(500).send("Error deleting company.");
          }
          res.send("Company deleted successfully.");
        });
      },

      //edit Company
      edit: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM companies WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching companie:", err.message);
            return res.status(500).send("Error fetching companie.");
          }
          res.json(rows[0]);
        });
      },

      //search
      searchCompanies: (req, res) => {
        const { name, address, phone_number, representive_name } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example
        let sql;
        let params = [];
      
        if ((name || address || phone_number || representive_name).trim() !== "") {
          sql = `
              SELECT * FROM companies 
              WHERE name LIKE ? OR address LIKE ? OR phone_number LIKE ? OR representive_name LIKE ?
              `;
          params = [
            name || '%',  // Fallback to '%' if the query is not provided
            address || '%',
            phone_number || '%',
            representive_name || '%',
          ];
        } else {
          sql = `SELECT * FROM companies`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching companies:", err.message);
            return res.status(500).send("Error fetching companies.");
          }
          res.json(rows);
        });
      },
    };
  };
  