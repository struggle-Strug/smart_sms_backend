module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS purchase_invoice_details (
              id INT AUTO_INCREMENT PRIMARY KEY,
              purchase_invoice_id INT,
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
            "Error creating purchaseInvoiceDetails table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing purchaseInvoiceDetails table.");
        }
        res.send("PurchaseInvoiceDetails table initialized successfully.");
      });
    },

    // Load Purchase Invoice Details
    loadPurchaseInvoiceDetails: (req, res) => {
      const sql = `
          SELECT pid.*, p.*, v.*, pi.*
          FROM purchase_invoice_details pid
          LEFT JOIN purchase_invoices pi ON pid.purchase_invoice_id = pi.id
          LEFT JOIN products p ON pid.product_id = p.id
          LEFT JOIN vendors v ON pi.vender_id = v.id
      `;
      db.query(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    },

    // Get Purchase Invoice Detail by ID
    getPurchaseInvoiceDetailById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM purchase_invoice_details WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    },

    // Save Purchase Invoice Detail
    savePurchaseInvoiceDetail: (req, res) => {
      const {
        id,
        purchase_invoice_id,
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
      console.log(req.body)
      if (id) {
        db.query(
          `UPDATE purchase_invoice_details SET 
            purchase_invoice_id = ?, 
            product_id = ?, 
            product_name = ?,
            number = ?, 
            unit = ?, 
            price = ?, 
            tax_rate = ?, 
            storage_facility = ?, 
            stock = ?, 
            lot_number = ?, 
            updated = CURRENT_TIMESTAMP 
          WHERE id = ?`,
          [
            purchase_invoice_id,
            product_id,
            product_name,
            number,
            unit,
            price,
            tax_rate,
            storage_facility,
            stock,
            lot_number,
            id,
          ],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
              message: "Purchase invoice detail updated successfully.",
            });
          }
        );
      } else {
        db.query(
          `INSERT INTO purchase_invoice_details 
            (purchase_invoice_id, product_id, product_name, number, unit, price, tax_rate, storage_facility, stock, lot_number, created, updated) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            purchase_invoice_id,
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
          function (err, result) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
              message: "Purchase invoice detail saved successfully.",
              lastID: result.insertId,
            });
          }
        );
      }
    },

    // Search Purchase Invoice Details
    searchPurchaseInvoiceDetails: (req, res) => {
      const { conditions } = req.body;
      let sql = `
          SELECT pid.*, pi.*, p.*, v.*
          FROM purchase_invoice_details pid
          LEFT JOIN purchase_invoices pi ON pid.purchase_invoice_id = pi.id
          LEFT JOIN products p ON pid.product_id = p.id
          LEFT JOIN vendors v ON pi.vender_id = v.id
      `;

      let whereClauses = [];
      let params = [];

      if (conditions && Object.keys(conditions).length > 0) {
        for (const [column, value] of Object.entries(conditions)) {
          if (column === "pid.created_start") {
            whereClauses.push(`pi.order_date >= ?`);
            params.push(value);
          } else if (column === "pid.created_end") {
            whereClauses.push(`pi.order_date <= ?`);
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
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    },

    // Delete Purchase Invoice Detail by ID
    deletePurchaseInvoiceDetailById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM purchase_invoice_details WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Purchase invoice detail deleted successfully." });
      });
    },

    // Delete Purchase Invoice Details by Purchase Invoice ID
    deletePurchaseInvoiceDetailsByPiId: (req, res) => {
      const { purchaseInvoiceId } = req.params;
      const sql = `
          DELETE FROM purchase_invoice_details
          WHERE purchase_invoice_id = ?
      `;
      db.query(sql, [purchaseInvoiceId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Purchase invoice details deleted successfully." });
      });
    },

    // Search Purchase Invoices by Purchase Invoice ID
    searchPurchaseInvoicesByPurchaseInvoiceId: (req, res) => {
      const { purchase_invoice_id } = req.query;
      let sql;
      let params = [];

      if (purchase_invoice_id && purchase_invoice_id.trim() !== "") {
        sql = `
            SELECT * FROM purchase_invoice_details 
            WHERE purchase_invoice_id LIKE ?
            `;
        params = [`%${purchase_invoice_id}%`];
      } else {
        sql = `SELECT * FROM purchase_invoice_details`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    },
  };
};
