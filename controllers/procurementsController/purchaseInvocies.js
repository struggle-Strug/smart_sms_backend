module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS purchase_invoices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(255),
          order_date VARCHAR(255),
          vender_id VARCHAR(255),
          vender_name VARCHAR(255),
          honorific VARCHAR(255),
          vender_contact_person VARCHAR(255),
          contact_person VARCHAR(255),
          purchase_order_id VARCHAR(255),
          remarks VARCHAR(255),
          closing_date VARCHAR(255),
          payment_due_date VARCHAR(255),
          payment_method VARCHAR(255),
          status VARCHAR(255) DEFAULT '未処理',
          created DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating purchaseInvoices table:", err.message);
          return res
            .status(500)
            .send("Error initializing purchaseInvoices table.");
        }
        res.send("PurchaseInvoices table initialized successfully.");
      });
    },

    // Load Purchase Invoices
    loadPurchaseInvoices: (req, res) => {
      const pageSize = 10;
      const page = (req.query.page === '0' || req.query.page === "undefined") ? 1 : parseInt(req.query.page);
      const offset = (page - 1) * pageSize;
      const sql =`SELECT * FROM purchase_invoices LIMIT ? OFFSET ?`;
      const queryParams = [pageSize, offset];

      db.query(sql, queryParams, (err, rows) => {
        if (err) {
          console.error("Error loading purchase invoices:", err.message);
          return res.status(500).send("Error loading purchase invoices.");
        }
        res.json(rows);
      });
    },

    // Get Purchase Invoice by ID
    getPurchaseInvoiceById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM purchase_invoices WHERE id = ?`;

      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving purchase invoice:", err.message);
          return res.status(500).send("Error retrieving purchase invoice.");
        }
        res.json(row[0]);
      });
    },

    // Save Purchase Invoice
    savePurchaseInvoice: (req, res) => {
      const invoiceData = req.body;
      const {
        id,
        code,
        order_date,
        vender_id,
        vender_name,
        honorific,
        vender_contact_person,
        contact_person,
        purchase_order_id,
        remarks,
        closing_date,
        payment_due_date,
        payment_method,
      } = invoiceData;

      if (id) {
        db.query(
          `UPDATE purchase_invoices SET 
                    code = ?, 
                    order_date = ?, 
                    vender_id = ?, 
                    vender_name = ?, 
                    honorific = ?, 
                    vender_contact_person = ?, 
                    contact_person = ?, 
                    purchase_order_id = ?, 
                    remarks = ?, 
                    closing_date = ?, 
                    payment_due_date = ?, 
                    payment_method = ?, 
                    updated = CURRENT_TIMESTAMP 
                WHERE id = ?`,
          [
            code,
            order_date,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            contact_person,
            purchase_order_id,
            remarks,
            closing_date,
            payment_due_date,
            payment_method,
            id,
          ],
          (err) => {
            if (err) {
              console.error("Error updating purchase invoice:", err.message);
              return res.status(500).send("Error updating purchase invoice.");
            }
            res.json({ id: id });
          }
        );
      } else {
        db.query(
          `INSERT INTO purchase_invoices 
                (code, order_date, vender_id, vender_name, honorific, vender_contact_person, contact_person, purchase_order_id, remarks, closing_date, payment_due_date, payment_method, created, updated) 
                VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            code,
            order_date,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            contact_person,
            purchase_order_id,
            remarks,
            closing_date,
            payment_due_date,
            payment_method,
          ],
          (err, result) => {
            if (err) {
              console.error("Error inserting purchase invoice:", err.message);
              return res.status(500).send("Error inserting purchase invoice.");
            }
            res.json({ id: result.insertId });
          }
        );
      }
    },

    // Delete Purchase Invoice by ID
    deletePurchaseInvoiceById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM purchase_invoices WHERE id = ?`;

      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting purchase invoice:", err.message);
          return res.status(500).send("Error deleting purchase invoice.");
        }
        res.send("Purchase invoice deleted successfully.");
      });
    },

    // Update Purchase Invoice Status
    updatePurchaseInvoiceStatus: (req, res) => {
      const { id, status } = req.body;
      const sql = `UPDATE purchase_invoices SET status = ?, updated = CURRENT_TIMESTAMP WHERE id = ?`;

      db.query(sql, [status, id], (err) => {
        if (err) {
          console.error("Error updating purchase invoice status:", err.message);
          return res
            .status(500)
            .send("Error updating purchase invoice status.");
        }
        res.json({ id: id });
      });
    },

    // Search Purchase Invoices
    searchPurchaseInvoices: (req, res) => {
      const { code, vender_name } = req.query;
      let sql;
      let params = [];

      if ((code || vender_name).trim() !== "") {
        sql = `
            SELECT * FROM purchase_invoices 
            WHERE code LIKE ? 
            OR vender_name LIKE ?`;
        params = [
          code || "%", // Fallback to '%' if the query is not provided
          vender_name || "%",
        ];
      } else {
        sql = `SELECT * FROM purchase_invoices`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching purchase invoices:", err.message);
          return res.status(500).send("Error searching purchase invoices.");
        }
        res.json(rows);
      });
    },
  };
};
