module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
              CREATE TABLE IF NOT EXISTS sales_slips (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  code VARCHAR(255) DEFAULT NULL,
                  sales_date DATE NOT NULL,
                  delivery_due_date DATE DEFAULT NULL,
                  vender_id VARCHAR(255) DEFAULT NULL,
                  vender_name VARCHAR(255) DEFAULT NULL,
                  honorific VARCHAR(255) DEFAULT NULL,
                  vender_contact_person VARCHAR(255) DEFAULT NULL,
                  order_slip_id VARCHAR(255) DEFAULT NULL,
                  order_id VARCHAR(255) DEFAULT NULL,
                  remarks VARCHAR(255) DEFAULT NULL,
                  closing_date DATE DEFAULT NULL,
                  deposit_due_date DATE DEFAULT NULL,
                  deposit_method VARCHAR(255) DEFAULT NULL,
                  status VARCHAR(255) DEFAULT '未請求',
                  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating salesSlips table:", err.message);
          return res.status(500).send("Error initializing salesSlips table.");
        }
        res.send("SalesSlips table initialized successfully.");
      });
    },

    // Load Sales Slips
    loadSalesSlips: (req, res) => {
      const pageSize = 10;
      const page = req.query.page;
      const offset = page;

      const sql =
        page === undefined
          ? `SELECT * FROM sales_slips`
          : `SELECT * FROM sales_slips LIMIT ? OFFSET ?`;

      const params = page === undefined ? [] : [pageSize, offset];

      db.query(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Get Sales Slip by ID
    getSalesSlipById: (req, res) => {
      const id = req.params.id;
      const sql = `SELECT * FROM sales_slips LEFT JOIN vendors v ON v.id = sales_slips.vender_id WHERE sales_slips.id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(row);
      });
    },

    // Save Sales Slip
    saveSalesSlip: (req, res) => {
      const salesSlipData = req.body;
      const {
        id,
        code,
        sales_date,
        delivery_due_date,
        vender_id,
        vender_name,
        honorific,
        vender_contact_person,
        order_slip_id,
        order_id,
        remarks,
        closing_date,
        deposit_due_date,
        deposit_method,
      } = salesSlipData;

      if (id) {
        db.query(
          `UPDATE sales_slips SET 
                  code = ?,
                  sales_date = ?, 
                  delivery_due_date = ?, 
                  vender_id = ?, 
                  vender_name = ?, 
                  honorific = ?, 
                  vender_contact_person = ?, 
                  order_slip_id = ?, 
                  order_id = ?, 
                  remarks = ?, 
                  closing_date = ?, 
                  deposit_due_date = ?, 
                  deposit_method = ?, 
                  updated = CURRENT_TIMESTAMP 
              WHERE id = ?`,
          [
            code,
            sales_date,
            delivery_due_date,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            order_slip_id,
            order_id,
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
            res.json({ lastID: id });
          }
        );
      } else {
        db.query(
          `INSERT INTO sales_slips 
                  (code, sales_date, delivery_due_date, vender_id, vender_name, honorific, vender_contact_person, order_slip_id, order_id, remarks, closing_date, deposit_due_date, deposit_method, created, updated) 
                  VALUES 
                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            code,
            sales_date,
            delivery_due_date,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            order_slip_id,
            order_id,
            remarks,
            closing_date,
            deposit_due_date,
            deposit_method,
          ],
          function (err) {
            if (err) {
              return res.status(500).send(err.message);
            }
            res.json({ lastID: this.lastID });
          }
        );
      }
    },

    // Delete Sales Slip by ID
    deleteSalesSlipById: (req, res) => {
      const id = req.params.id;
      const sql = `DELETE FROM sales_slips WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ message: "Sales slip deleted successfully." });
      });
    },

    // Search Sales Slips
    searchSalesSlips: (req, res) => {
      const { code, vender_name, vender_id } = req.query;
      let sql;
      let params = [];

      if ((code || vender_id || vender_name).trim() !== "") {
        sql = `
              SELECT * FROM sales_slips 
              WHERE code LIKE ?
              OR vender_name LIKE ? 
              OR vender_id LIKE ?
          `;
        params = Array(3).fill(`%${query}%`);
      } else {
        sql = `SELECT * FROM sales_slips`;
      }
      db.query(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },
  };
};
