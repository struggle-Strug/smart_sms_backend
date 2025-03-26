module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS purchase_orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(255),
            order_date VARCHAR(255),
            vender_id VARCHAR(255),
            vender_name VARCHAR(255),
            honorific VARCHAR(255),
            vender_contact_person VARCHAR(255),
            remarks VARCHAR(255),
            closing_date VARCHAR(255),
            payment_due_date VARCHAR(255),
            payment_method VARCHAR(255),
            estimated_delivery_date VARCHAR(255),
            status VARCHAR(255) DEFAULT '未処理',
            created DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating purchaseOrders table:", err.message);
          return res
            .status(500)
            .send("Error initializing purchaseOrders table.");
        }
        res.send("PurchaseOrders table initialized successfully.");
      });
    },

    // Load Purchase Orders
    loadPurchaseOrders: (req, res) => {
      const pageSize = 10;
      const page = req.query.page;
      const offset = page;

      const sql =
        page === undefined
          ? `SELECT * FROM purchase_orders`
          : `SELECT * FROM purchase_orders LIMIT ? OFFSET ?`;

      const params = page === undefined ? [] : [pageSize, offset];

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error loading purchase orders:", err.message);
          return res.status(500).send("Error loading purchase orders.");
        }
        res.json(rows);
      });
    },

    // Get Purchase Order by ID
    getPurchaseOrderById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM purchase_orders WHERE id = ?`;

      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error("Error fetching purchase order:", err.message);
          return res.status(500).send("Error fetching purchase order.");
        }
        res.json(row);
      });
    },

    // Search Purchase Orders
    searchPurchaseOrders: (req, res) => {
      const { code, vender_name } = req.query;
      let sql;
      let params = [];

      if ((vender_name || code).trim() !== "") {
        sql = `
              SELECT * FROM purchase_orders 
              WHERE code LIKE ?
              OR vender_name LIKE ?`;
        params = Array(2).fill(`%${query}%`);
      } else {
        sql = `SELECT * FROM purchase_orders`;
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching purchase orders:", err.message);
          return res.status(500).send("Error searching purchase orders.");
        }
        res.json(rows);
      });
    },

    // Search Purchase Orders with Conditions
    searchPurchaseOrdersOnPV: (req, res) => {
      const { conditions } = req.body;
      let sql = `SELECT * FROM purchase_orders WHERE 1=1`;
      let params = [];

      if (conditions.po_start_date) {
        sql += ` AND order_date >= ?`;
        params.push(conditions.po_start_date);
      }
      if (conditions.po_end_date) {
        sql += ` AND order_date <= ?`;
        params.push(conditions.po_end_date);
      }
      if (conditions.po_code) {
        sql += ` AND code LIKE ?`;
        params.push(`%${conditions.po_code}%`);
      }
      if (conditions.po_name) {
        sql += ` AND vender_name LIKE ?`;
        params.push(`%${conditions.po_name}%`);
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error(
            "Error searching purchase orders with conditions:",
            err.message
          );
          return res
            .status(500)
            .send("Error searching purchase orders with conditions.");
        }
        res.json(rows);
      });
    },

    // Save Purchase Order
    savePurchaseOrder: (req, res) => {
      const orderData = req.body;
      const sql = orderData.id
        ? `UPDATE purchase_orders SET code = ?, order_date = ?, vender_id = ?, vender_name = ?, honorific = ?, vender_contact_person = ?, remarks = ?, closing_date = ?, payment_due_date = ?, payment_method = ?, estimated_delivery_date = ?, updated = datetime('now') WHERE id = ?`
        : `INSERT INTO purchase_orders (code, order_date, vender_id, vender_name, honorific, vender_contact_person, remarks, closing_date, payment_due_date, payment_method, estimated_delivery_date, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;

      const params = orderData.id
        ? [
            orderData.code,
            orderData.order_date,
            orderData.vender_id,
            orderData.vender_name,
            orderData.honorific,
            orderData.vender_contact_person,
            orderData.remarks,
            orderData.closing_date,
            orderData.payment_due_date,
            orderData.payment_method,
            orderData.estimated_delivery_date,
            orderData.id,
          ]
        : [
            orderData.code,
            orderData.order_date,
            orderData.vender_id,
            orderData.vender_name,
            orderData.honorific,
            orderData.vender_contact_person,
            orderData.remarks,
            orderData.closing_date,
            orderData.payment_due_date,
            orderData.payment_method,
            orderData.estimated_delivery_date,
          ];

      db.run(sql, params, function (err) {
        if (err) {
          console.error("Error saving purchase order:", err.message);
          return res.status(500).send("Error saving purchase order.");
        }
        res.json({ id: orderData.id || this.lastID });
      });
    },

    // Delete Purchase Order by ID
    deletePurchaseOrderById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM purchase_orders WHERE id = ?`;

      db.run(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting purchase order:", err.message);
          return res.status(500).send("Error deleting purchase order.");
        }
        res.json({ message: "Purchase order deleted successfully." });
      });
    },

    // Update Purchase Order Status
    updatePurchaseOrderStatus: (req, res) => {
      const query = req.body;
      const sql = `UPDATE purchase_orders SET status = ?, updated = datetime('now') WHERE code = ?`;
      db.run(sql, [query.status, query.code], function (err) {
        if (err) {
          console.error("Error updating purchase order status:", err.message);
          return res.status(500).send("Error updating purchase order status.");
        }
        res.json({ code: query.code });
      });
    },
  };
};
