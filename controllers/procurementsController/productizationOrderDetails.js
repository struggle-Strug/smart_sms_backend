module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS productization_order_details (
              id INT AUTO_INCREMENT PRIMARY KEY, -- MySQL equivalent for AUTOINCREMENT
              product_order_id INT,              -- Foreign key to productization_orders (if applicable)
              product_id INT,                    -- Foreign key to products (if applicable)
              product_name VARCHAR(255),
              number INT,
              unit VARCHAR(255),
              price INT,
              origin_price INT,
              storage VARCHAR(255),
              stock INT,
              lot_number INT,
              created DATE DEFAULT CURRENT_DATE,  -- Current date as default for created
              updated DATE DEFAULT CURRENT_DATE   -- Current date as default for updated
          );
      `;

      db.query(sql, (err) => {
        if (err) {
          console.error(
            "Error creating productizationDetails table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing productizationDetails table.");
        }
        res.send("ProductizationDetails table initialized successfully.");
      });
    },

    // Save Productization Order Detail
    saveProductizationOrderDetail: (req, res) => {
      const detailData = req.body;
      const {
        id,
        product_order_id,
        product_id,
        product_name,
        number,
        unit,
        price,
        origin_price,
        storage,
        stock,
        lot_number,
      } = detailData;

      if (id) {
        db.query(
          `SELECT id FROM productization_order_details WHERE id = ?`,
          [id],
          (err, row) => {
            if (err) {
              console.error(
                "Error checking existing productization order detail:",
                err.message
              );
              return res
                .status(500)
                .send("Error checking productization order detail.");
            }

            if (row.length > 0) {
              db.query(
                `UPDATE productization_order_details SET 
                  product_order_id = ?, 
                  product_id = ?, 
                  product_name = ?,
                  number = ?, 
                  unit = ?, 
                  price = ?, 
                  origin_price = ?, 
                  storage = ?, 
                  stock = ?, 
                  lot_number = ?,
                  updated = CURRENT_TIMESTAMP 
                WHERE id = ?`,
                [
                  product_order_id,
                  product_id,
                  product_name,
                  number,
                  unit,
                  price,
                  origin_price,
                  storage,
                  stock,
                  lot_number,
                  id,
                ],
                (err) => {
                  if (err) {
                    console.error(
                      "Error updating productization order detail:",
                      err.message
                    );
                    return res
                      .status(500)
                      .send("Error updating productization order detail.");
                  }
                  res.json({ id: id });
                }
              );
            } else {
              db.query(
                `INSERT INTO productization_order_details 
                  (product_order_id, product_id, product_name, number, unit, price, origin_price, storage, stock, lot_number, created, updated) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                  product_order_id,
                  product_id,
                  product_name,
                  number,
                  unit,
                  price,
                  origin_price,
                  storage,
                  stock,
                  lot_number,
                ],
                (err, result) => {
                  if (err) {
                    console.error(
                      "Error inserting productization order detail:",
                      err.message
                    );
                    return res
                      .status(500)
                      .send("Error inserting productization order detail.");
                  }
                  res.json({ id: result.insertId });
                }
              );
            }
          }
        );
      } else {
        db.query(
          `INSERT INTO productization_order_details 
            (product_order_id, product_id, product_name, number, unit, price, origin_price, storage, stock, lot_number, created, updated) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            product_order_id,
            product_id,
            product_name,
            number,
            unit,
            price,
            origin_price,
            storage,
            stock,
            lot_number,
          ],
          (err, result) => {
            if (err) {
              console.error(
                "Error inserting productization order detail:",
                err.message
              );
              return res
                .status(500)
                .send("Error inserting productization order detail.");
            }
            res.json({ id: result.insertId });
          }
        );
      }
    },

    // Load All Productization Order Details
    loadProductizationOrderDetails: (req, res) => {
      const sql = `
          SELECT pod.*, p.*, po.*
          FROM productization_order_details pod
          LEFT JOIN productization_orders po ON pod.product_order_id = po.id
          LEFT JOIN products p ON pod.product_name = p.name
      `;
      db.query(sql, (err, rows) => {
        if (err) {
          console.error(
            "Error loading productization order details:",
            err.message
          );
          return res
            .status(500)
            .send("Error loading productization order details.");
        }
        res.json(rows);
      });
    },

    // Get Productization Order Detail by ID
    getProductizationOrderDetailById: (req, res) => {
      const { id } = req.params;
      db.query(
        `SELECT * FROM productization_order_details WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) {
            console.error(
              "Error fetching productization order detail:",
              err.message
            );
            return res
              .status(500)
              .send("Error fetching productization order detail.");
          }
          res.json(row);
        }
      );
    },

    // Delete Productization Order Detail by ID
    deleteProductizationOrderDetailById: (req, res) => {
      const { id } = req.params;
      db.query(
        `DELETE FROM productization_order_details WHERE product_order_id = ?`,
        [id],
        (err) => {
          if (err) {
            console.error(
              "Error deleting productization order detail:",
              err.message
            );
            return res
              .status(500)
              .send("Error deleting productization order detail.");
          }
          res.json({
            message: "Productization order detail deleted successfully.",
          });
        }
      );
    },

    // Search Productization Order Details
    searchProductizationOrderDetails: (req, res) => {
      let sql = `
          SELECT pod.*, p.*, po.*
          FROM productization_order_details pod
          LEFT JOIN productization_orders po ON pod.product_order_id = po.id
          LEFT JOIN products p ON pod.product_name = p.name
      `;

      let whereClauses = [];
      let params = [];

      const { conditions } = req.body;

      if (conditions && Object.keys(conditions).length > 0) {
        for (const [column, value] of Object.entries(conditions)) {
          if (column === "pod.created_start") {
            whereClauses.push(`po.order_date >= ?`);
            params.push(value);
          } else if (column === "pod.created_end") {
            whereClauses.push(`po.order_date <= ?`);
            params.push(value);
          } else {
            whereClauses.push(`${column} LIKE ?`);
            params.push(`%${value}%`);
          }
        }
      }

      if (whereClauses.length > 0) {
        sql += ` WHERE ` + whereClauses.join(" AND ");
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error(
            "Error searching productization order details:",
            err.message
          );
          return res
            .status(500)
            .send("Error searching productization order details.");
        }
        res.json(rows);
      });
    },

    // Search Productization Orders By Productization Order ID
    searchProductizationOrdersByProductizationOrderId: (req, res) => {
      const query = req.query.product_order_id;
      let sql;
      let params = [];

      if (query && query.trim() !== "") {
        sql = `SELECT * FROM productization_order_details WHERE product_order_id LIKE ?`;
        params = [`%${query}%`];
      } else {
        sql = `SELECT * FROM productization_order_details`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error(
            "Error searching productization order details by product_order_id:",
            err.message
          );
          return res
            .status(500)
            .send(
              "Error searching productization order details by product_order_id."
            );
        }
        res.json(rows);
      });
    },
  };
};
