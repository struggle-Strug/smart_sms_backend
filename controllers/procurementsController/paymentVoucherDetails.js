module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS payment_voucher_details (
                id INT AUTO_INCREMENT PRIMARY KEY, -- MySQL equivalent for AUTOINCREMENT
                payment_voucher_id INT,            -- Foreign key to payment_vouchers (if applicable)
                payment_method INT,
                payment_price INT,
                fees_and_charges VARCHAR(255),
                created DATE DEFAULT CURRENT_DATE,  -- Current date as default for created
                updated DATE DEFAULT CURRENT_DATE   -- Current date as default for updated
            );
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error(
            "Error creating paymentVoucherDetails table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing paymentVoucherDetails table.");
        }
        res.send("PaymentVoucherDetails table initialized successfully.");
      });
    },

    // Load payment voucher details (MySQL version)
    loadPaymentVoucherDetails: (req, res) => {
      const sql = `
          SELECT pvd.*, v.*, pv.*, 
                v.payment_method AS vendor_payment_method, 
                pvd.payment_method AS detail_payment_method
          FROM payment_voucher_details pvd
          LEFT JOIN payment_vouchers pv ON pvd.payment_voucher_id = pv.id
          LEFT JOIN vendors v ON pv.vender_id = v.id
        `;

      db.query(sql, (err, results) => {
        if (err) {
          console.error("Error fetching payment voucher details:", err.message);
          return res
            .status(500)
            .send("Error fetching payment voucher details.");
        }
        res.json(results);
      });
    },

    // Get payment voucher detail by ID (MySQL version)
    getPaymentVoucherDetailById: (req, res) => {
      const { id } = req.params;

      const sql = `SELECT * FROM payment_voucher_details WHERE id = ?`;

      db.query(sql, [id], (err, results) => {
        if (err) {
          console.error("Error fetching payment voucher detail:", err.message);
          return res.status(500).send("Error fetching payment voucher detail.");
        }
        res.json(results.length > 0 ? results[0] : null);
      });
    },

    // Save or update payment voucher detail (MySQL version)
    savePaymentVoucherDetail: (req, res) => {
      const {
        id,
        payment_voucher_id,
        payment_method,
        payment_price,
        fees_and_charges,
      } = req.body;

      if (id) {
        // Check if the record exists
        const checkSql = `SELECT id FROM payment_voucher_details WHERE id = ?`;
        db.query(checkSql, [id], (err, results) => {
          if (err) {
            console.error(
              "Error checking payment voucher detail:",
              err.message
            );
            return res
              .status(500)
              .send("Error checking payment voucher detail.");
          }

          if (results.length > 0) {
            // If the record exists, update it
            const updateSql = `
                UPDATE payment_voucher_details SET 
                  payment_voucher_id = ?, 
                  payment_method = ?, 
                  payment_price = ?, 
                  fees_and_charges = ?, 
                  updated = NOW()
                WHERE id = ?`;

            db.query(
              updateSql,
              [
                payment_voucher_id,
                payment_method,
                payment_price,
                fees_and_charges,
                id,
              ],
              (updateErr) => {
                if (updateErr) {
                  console.error(
                    "Error updating payment voucher detail:",
                    updateErr.message
                  );
                  return res
                    .status(500)
                    .send("Error updating payment voucher detail.");
                }
                res.send("Payment voucher detail updated successfully.");
              }
            );
          } else {
            // If the record does not exist, insert a new one
            const insertSql = `
                INSERT INTO payment_voucher_details 
                  (payment_voucher_id, payment_method, payment_price, fees_and_charges, created, updated) 
                VALUES (?, ?, ?, ?, NOW(), NOW())`;

            db.query(
              insertSql,
              [
                payment_voucher_id,
                payment_method,
                payment_price,
                fees_and_charges,
              ],
              (insertErr, result) => {
                if (insertErr) {
                  console.error(
                    "Error inserting payment voucher detail:",
                    insertErr.message
                  );
                  return res
                    .status(500)
                    .send("Error inserting payment voucher detail.");
                }
                res.json({
                  id: result.insertId,
                  message: "Payment voucher detail inserted successfully.",
                });
              }
            );
          }
        });
      } else {
        // If no ID is provided, insert a new record
        const insertSql = `
            INSERT INTO payment_voucher_details 
              (payment_voucher_id, payment_method, payment_price, fees_and_charges, created, updated) 
            VALUES (?, ?, ?, ?, NOW(), NOW())`;

        db.query(
          insertSql,
          [payment_voucher_id, payment_method, payment_price, fees_and_charges],
          (insertErr, result) => {
            if (insertErr) {
              console.error(
                "Error inserting payment voucher detail:",
                insertErr.message
              );
              return res
                .status(500)
                .send("Error inserting payment voucher detail.");
            }
            res.json({
              id: result.insertId,
              message: "Payment voucher detail inserted successfully.",
            });
          }
        );
      }
    },

    // Delete payment voucher detail by ID (MySQL version)
    deletePaymentVoucherDetailById: (req, res) => {
      const { id } = req.params;

      if (!id) {
        return res.status(400).send("ID is required.");
      }

      const sql = `DELETE FROM payment_voucher_details WHERE id = ?`;

      db.query(sql, [id], (err, result) => {
        if (err) {
          console.error("Error deleting payment voucher detail:", err.message);
          return res.status(500).send("Error deleting payment voucher detail.");
        }

        if (result.affectedRows === 0) {
          return res.status(404).send("Payment voucher detail not found.");
        }

        res.send("Payment voucher detail deleted successfully.");
      });
    },

    // Search payment voucher details with dynamic filtering (MySQL version)
    searchPaymentVoucherDetails: (req, res) => {
      let sql = `
            SELECT pvd.*, pv.*, v.*, 
                  v.payment_method AS vendor_payment_method, 
                  pvd.payment_method AS detail_payment_method
            FROM payment_voucher_details pvd
            LEFT JOIN payment_vouchers pv ON pvd.payment_voucher_id = pv.id
            LEFT JOIN vendors v ON pv.vender_id = v.id
        `;

      let whereClauses = [];
      let params = [];

      const { conditions } = req.body; // Assuming conditions are passed as query parameters

      // Build WHERE clause dynamically based on provided conditions
      if (conditions && Object.keys(conditions).length > 0) {
        for (const [column, value] of Object.entries(conditions)) {
          if (column === "pvd.created_start") {
            whereClauses.push(`pvd.created >= ?`);
            params.push(value);
          } else if (column === "pvd.created_end") {
            whereClauses.push(`pvd.created <= ?`);
            params.push(value);
          } else {
            whereClauses.push(`${column} LIKE ?`);
            params.push(`%${value}%`);
          }
        }
      }

      // Add WHERE clause if there are conditions
      if (whereClauses.length > 0) {
        sql += ` WHERE ` + whereClauses.join(" AND ");
      }

      db.query(sql, params, (err, results) => {
        if (err) {
          console.error(
            "Error searching payment voucher details:",
            err.message
          );
          return res
            .status(500)
            .send("Error searching payment voucher details.");
        }
        res.json(results);
      });
    },

    // Search payment vouchers by payment_voucher_id (MySQL version)
    searchPaymentVouchersByPaymentVoucherId: (req, res) => {
      const { id } = req.query; // Assuming the query is passed as a query parameter, e.g., ?name=example
      let sql;
      let params = [];

      if (query.trim() !== "") {
        sql = `
              SELECT * FROM payment_voucher_details LEFT JOIN payment_methods pm ON payment_voucher_details.payment_method = pm.code
              WHERE payment_voucher_details.payment_voucher_id LIKE ?
              `;
        params = [id];
      } else {
        sql = `SELECT * FROM payment_voucher_details`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error(
            "Error searching PaymentVouchersByPaymentVoucherId:",
            err.message
          );
          return res
            .status(500)
            .send("Error searching PaymentVouchersByPaymentVoucherId.");
        }
        res.json(rows);
      });
    },
  };
};
