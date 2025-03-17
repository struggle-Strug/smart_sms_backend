module.exports = (db) => {
  return {
    // Initialize the invoices table
    init: (req, res) => {
      const sql = `
              CREATE TABLE IF NOT EXISTS invoices (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  billing_date VARCHAR(255) DEFAULT NULL,
                  customer_id INT DEFAULT NULL,
                  total_price INT DEFAULT NULL,
                  status INT DEFAULT NULL,
                  invoice_number VARCHAR(255) DEFAULT NULL,
                  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating invoices table:", err.message);
          return res.status(500).send("Error initializing invoices table.");
        }
        res.send("Invoices table initialized successfully.");
      });
    },

    // Load all invoices with customer details
    loadInvoices: (req, res) => {
      const sql = `
              SELECT iv.*, c.*, iv.id AS invoice_id, iv.created AS invoice_created
              FROM invoices iv 
              LEFT JOIN customers c ON iv.customer_id = c.id
          `;

      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading invoices:", err.message);
          return res.status(500).send("Error loading invoices.");
        }
        res.json(rows);
      });
    },

    // Get Invoice by ID
    getInvoiceById: (req, res) => {
      const id = req.params.id;
      db.get("SELECT * FROM invoices WHERE id = ?", [id], (err, row) => {
        if (err) {
          console.error("Error retrieving invoice:", err.message);
          return res.status(500).send("Error retrieving invoice.");
        }
        res.json(row);
      });
    },

    // Save Invoice (Insert/Update)
    saveInvoice: (req, res) => {
      const {
        id,
        billing_date,
        customer_id,
        total_price,
        status,
        invoice_number,
      } = req.body;

      if (id) {
        db.run(
          `
                  UPDATE invoices 
                  SET 
                      billing_date = ?, 
                      customer_id = ?, 
                      total_price = ?, 
                      status = ?, 
                      invoice_number = ?, 
                      updated = datetime('now') 
                  WHERE id = ?
              `,
          [billing_date, customer_id, total_price, status, invoice_number, id],
          function (err) {
            if (err) {
              return res.status(500).send(err.message);
            }
            res.json({ message: "Invoice updated successfully", lastID: id });
          }
        );
      } else {
        db.run(
          `
                  INSERT INTO invoices (billing_date, customer_id, total_price, status, invoice_number, created, updated) 
                  VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
              `,
          [billing_date, customer_id, total_price, status, invoice_number],
          function (err) {
            if (err) {
              return res.status(500).send(err.message);
            }
            res.json({
              message: "Invoice created successfully",
              lastID: this.lastID,
            });
          }
        );
      }
    },

    // Delete Invoice by ID
    deleteInvoiceById: (req, res) => {
      const id = req.params.id;
      db.run("DELETE FROM invoices WHERE id = ?", [id], function (err) {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ message: "Invoice deleted successfully" });
      });
    },

    // Search Invoices
    searchInvoices: (req, res) => {
      const { name_primary, invoice_number } = req.query.q;
      let sql;
      let params = [];

      if ((name_primary || invoice_number).trim() !== "") {
        sql = `
              SELECT iv.*, c.*, iv.id AS invoice_id 
              FROM invoices iv 
              LEFT JOIN customers c ON iv.customer_id = c.id
              WHERE c.name_primary LIKE ? OR iv.invoice_number LIKE ?
          `;
        params = [`%${name_primary}%`, `%${invoice_number}%`];
      } else {
        sql = `
              SELECT iv.*, c.*, iv.id AS invoice_id 
              FROM invoices iv 
              LEFT JOIN customers c ON iv.customer_id = c.id
          `;
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching invoices:", err.message);
          return res.status(500).send("Error searching invoices.");
        }
        res.json(rows);
      });
    },

    // Count Invoices for Today
    countInvoicesForToday: (req, res) => {
      const today = new Date().toISOString().split("T")[0]; // Today's date (YYYY-MM-DD)
      const sql = `SELECT COUNT(*) AS count FROM invoices WHERE created = ?`;

      db.get(sql, [today], (err, row) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ count: row.count });
      });
    },

    // Get Invoices by Total Price Range
    getInvoicesByTotalPriceRange: (req, res) => {
      const { totalPrice } = req.query;
      const minPrice = totalPrice - 1000;
      const maxPrice = totalPrice + 1000;

      const sql = `
          SELECT iv.*, c.*, iv.id AS invoice_id, iv.created AS invoice_created
          FROM invoices iv 
          LEFT JOIN customers c ON iv.customer_id = c.id
          WHERE iv.total_price BETWEEN ? AND ?
      `;

      db.all(sql, [minPrice, maxPrice], (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Update Invoice Status
    updateInvoiceStatus: (req, res) => {
      const id = req.params.id;
      db.run(
        `
              UPDATE invoices 
              SET 
                  status = 1, 
                  updated = datetime('now')
              WHERE id = ?
          `,
        [id],
        (err) => {
          if (err) {
            console.error(
              `Failed to update status for invoice with id ${id}:`,
              err
            );
            return res.status(500).send("Error updating invoice status.");
          }
          res.json({ message: "Invoice status updated successfully" });
        }
      );
    },
  };
};
