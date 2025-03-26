module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS purchase_order_details (
              id INT AUTO_INCREMENT PRIMARY KEY,
              purchase_order_id INT,
              product_id INT,
              product_name VARCHAR(255),
              number INT,
              unit VARCHAR(255),
              price INT,
              tax_rate INT,
              storage_facility VARCHAR(255),
              stock INT,
              lot_number INT,
              created DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      db.query(sql, (err) => {
        if (err) {
          console.error(
            "Error creating purchaseOrderDetails table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing purchaseOrderDetails table.");
        }
        res.send("PurchaseOrderDetails table initialized successfully.");
      });
    },

    // Load Purchase Order Details
    loadPurchaseOrderDetails: (req, res) => {
      const sql = `
        SELECT pod.*, p.*, v.*, po.*
        FROM purchase_order_details pod
        LEFT JOIN purchase_orders po ON pod.purchase_order_id = po.id
        LEFT JOIN products p ON pod.product_id = p.id
        LEFT JOIN vendors v ON po.vender_id = v.id
      `;

      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading purchase order details:", err.message);
          return res.status(500).send("Error loading purchase order details.");
        }
        res.json(rows);
      });
    },

    // Get Purchase Order Detail by ID
    getPurchaseOrderDetailById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM purchase_order_details WHERE id = ?`;

      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error("Error fetching purchase order detail:", err.message);
          return res.status(500).send("Error fetching purchase order detail.");
        }
        res.json(row);
      });
    },

    // Save Purchase Order Detail
    savePurchaseOrderDetail: (req, res) => {
      const {
        purchase_order_id,
        product_id,
        product_name,
        number,
        unit,
        price,
        tax_rate,
        storage_facility,
        stock,
        lot_number,
      } = req.body;

      const sql = `
        INSERT INTO purchase_order_details 
        (purchase_order_id, product_id, product_name, number, unit, price, tax_rate, storage_facility, stock, lot_number, created, updated) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      db.query(
        sql,
        [
          purchase_order_id,
          product_id,
          product_name,
          number,
          unit,
          price,
          tax_rate,
          storage_facility,
          stock,
          lot_number,
        ],
        (err, result) => {
          if (err) {
            console.error("Error saving purchase order detail:", err.message);
            return res.status(500).send("Error saving purchase order detail.");
          }
          res.json({ success: true, id: result.insertId });
        }
      );
    },

    // Delete Purchase Order Detail by ID
    deletePurchaseOrderDetailById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM purchase_order_details WHERE id = ?`;

      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting purchase order detail:", err.message);
          return res.status(500).send("Error deleting purchase order detail.");
        }
        res.json({ success: true });
      });
    },

    // Edit Purchase Order Details
    editPurchaseOrdersDetail: (req, res) => {
      const { purchase_order_id, purchaseOrderDetails } = req.body;

      db.beginTransaction((err) => {
        if (err) {
          console.error("Transaction start error:", err.message);
          return res.status(500).send("Error starting transaction.");
        }

        db.query(
          `DELETE FROM purchase_order_details WHERE purchase_order_id = ?`,
          [purchase_order_id],
          (err) => {
            if (err) {
              return db.rollback(() => {
                console.error(
                  "Error deleting purchase order details:",
                  err.message
                );
                res.status(500).send("Error deleting purchase order details.");
              });
            }

            const insertStmt = `
              INSERT INTO purchase_order_details 
              (purchase_order_id, product_id, product_name, number, unit, price, tax_rate, storage_facility, stock, lot_number, created, updated) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            const values = purchaseOrderDetails.map((detail) => [
              purchase_order_id,
              detail.product_id,
              detail.product_name,
              detail.number,
              detail.unit,
              detail.price,
              detail.tax_rate,
              detail.storage_facility,
              detail.stock,
              detail.lot_number,
            ]);

            db.query(insertStmt, [values], (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error(
                    "Error inserting purchase order details:",
                    err.message
                  );
                  res
                    .status(500)
                    .send("Error inserting purchase order details.");
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error("Transaction commit error:", err.message);
                    res.status(500).send("Error committing transaction.");
                  });
                }
                res.json({ success: true });
              });
            });
          }
        );
      });
    },

    // Search Purchase Order Details
    searchPurchaseOrderDetails: (req, res) => {
      let sql = `
            SELECT pod.*, po.*, p.*, v.*
            FROM purchase_order_details pod
            LEFT JOIN purchase_orders po ON pod.purchase_order_id = po.id
            LEFT JOIN products p ON pod.product_id = p.id
            LEFT JOIN vendors v ON po.vender_id = v.id
        `;

      let whereClauses = [];
      let params = [];

      if (req.body && Object.keys(req.body).length > 0) {
        for (const [column, value] of Object.entries(req.body)) {
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
        sql += " WHERE " + whereClauses.join(" AND ");
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching purchase order details:", err.message);
          return res
            .status(500)
            .send("Error searching purchase order details.");
        }
        res.json(rows);
      });
    },

    // Search Purchase Orders by Purchase Order ID
    searchPurchaseOrdersByPurchaseOrderId: (req, res) => {
      const { purchase_order_id } = req.body;
      let sql;
      let params = [];

      if (purchase_order_id && purchase_order_id.trim() !== "") {
        sql = `
            SELECT * FROM purchase_order_details 
            WHERE purchase_order_id LIKE ?
            `;
        params = [`%${purchase_order_id}%`];
      } else {
        sql = `SELECT * FROM purchase_order_details`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching purchase orders by ID:", err.message);
          return res.status(500).send("Error searching purchase orders by ID.");
        }
        res.json(rows);
      });
    },
  };
};
