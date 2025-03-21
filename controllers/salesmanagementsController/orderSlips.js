module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
              CREATE TABLE IF NOT EXISTS order_slips (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  code VARCHAR(255) DEFAULT NULL,
                  order_id VARCHAR(255) NOT NULL,
                  order_date DATE DEFAULT NULL,
                  delivery_date DATE DEFAULT NULL,
                  vender_id VARCHAR(255) DEFAULT NULL,
                  vender_name VARCHAR(255) DEFAULT NULL,
                  honorific VARCHAR(255) DEFAULT NULL,
                  vender_contact_person VARCHAR(255) DEFAULT NULL,
                  estimation_slip_id VARCHAR(255) DEFAULT NULL,
                  estimation_id VARCHAR(255) DEFAULT NULL,
                  remarks VARCHAR(255) DEFAULT NULL,
                  closing_date DATE DEFAULT NULL,
                  deposit_due_date DATE DEFAULT NULL,
                  deposit_method VARCHAR(255) DEFAULT NULL,
                  status VARCHAR(255) DEFAULT '未売上',  -- Default value set to '未売上'
                  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating orderSlips table:", err.message);
          return res.status(500).send("Error initializing orderSlips table.");
        }
        res.send("OrderSlips table initialized successfully.");
      });
    },

    // Load Order Slips
    loadOrderSlips: (req, res) => {
      const pageSize = 10;
      const page = req.query.page;
      const offset = page;
      const sql =
        page === undefined
          ? `SELECT * FROM order_slips`
          : `SELECT * FROM order_slips LIMIT ? OFFSET ?`;

      if (page === undefined) {
        db.all(sql, (err, rows) => {
          if (err) {
            return res.status(500).send(err.message);
          }
          res.json(rows);
        });
      } else {
        db.all(sql, [pageSize, offset], (err, rows) => {
          if (err) {
            return res.status(500).send(err.message);
          }
          res.json(rows);
        });
      }
    },

    // Get Order Slip by ID
    getOrderSlipById: (req, res) => {
      const id = req.params.id;
      const sql = `SELECT * FROM order_slips LEFT JOIN vendors v ON v.id = order_slips.vender_id WHERE order_slips.id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(row);
      });
    },

    // Save Order Slip (Insert/Update)
    saveOrderSlip: (req, res) => {
      const {
        id,
        code,
        order_id,
        order_date,
        delivery_date,
        vender_id,
        vender_name,
        honorific,
        vender_contact_person,
        estimation_slip_id,
        estimation_id,
        remarks,
        closing_date,
        deposit_due_date,
        deposit_method,
      } = req.body;

      if (id) {
        db.run(
          `UPDATE order_slips SET 
                  code = ?,
                  order_id = ?, 
                  order_date = ?, 
                  delivery_date = ?, 
                  vender_id = ?, 
                  vender_name = ?, 
                  honorific = ?, 
                  vender_contact_person = ?, 
                  estimation_slip_id = ?, 
                  estimation_id = ?, 
                  remarks = ?, 
                  closing_date = ?, 
                  deposit_due_date = ?, 
                  deposit_method = ?, 
                  updated = datetime('now') 
              WHERE id = ?`,
          [
            code,
            order_id,
            order_date,
            delivery_date,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            estimation_slip_id,
            estimation_id,
            remarks,
            closing_date,
            deposit_due_date,
            deposit_method,
            id,
          ],
          function (err) {
            if (err) {
              return res.status(500).send(err.message);
            }
            res.json({
              message: "Order slip updated successfully",
              lastID: id,
            });
          }
        );
      } else {
        db.run(
          `INSERT INTO order_slips 
                  (code, order_id, order_date, delivery_date, vender_id, vender_name, honorific, vender_contact_person, estimation_slip_id, estimation_id, remarks, closing_date, deposit_due_date, deposit_method, created, updated) 
                  VALUES 
                  (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            code,
            order_id,
            order_date,
            delivery_date,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            estimation_slip_id,
            estimation_id,
            remarks,
            closing_date,
            deposit_due_date,
            deposit_method,
          ],
          function (err) {
            if (err) {
              return res.status(500).send(err.message);
            }
            res.json({
              message: "Order slip created successfully",
              lastID: this.lastID,
            });
          }
        );
      }
    },

    // Delete Order Slip by ID
    deleteOrderSlipById: (req, res) => {
      const id = req.params.id;
      const sql = `DELETE FROM order_slips WHERE id = ?`;
      db.run(sql, [id], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ message: "Order slip deleted successfully" });
      });
    },

    // Search Order Slips
    searchOrderSlips: (req, res) => {
      const { vender_name, order_id, vender_contact_person } = req.query;
      let sql;
      let params = [];

      if ((vender_name || order_id || vender_contact_person).trim() !== "") {
        sql = `
              SELECT * FROM order_slips 
              WHERE vender_name LIKE ? OR order_id LIKE ? OR vender_contact_person LIKE ?
          `;
        params = Array(3).fill(`%${query}%`);
      } else {
        sql = `SELECT * FROM order_slips`;
      }
      db.all(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Search Order Slips on PV
    searchOrderSlipsOnPV: (req, res) => {
      const { conditions } = req.body;
      const id = req.params.id;
      let sql = `SELECT * FROM order_slips WHERE status='未売上'`;
      let params = [];

      if (id) {
        sql += ` AND vender_id = ?`;
        params.push(id);
      }
      if (conditions.os_start_date) {
        sql += ` AND order_date >= ?`;
        params.push(conditions.os_start_date);
      }
      if (conditions.os_end_date) {
        sql += ` AND order_date <= ?`;
        params.push(conditions.os_end_date);
      }
      if (conditions.os_code) {
        sql += ` AND code LIKE ?`;
        params.push(`%${conditions.os_code}%`);
      }
      if (conditions.os_name) {
        sql += ` AND vender_name LIKE ?`;
        params.push(`%${conditions.os_name}%`);
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Update Order Slip Status
    updateOrderSlipStatus: (req, res) => {
      const sql = `UPDATE order_slips SET status = ?, updated = datetime('now') WHERE code = ?`;
      db.run(sql, [req.body.status, req.body.code], function (err) {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ code: req.body.code });
      });
    },
  };
};
