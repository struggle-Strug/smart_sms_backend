module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS subcategories (
                id INT AUTO_INCREMENT PRIMARY KEY, -- サブカテゴリ ID
                name VARCHAR(255) DEFAULT NULL, -- サブカテゴリ名
                code VARCHAR(255) DEFAULT NULL, -- サブカテゴリコード
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新日時
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 作成日時
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating subCategories table:", err.message);
            return res.status(500).send("Error initializing subCategories table.");
          }
          res.send("SubCategories table initialized successfully.");
        });
      },

      //Load subCatagories
      load: (req, res) => {
        
        const sql = "SELECT * FROM subcategories";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading subCatagories:", err.message);
            return res.status(500).send("Error loading subCatagories.");
          }
          res.json(rows);
        });
      },

      //Get subCatagory by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM subcategories WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching subcategories:", err.message);
            return res.status(500).send("Error fetching subcategories.");
          }
          res.json(rows[0]);
        });
      },

      //Save subCatagory
      save: (req, res) => {
        const { id, name, code } = req.body;
        let sql, params;

        if (id) {
          // Update existing category
          sql = `UPDATE subcategories SET name = ?, code = ?, updated = NOW() WHERE id = ?`;
          params = [name, code, id];
        } else {
          // Insert new category
          sql = `INSERT INTO subcategories (name, code, created, updated) VALUES (?, ?, NOW(), NOW())`;
          params = [name, code];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving subcategories:", err.message);
            return res.status(500).send("Error saving subcategories.");
          }
          res.send("Subcategory saved successfully.");
        });
      },

      //Delete subCategory
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM subcategories WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting subCategory:", err.message);
            return res.status(500).send("Error deleting subCategory.");
          }
          res.send("SubCategory deleted successfully.");
        });
      },

      //edit subCatagory
      edit: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM subcategories WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching subCatagory:", err.message);
            return res.status(500).send("Error fetching subCatagory.");
          }
          res.json(rows[0]);
        });
      },

      //search
      searchSubcategories: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM subcategories 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM subcategories`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching subcategories:", err.message);
            return res.status(500).send("Error fetching subcategories.");
          }
          res.json(rows);
        });
      },
    };
  };
  