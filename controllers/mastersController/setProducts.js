module.exports = (db) => {
    return {
      // Initialize the database table
      init: (req, res) => {
  
        const sql = `
            CREATE TABLE IF NOT EXISTS set_products (
                id INT AUTO_INCREMENT PRIMARY KEY, -- セット商品名 id
                set_product_name VARCHAR(255) NOT NULL, -- セット商品名
                code VARCHAR(255), -- セット商品コード
                category VARCHAR(255), -- カテゴリー
                sub_category VARCHAR(255), -- サブカテゴリー
                jan_code VARCHAR(255), -- JANコード
                tax_rate INT, -- 税率
                warning_threshold INT, -- 警告値
                product_search VARCHAR(255) DEFAULT NULL, -- 商品検索 (null可)
                set_product_contents VARCHAR(255) DEFAULT NULL, -- セット内容 (null可)
                set_product_price VARCHAR(255) DEFAULT NULL, -- セット販売価格 (null可)
                updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新日時
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 作成日時
            );
        `;
  
        db.query(sql, (err) => {
          if (err) {
            console.error("Error creating setProducts table:", err.message);
            return res.status(500).send("Error initializing setProducts table.");
          }
          res.send("SetProducts table initialized successfully.");
        });
      },

      //Load setProducts
      load: (req, res) => {
          
        const sql = "SELECT * FROM set_products";

        db.query(sql, (err, rows) => {
          if (err) {
            console.error("Error loading setProducts:", err.message);
            return res.status(500).send("Error loading setProducts.");
          }
          res.json(rows);
        });
      },

      //Get setProduct by ID
      getById: (req, res) => {
        const id = req.params.id;
        const sql = "SELECT * FROM set_products WHERE id = ?";
        db.query(sql, [id], (err, rows) => {
          if (err) {
            console.error("Error fetching setProducts:", err.message);
            return res.status(500).send("Error fetching setProducts.");
          }
          res.json(rows[0]);
        });
      },

      //Save setProduct
      save: (req, res) => {
        const {
          id,
          set_product_name,
          category,
          code,
          sub_category,
          jan_code,
          tax_rate,
          warning_threshold,
          product_search,
          set_product_contents,
          set_product_price,
        } = req.body;
        let sql, params;

        if (id) {
          // Update existing category
          sql = `UPDATE set_products SET set_product_name = ?, category = ?, code = ?, sub_category = ?, jan_code = ?, tax_rate = ?, warning_threshold = ?, product_search = ?, set_product_contents = ?, set_product_price = ?, updated = NOW() WHERE id = ?`;
          params = [
            set_product_name,
            category,
            code,
            sub_category,
            jan_code,
            tax_rate,
            warning_threshold,
            product_search,
            set_product_contents,
            set_product_price,
            id,
          ];
        } else {
          // Insert new category
          sql = `INSERT INTO set_products (set_product_name, category, code, sub_category, jan_code, tax_rate, warning_threshold, product_search, set_product_contents, set_product_price, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
          params = [
            set_product_name,
            category,
            code,
            sub_category,
            jan_code,
            tax_rate,
            warning_threshold,
            product_search,
            set_product_contents,
            set_product_price,
          ];
        }

        db.query(sql, params, (err) => {
          if (err) {
            console.error("Error saving setProducts:", err.message);
            return res.status(500).send("Error saving setProducts.");
          }
          res.send("setProduct saved successfully.");
        });
      },

      //Delete setProduct
      deleteById: (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM set_products WHERE id = ?";
        db.query(sql, [id], (err) => {
          if (err) {
            console.error("Error deleting setProducts:", err.message);
            return res.status(500).send("Error deleting setProducts.");
          }
          res.send("setProduct deleted successfully.");
        });
      },

      //search
      searchSetProducts: (req, res) => {
        const { set_product_name, id, category, sub_category, set_product_price } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example
        let sql;
        let params = [];
      
        if ((set_product_name || id || category || sub_category || set_product_price).trim() !== "") {
          sql = `
              SELECT * FROM set_products 
              WHERE set_product_name LIKE ? 
              OR id LIKE ? 
              OR category LIKE ? 
              OR sub_category LIKE ? 
              OR set_product_price LIKE ?
              `;
          params = [
            set_product_name || '%',  // Fallback to '%' if the query is not provided
            id || '%',
            category || '%',
            sub_category || '%',
            set_product_price || '%',
          ];
        } else {
          sql = `SELECT * FROM set_products`;
        }
      
        db.query(sql, params, (err, rows) => {
          if (err) {
            console.error("Error fetching setProducts:", err.message);
            return res.status(500).send("Error fetching setProducts.");
          }
          res.json(rows);
        });
      },
    };
  };
  