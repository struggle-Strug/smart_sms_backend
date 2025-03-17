
module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY, -- カテゴリ ID
                name VARCHAR(255) DEFAULT NULL, -- カテゴリ名
                code VARCHAR(255) DEFAULT NULL, -- カテゴリコード
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新日時
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 作成日時
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating categories table:", err.message);
            return res.status(500).send("Error initializing categories table.");
          }
          res.send("Categories table initialized successfully.");
        });
      },

      //Load catagories
      load: (req, res) => {
        
        const sql = "SELECT * FROM categories";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading categories:", err.message);
            return res.status(500).send("Error loading categories.");
          }
          res.json(rows);
        });
      },

      //Get catagory by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM categories WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching categories:", err.message);
            return res.status(500).send("Error fetching categories.");
          }
          res.json(rows[0]);
        });
      },

      //Save catagory
      save: (req, res) => {
        const { id, name, code } = req.body;
        let sql, params;

        if (id) {
          // Update existing category
          sql = `UPDATE categories SET name = ?, code = ? WHERE id = ?`;
          params = [name, code, id];
        } else {
          // Insert new category
          sql = `INSERT INTO categories (name, code) VALUES (?, ?)`;
          params = [name, code];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving category:", err.message);
            return res.status(500).send("Error saving category.");
          }
          res.send("Category saved successfully.");
        });
      },

      //Delete catagory
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM categories WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting category:", err.message);
            return res.status(500).send("Error deleting category.");
          }
          res.send("Category deleted successfully.");
        });
      },

      //edit catagory
      edit: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM categories WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching category:", err.message);
            return res.status(500).send("Error fetching category.");
          }
          res.json(rows[0]);
        });
      },

      //search
      searchCategories: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM categories 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM categories`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching categories:", err.message);
            return res.status(500).send("Error fetching categories.");
          }
          res.json(rows);
        });
      },
    };
  };
  