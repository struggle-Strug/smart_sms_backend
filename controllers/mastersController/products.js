module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(255) DEFAULT NULL,
                category VARCHAR(255) DEFAULT NULL,
                subcategory VARCHAR(255) DEFAULT NULL,
                classification_primary VARCHAR(255) NOT NULL,
                classification_secondary VARCHAR(255) DEFAULT NULL,
                jan_code VARCHAR(255) NOT NULL,
                standard_retail_price INT NOT NULL,
                procurement_cost INT DEFAULT NULL,
                manufacturer_name VARCHAR(255) DEFAULT NULL,
                specification VARCHAR(255) DEFAULT NULL,
                unit VARCHAR(255) DEFAULT NULL,
                country_of_origin VARCHAR(255) DEFAULT NULL,
                storage_location VARCHAR(255) DEFAULT NULL,
                storage_method VARCHAR(255) DEFAULT NULL,
                threshold INT DEFAULT NULL,
                tax_rate VARCHAR(255) DEFAULT NULL,
                raw_materials TEXT DEFAULT NULL, 
                raw_materials_weight VARCHAR(255) DEFAULT NULL,
                raw_materials_cost VARCHAR(255) DEFAULT NULL,
                raw_costItem VARCHAR(255) DEFAULT NULL,
                raw_costItem_cost_weight VARCHAR(255) DEFAULT NULL,
                raw_costItem_cost VARCHAR(255) DEFAULT NULL,
                total_original_cost VARCHAR(255) DEFAULT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating products table:", err.message);
            return res.status(500).send("Error initializing products table.");
          }
          res.send("Products table initialized successfully.");
        });
      },

      //Load products
      load: (req, res) => {
          
        const sql = "SELECT * FROM products";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading products:", err.message);
            return res.status(500).send("Error loading products.");
          }
          res.json(rows);
        });
      },

      //Get product by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM products WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching product:", err.message);
            return res.status(500).send("Error fetching product.");
          }
          res.json(rows[0]);
        });
      },

      //Save product
      save: (req, res) => {
        const {
          id,
          name,
          code,
          category,
          subcategory,
          jan_code,
          standard_retail_price,
          procurement_cost,
          manufacturer_name,
          specification,
          unit,
          country_of_origin,
          storage_location,
          storage_method,
          threshold,
          tax_rate,
          raw_materials,
          raw_materials_weight,
          raw_materials_cost,
          raw_costItem,
          raw_costItem_cost_weight,
          raw_costItem_cost,
          total_original_cost,
        } = req.body;
        let sql, params;

        if (id) {
          // Update existing product
          sql = `UPDATE products SET name = ?, code = ?, category = ?, subcategory = ?, jan_code = ?, standard_retail_price = ?, procurement_cost = ?, manufacturer_name = ?, specification = ?, unit = ?, country_of_origin = ?, storage_location = ?, storage_method = ?, threshold = ?, tax_rate = ?, updated = NOW() WHERE id = ?`;
          params = [
            name,
            code,
            category,
            subcategory,
            jan_code,
            standard_retail_price,
            procurement_cost,
            manufacturer_name,
            specification,
            unit,
            country_of_origin,
            storage_location,
            storage_method,
            threshold,
            tax_rate,
            JSON.stringify(raw_materials),
            raw_materials_weight,
            raw_materials_cost,
            raw_costItem,
            raw_costItem_cost_weight,
            raw_costItem_cost,
            total_original_cost,
            id,
          ];
        } else {
          // Insert new product
          sql = `INSERT INTO products (name, code, category, subcategory, jan_code, standard_retail_price, procurement_cost, manufacturer_name, specification, unit, country_of_origin, storage_location, storage_method, threshold, tax_rate, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
          params = [
              name,
              code,
              category,
              subcategory,
              jan_code,
              standard_retail_price,
              procurement_cost,
              manufacturer_name,
              specification,
              unit,
              country_of_origin,
              storage_location,
              storage_method,
              threshold,
              tax_rate,
              JSON.stringify(raw_materials), // Convert materials array to JSON string
              raw_materials_weight,
              raw_materials_cost,
              raw_costItem,
              raw_costItem_cost_weight,
              raw_costItem_cost,
              total_original_cost
          ];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving product:", err.message);
            return res.status(500).send("Error saving product.");
          }
          res.send("Product saved successfully.");
        });
      },

      //Delete product
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM products WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting product:", err.message);
            return res.status(500).send("Error deleting product.");
          }
          res.send("Product deleted successfully.");
        });
      },

      //searchId
      searchIdProducts: (req, res) => {
        const { id } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (id.trim() !== "") {
          sql = `
              SELECT * FROM products LEFT JOIN inventories ON products.id = inventories.product_id
              WHERE products.id LIKE ?
              `;
          params = [`%${id}%`];
        } else {
          sql = `SELECT * FROM products LEFT JOIN inventories ON products.id = inventories.product_id`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching products:", err.message);
            return res.status(500).send("Error fetching products.");
          }
          res.json(rows);
        });
      },

      //searchName
      searchNameProducts: (req, res) => {
        const { name } = req.query // Assuming the query is passed as a query parameter, e.g., ?name=example
        
        let sql;
        let params = [];
        
        if (name.trim() !== "") {
          sql = `
              SELECT * FROM products 
              WHERE name LIKE ?
              `;
          params = [`%${name}%`];
        } else {
          sql = `SELECT * FROM products`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching products:", err.message);
            return res.status(500).send("Error fetching products.");
          }
          res.json(rows);
        });
      },

      //search
      searchProducts: (req, res) => {
        const { name, category, subcategory, jan_code, manufacturer_name } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example
        let sql;
        let params = [];
      
        if ((name || category || subcategory || jan_code || manufacturer_name).trim() !== "") {
          sql = `
              SELECT * FROM products 
              WHERE name LIKE ? 
              OR category LIKE ? 
              OR subcategory LIKE ? 
              OR jan_code LIKE ? 
              OR manufacturer_name LIKE ?
              `;
          params = [
            name || '%',  // Fallback to '%' if the query is not provided
            category || '%',
            subcategory || '%',
            jan_code || '%',
            manufacturer_name || '%',
          ];
        } else {
          sql = `SELECT * FROM products`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching products:", err.message);
            return res.status(500).send("Error fetching products.");
          }
          res.json(rows);
        });
      },
    };
  };
  