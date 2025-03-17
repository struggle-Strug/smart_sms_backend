module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS payment_vouchers (
                id INT AUTO_INCREMENT PRIMARY KEY, -- MySQL equivalent for AUTOINCREMENT
                code VARCHAR(255),
                order_date VARCHAR(255),
                vender_id VARCHAR(255),
                vender_name VARCHAR(255),
                honorific VARCHAR(255),
                vender_contact_person VARCHAR(255),
                contact_person VARCHAR(255),
                purchase_voucher_id VARCHAR(255),
                remarks VARCHAR(255),
                created DATE DEFAULT CURRENT_DATE,  -- Current date as default for created
                updated DATE DEFAULT CURRENT_DATE   -- Current date as default for updated
            );
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating paymentVouchers table:", err.message);
          return res
            .status(500)
            .send("Error initializing paymentVouchers table.");
        }
        res.send("PaymentVouchers table initialized successfully.");
      });
    },

    // Load Payment Vouchers with pagination
    loadPaymentVouchers: (req, res) => {
      const page = req.query.page;
      const pageSize = 10;
      const offset = page;

      const sql = (page = undefined
        ? `SELECT * FROM payment_vouchers`
        : `SELECT * FROM payment_vouchers LIMIT ? OFFSET ?`);
      page === undefined
        ? db.query(sql, (err, rows) => {
            if (err) {
              console.error("Error loading payment vouchers:", err.message);
              return res.status(500).send("Error loading payment vouchers.");
            }
            res.json(rows);
          })
        : db.query(sql, [pageSize, offset], (err, rows) => {
            if (err) {
              console.error("Error loading payment vouchers:", err.message);
              return res.status(500).send("Error loading payment vouchers.");
            }
            res.json(rows);
          });
    },

    // Get Payment Voucher by ID
    getPaymentVoucherById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM payment_vouchers WHERE id = ?`;

      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving payment voucher:", err.message);
          return res.status(500).send("Error retrieving payment voucher.");
        }
        if (!row) {
          return res.status(404).send("Payment voucher not found.");
        }
        res.json(row);
      });
    },

    // Save or Update Payment Voucher
    savePaymentVoucher: (req, res) => {
      const {
        id,
        code,
        order_date,
        vender_id,
        vender_name,
        honorific,
        vender_contact_person,
        contact_person,
        purchase_voucher_id,
        remarks,
      } = req.body;

      if (id) {
        const sql = `UPDATE payment_vouchers SET 
                      code = ?,
                      order_date = ?,
                      vender_id = ?,
                      vender_name = ?,
                      honorific = ?,
                      vender_contact_person = ?,
                      contact_person = ?,
                      purchase_voucher_id = ?,
                      remarks = ?,
                      updated = NOW()
                    WHERE id = ?`;

        db.query(
          sql,
          [
            code,
            order_date,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            contact_person,
            purchase_voucher_id,
            remarks,
            id,
          ],
          (err) => {
            if (err) {
              console.error("Error updating payment voucher:", err.message);
              return res.status(500).send("Error updating payment voucher.");
            }
            res.json({ lastID: id });
          }
        );
      } else {
        const sql = `INSERT INTO payment_vouchers 
                      (code, order_date, vender_id, vender_name, honorific, vender_contact_person, contact_person, purchase_voucher_id, remarks, created, updated) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

        db.query(
          sql,
          [
            code,
            order_date,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            contact_person,
            purchase_voucher_id,
            remarks,
          ],
          (err, result) => {
            if (err) {
              console.error("Error inserting payment voucher:", err.message);
              return res.status(500).send("Error inserting payment voucher.");
            }
            res.json({ lastID: result.insertId });
          }
        );
      }
    },

    // Delete Payment Voucher by ID
    deletePaymentVoucherById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM payment_vouchers WHERE id = ?`;

      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting payment voucher:", err.message);
          return res.status(500).send("Error deleting payment voucher.");
        }
      });
    },

    // Edit Payment Voucher by ID
    editPaymentVoucher: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM payment_vouchers WHERE id = ?`;

      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error editing payment voucher:", err.message);
          return res.status(500).send("Error editing payment voucher.");
        }
        if (!row) {
          return res.status(404).send("Payment voucher not found.");
        }
        res.json(row);
      });
    },

    // Search PaymentVouchers
    searchPaymentVouchers: (req, res) => {
      const { code, vender_name } = req.query; // Assuming the search query is passed as a URL query parameter (e.g., ?query=example)

      let sql;
      let params = [];

      // If a query is provided, search using LIKE for the relevant columns
      if ((code || vender_name).trim() !== "") {
        sql = `
            SELECT * FROM payment_vouchers 
            WHERE code LIKE ? 
            OR vender_name LIKE ? 
          `;
        params = [
          code || "%", // Fallback to '%' if the query is not provided
          vender_name || "%",
        ];
      } else {
        sql = `SELECT * FROM payment_vouchers`; // Return all inventories if no query is provided
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching payment_vouchers:", err.message);
          return res.status(500).send("Error searching payment_vouchers.");
        }

        res.json(rows); // Return the results as JSON
      });
    },
  };
};
