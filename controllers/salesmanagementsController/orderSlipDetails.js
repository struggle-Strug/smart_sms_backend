module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
              CREATE TABLE IF NOT EXISTS order_slip_details (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  order_slip_id INT NOT NULL,
                  product_id INT NOT NULL,
                  product_name VARCHAR(255) DEFAULT NULL,
                  number INT NOT NULL,
                  unit VARCHAR(255) DEFAULT NULL,
                  unit_price INT NOT NULL,
                  tax_rate INT NOT NULL,
                  lot_number INT DEFAULT NULL,
                  storage_facility VARCHAR(255) DEFAULT NULL,
                  stock INT DEFAULT NULL,
                  gross_profit INT DEFAULT NULL,
                  gross_margin_rate INT DEFAULT NULL,
                  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  FOREIGN KEY (order_slip_id) REFERENCES order_slips(id),
                  FOREIGN KEY (product_id) REFERENCES products(id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating orderSlipDetails table:", err.message);
          return res
            .status(500)
            .send("Error initializing orderSlipDetails table.");
        }
        res.send("OrderSlipDetails table initialized successfully.");
      });
    },

    // Load Order Slip Details
    loadOrderSlipDetails: (req, res) => {
      const sql = `SELECT * FROM order_slip_details osd
                       LEFT JOIN products p ON osd.product_id = p.id
                       LEFT JOIN order_slips os ON osd.order_slip_id = os.id`;
      db.query(sql, [], (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Get Order Slip Detail by ID
    getOrderSlipDetailById: (req, res) => {
      const id = req.params.id;
      const sql = `SELECT * FROM order_slip_details WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(row);
      });
    },

    // Save Order Slip Detail
    saveOrderSlipDetail: (req, res) => {
      const orderSlipDetailData = req.body;
      const {
        id,
        order_slip_id,
        product_id,
        product_name,
        number,
        unit,
        unit_price,
        tax_rate,
        lot_number,
        storage_facility,
        stock,
        gross_profit,
        gross_margin_rate,
      } = orderSlipDetailData;
      if (id) {
        db.query(
          `SELECT id FROM order_slip_details WHERE id = ?`,
          [id],
          (err, row) => {
            if (err) {
              return res.status(500).send(err.message);
            }

            if (row) {
              db.query(
                `UPDATE order_slip_details SET 
                              order_slip_id = ?, 
                              product_id = ?, 
                              product_name = ?, 
                              number = ?, 
                              unit = ?, 
                              unit_price = ?, 
                              tax_rate = ?, 
                              lot_number = ?, 
                              storage_facility = ?, 
                              stock = ?, 
                              gross_profit = ?, 
                              gross_margin_rate = ?, 
                              updated = CURRENT_TIMESTAMP 
                          WHERE id = ?`,
                [
                  order_slip_id,
                  product_id,
                  product_name,
                  number,
                  unit,
                  unit_price,
                  tax_rate,
                  lot_number,
                  storage_facility,
                  stock,
                  gross_profit,
                  gross_margin_rate,
                  id,
                ],
                (err) => {
                  if (err) {
                    return res.status(500).send(err.message);
                  }
                  res.json({ id });
                }
              );
            } else {
              db.query(
                `INSERT INTO order_slip_details 
                          (order_slip_id, product_id, product_name, number, unit, unit_price, tax_rate, lot_number, storage_facility, stock, gross_profit, gross_margin_rate, created, updated) 
                          VALUES 
                          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                  order_slip_id,
                  product_id,
                  product_name,
                  number,
                  unit,
                  unit_price,
                  tax_rate,
                  lot_number,
                  storage_facility,
                  stock,
                  gross_profit,
                  gross_margin_rate,
                ],
                function (err) {
                  if (err) {
                    return res.status(500).send(err.message);
                  }
                  res.json({ id: this.lastID });
                }
              );
            }
          }
        );
      } else {
        db.query(
          `INSERT INTO order_slip_details 
              (order_slip_id, product_id, product_name, number, unit, unit_price, tax_rate, lot_number, storage_facility, stock, gross_profit, gross_margin_rate, created, updated) 
              VALUES 
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            order_slip_id,
            product_id,
            product_name,
            number,
            unit,
            unit_price,
            tax_rate,
            lot_number,
            storage_facility,
            stock,
            gross_profit,
            gross_margin_rate,
          ],
          function (err) {
            if (err) {
              return res.status(500).send(err.message);
            }
            res.json({ id: this.lastID });
          }
        );
      }
    },

    // Delete Order Slip Detail by ID
    deleteOrderSlipDetailById: (req, res) => {
      const id = req.params.id;
      const sql = `DELETE FROM order_slip_details WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ message: "Order slip detail deleted successfully" });
      });
    },

    // Delete Order Slip Details by Order Slip ID
    deleteOrderSlipDetailByOrderSlipId: (req, res) => {
      const id = req.params.id;
      const sql = `DELETE FROM order_slip_details WHERE order_slip_id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ message: "Order slip details deleted successfully" });
      });
    },

    // Delete Order Slip Details by Slip ID
    deleteOrderSlipDetailsBySlipId: (req, res) => {
      const orderSlipId = req.params.id;
      const sql = `DELETE FROM order_slip_details WHERE order_slip_id = ?`;
      db.query(sql, [orderSlipId], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ message: "Order slip details deleted successfully" });
      });
    },

    // Search Order Slips by Order Slip ID
    searchOrderSlipsByOrderSlipId: (req, res) => {
      const { order_slip_id } = req.query;
      let sql;
      let params = [];

      if (order_slip_id && order_slip_id.trim() !== "") {
        sql = `SELECT * FROM order_slip_details WHERE order_slip_id LIKE ?`;
        params = [`%${order_slip_id}%`];
      } else {
        sql = `SELECT * FROM order_slip_details`;
      }
      db.query(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Search Order Slip Details
    searchOrderSlipDetails: (req, res) => {
      let sql = `SELECT * FROM order_slip_details osd
                   LEFT JOIN order_slips os ON osd.order_slip_id = os.id
                   LEFT JOIN products p ON osd.product_id = p.id`;

      let whereClauses = [];
      let params = [];

      if (req.body && Object.keys(req.body).length > 0) {
        for (const [column, value] of Object.entries(req.body)) {
          if (column === "osd.created_start") {
            whereClauses.push(`osd.created >= ?`);
            params.push(value);
          } else if (column === "osd.created_end") {
            whereClauses.push(`osd.created <= ?`);
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
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Search Order Slip Deposit Details
    searchOrderSlipDepositDetails: (req, res) => {
      let sql = `SELECT * FROM order_slip_details osd
                   LEFT JOIN order_slips os ON osd.order_slip_id = os.id
                   LEFT JOIN products p ON osd.product_id = p.id`;

      let whereClauses = [];
      let params = [];

      if (req.body && Object.keys(req.body).length > 0) {
        for (const [column, value] of Object.entries(req.body)) {
          if (column === "os.deposit_start") {
            whereClauses.push(`os.deposit_due_date >= ?`);
            params.push(value);
          } else if (column === "os.deposit_end") {
            whereClauses.push(`os.deposit_due_date <= ?`);
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
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Search Order Slip by Order Slip ID
    searchOrderSlipByOrderSlipId: (req, res) => {
      let sql;
      let params = [];

      if (req.body.query && req.body.query.trim() !== "") {
        sql = `
              SELECT * FROM order_slip_details
              WHERE order_slip_id LIKE ?
          `;
        params = [`%${req.body.query}%`];
      } else {
        sql = `SELECT * FROM order_slip_details`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Delete Order Slip Details by Order Slip ID
    deleteOrderSlipDetailsBySoId: (req, res) => {
      const orderSlipId = req.params.orderSlipId;
      const sql = `DELETE FROM order_slip_details WHERE order_slip_id = ?`;
      db.query(sql, [orderSlipId], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.send("Order slip details deleted successfully.");
      });
    },
  };
};
