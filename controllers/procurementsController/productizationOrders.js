module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS productization_orders (
              id INT AUTO_INCREMENT PRIMARY KEY, -- MySQL equivalent for AUTOINCREMENT
              code VARCHAR(255),
              order_date VARCHAR(255),
              contact_person VARCHAR(255),
              remarks VARCHAR(255),
              created DATE DEFAULT CURRENT_DATE,  -- Current date as default for created
              updated DATE DEFAULT CURRENT_DATE   -- Current date as default for updated
          );
      `;

      db.query(sql, (err) => {
        if (err) {
          console.error(
            "Error creating productizationOrders table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing productizationOrders table.");
        }
        res.send("ProductizationOrders table initialized successfully.");
      });
    },

    // Save Productization Order
    saveProductizationOrder: (req, res) => {
      console.log("saveProductizationOrder", req.body);
      const { id, code, order_date, contact_person, remarks } = req.body;

      if (id) {
        const sql = `UPDATE productization_orders SET 
                      code = ?,
                      order_date = ?, 
                      contact_person = ?, 
                      remarks = ?, 
                      updated = CURRENT_TIMESTAMP 
                  WHERE id = ?`;
        db.query(
          sql,
          [code, order_date, contact_person, remarks, id],
          (err) => {
            if (err) {
              console.error(
                "Error updating productization order:",
                err.message
              );
              return res
                .status(500)
                .send("Error updating productization order.");
            }
            res.json({ id: id });
          }
        );
      } else {
        const sql = `INSERT INTO productization_orders 
                  (code, order_date, contact_person, remarks, created, updated) 
                  VALUES 
                  (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        db.query(
          sql,
          [code, order_date, contact_person, remarks],
          (err, result) => {
            if (err) {
              console.error(
                "Error inserting productization order:",
                err.message
              );
              return res
                .status(500)
                .send("Error inserting productization order.");
            }
            res.json({ id: result.insertId });
          }
        );
      }
    },

    // Load Productization Orders
    loadProductizationOrders: (req, res) => {
      const { page } = req.query;
      const pageSize = 10;
      const offset = page ? parseInt(page) * pageSize : 0;

      const sql =
        page === undefined
          ? `SELECT * FROM productization_orders`
          : `SELECT * FROM productization_orders LIMIT ? OFFSET ?`;

      const params = page === undefined ? [] : [pageSize, offset];

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error loading productization orders:", err.message);
          return res.status(500).send("Error loading productization orders.");
        }
        res.json(rows);
      });
    },

    // Get Productization Order By ID
    getProductizationOrderById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM productization_orders WHERE id = ?`;

      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error fetching productization order:", err.message);
          return res.status(500).send("Error fetching productization order.");
        }
        res.json(row);
      });
    },

    // Delete Productization Order By ID
    deleteProductizationOrderById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM productization_orders WHERE id = ?`;

      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting productization order:", err.message);
          return res.status(500).send("Error deleting productization order.");
        }
        res.send("Productization order deleted successfully.");
      });
    },

    //search Productization Order
    searchProductizationOrders: (req, res) => {
      const { code } = req.query; // Assuming the search query is passed as a URL query parameter (e.g., ?query=example)

      let sql;
      let params = [];

      // If a query is provided, search using LIKE for the relevant columns
      if (code.trim() !== "") {
        sql = `
            SELECT * FROM productization_orders 
            WHERE code LIKE ? 
          `;
        params = [code || "%"];
      } else {
        sql = `SELECT * FROM productization_orders`; // Return all inventories if no query is provided
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching productization orders:", err.message);
          return res.status(500).send("Error searching productization orders.");
        }

        res.json(rows); // Return the results as JSON
      });
    },
  };
};
