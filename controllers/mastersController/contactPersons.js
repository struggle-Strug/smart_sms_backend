module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS contact_persons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(255) DEFAULT NULL,
                department VARCHAR(255),
                position VARCHAR(255),
                phone_number VARCHAR(255),
                email VARCHAR(255),
                remarks VARCHAR(255),
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating contactPersons table:", err.message);
            return res.status(500).send("Error initializing contactPersons table.");
          }
          res.send("ContactPersons table initialized successfully.");
        });
      },

      //Load contactPersons
      load: (req, res) => {
        const sql = "SELECT * FROM contact_persons";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading contact_persons:", err.message);
            return res.status(500).send("Error loading contact_persons.");
          }
          res.json(rows);
        });
      },

      //getContactPerson by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM contact_persons WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching contact_persons:", err.message);
            return res.status(500).send("Error fetching contact_persons.");
          }
          res.json(rows[0]);
        });
      },

      //save ContactPerson
      save: (req, res) => {
        const { id, name, code, department, position, phone_number, email, remarks } = req.body;
        let sql, params;
        
        if (id) {
          // Update existing category
          sql = `UPDATE contact_persons
                     SET name = ?, code = ?, department = ?, position = ?, phone_number = ?, email = ?, remarks = ?, updated = CURRENT_TIMESTAMP
                     WHERE id = ?`;
          params = [name, code, department, position, phone_number, email, remarks, id];
        } else {
          // Insert new category
          sql = `INSERT INTO contact_persons (name, code, department, position, phone_number, email, remarks, created, updated)
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
          params = [name, code, department, position, phone_number, email, remarks];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving contact_person:", err.message);
            return res.status(500).send("Error saving contact_person.");
          }
          res.send("Contact_person saved successfully.");
        });
      },

      //delete Contact_person by Id
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM contact_persons WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting Contact_person:", err.message);
            return res.status(500).send("Error deleting Contact_person.");
          }
          res.send("Contact_person deleted successfully.");
        });
      },

      //edit Contact_person
      edit: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM contact_persons WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching contact_persons:", err.message);
            return res.status(500).send("Error fetching contact_persons.");
          }
          res.json(rows[0]);
        });
      },

      //search
      searchContact_persons: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM contact_persons 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM contact_persons`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching contact_persons:", err.message);
            return res.status(500).send("Error fetching contact_persons.");
          }
          res.json(rows);
        });
      },
    };
  };
  