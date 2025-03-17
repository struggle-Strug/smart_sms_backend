module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS storage_facilities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(255) DEFAULT NULL,
                address VARCHAR(255) NOT NULL,
                phone_number VARCHAR(255) DEFAULT NULL,
                fax_number VARCHAR(255) DEFAULT NULL,
                contact_person VARCHAR(255) DEFAULT NULL,
                email VARCHAR(255) DEFAULT NULL,
                storage_method VARCHAR(255) DEFAULT NULL,
                remarks VARCHAR(255) DEFAULT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating storageFacilities table:", err.message);
            return res.status(500).send("Error initializing storageFacilities table.");
          }
          res.send("StorageFacilities table initialized successfully.");
        });
      },

      //Load storagefacilities
      load: (req, res) => {
          
        const sql = "SELECT * FROM storage_facilities";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading storagefacilities:", err.message);
            return res.status(500).send("Error loading storagefacilities.");
          }
          res.json(rows);
        });
      },

      //Get storagefacilitie by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM storage_facilities WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching storage_facilitie:", err.message);
            return res.status(500).send("Error fetching storage_facilitie.");
          }
          res.json(rows[0]);
        });
      },

      //Save storage_facilitie
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
          storage_method,
          remarks,
        } = req.body;
        let sql, params;

        if (id) {
          // Update existing category
          sql = `UPDATE storage_facilities SET name = ?, code = ?, address = ?, phone_number = ?, fax_number = ?, contact_person = ?, email = ?, storage_method = ?, remarks = ?, updated = NOW() WHERE id = ?`;
          params = [
            name,
            code,
            address,
            phone_number,
            fax_number,
            contact_person,
            email,
            storage_method,
            remarks,
            id,
          ];
        } else {
          // Insert new storagefacility
          sql = `INSERT INTO storage_facilities (name, code, address, phone_number, fax_number, contact_person, email, storage_method, remarks, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
          params = [
            name,
            code,
            address,
            phone_number,
            fax_number,
            contact_person,
            email,
            storage_method,
            remarks,
          ];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving storagefacility:", err.message);
            return res.status(500).send("Error saving storagefacility.");
          }
          res.send("Storagefacility saved successfully.");
        });
      },

      //Delete storagefacility
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM storage_facilities WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting storagefacility:", err.message);
            return res.status(500).send("Error deleting storagefacility.");
          }
          res.send("Storagefacility deleted successfully.");
        });
      },

      //searchStorageFacility
      searchStorageFacilities: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM storage_facilities 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM storage_facilities`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching StorageFacilities:", err.message);
            return res.status(500).send("Error fetching StorageFacilities.");
          }
          res.json(rows);
        });
      },
    };
  };
  