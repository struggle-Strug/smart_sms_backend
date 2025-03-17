module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS stock_in_out_slips (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(255),
                stock_in_out_date VARCHAR(255),
                processType VARCHAR(255),
                warehouse_from VARCHAR(255),
                warehouse_to VARCHAR(255),
                contact_person VARCHAR(255),
                remarks VARCHAR(255),
                created DATE DEFAULT CURRENT_DATE,
                updated DATE DEFAULT CURRENT_DATE
            );
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating stockInOutSlips table:", err.message);
          return res
            .status(500)
            .send("Error initializing stockInOutSlips table.");
        }
        res.send("StockInOutSlips table initialized successfully.");
      });
    },

    // Load Stock In Out Slips
    loadStockInOutSlips: (req, res) => {
      const page = req.query.page;
      const pageSize = 10;
      const offset = page;

      const sql =
        page !== undefined
          ? `SELECT * FROM stock_in_out_slips LIMIT ? OFFSET ?`
          : `SELECT * FROM stock_in_out_slips`;

      const params = page !== undefined ? [pageSize, offset] : [];

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error loading stock in out slips:", err.message);
          return res.status(500).send("Error loading stock in out slips.");
        }
        res.json(rows);
      });
    },

    // Get Stock In Out Slip by ID
    getStockInOutSlipById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM stock_in_out_slips WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving stock in out slip:", err.message);
          return res.status(500).send("Error retrieving stock in out slip.");
        }
        res.json(row);
      });
    },

    // Save Stock In Out Slip
    saveStockInOutSlip: (req, res) => {
      const {
        id,
        code,
        stock_in_out_date,
        processType,
        warehouse_from,
        warehouse_to,
        contact_person,
        remarks,
      } = req.body;

      if (id) {
        db.query(
          `UPDATE stock_in_out_slips SET 
                    code = ?,
                    stock_in_out_date = ?, 
                    processType = ?, 
                    warehouse_from = ?, 
                    warehouse_to = ?, 
                    contact_person = ?, 
                    remarks = ?, 
                    updated = NOW() 
                WHERE id = ?`,
          [
            code,
            stock_in_out_date,
            processType,
            warehouse_from,
            warehouse_to,
            contact_person,
            remarks,
            id,
          ],
          (err) => {
            if (err) {
              console.error("Error updating stock in out slip:", err.message);
              return res.status(500).send("Error updating stock in out slip.");
            }
            res.send({ lastID: id });
          }
        );
      } else {
        db.query(
          `INSERT INTO stock_in_out_slips 
                (code, stock_in_out_date, processType, warehouse_from, warehouse_to, contact_person, remarks, created, updated) 
                VALUES 
                (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            code,
            stock_in_out_date,
            processType,
            warehouse_from,
            warehouse_to,
            contact_person,
            remarks,
          ],
          function (err) {
            if (err) {
              console.error("Error inserting stock in out slip:", err.message);
              return res.status(500).send("Error inserting stock in out slip.");
            }
            res.send({ lastID: this.insertId });
          }
        );
      }
    },

    // Delete Stock In Out Slip by ID
    deleteStockInOutSlipById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM stock_in_out_slips WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting stock in out slip:", err.message);
          return res.status(500).send("Error deleting stock in out slip.");
        }
        res.send({ success: true });
      });
    },

    // Search Stock In Out Slips
    searchStockInOutSlips: (req, res) => {
      const { code, warehouse_from, warehouse_to } = req.query;
      let sql;
      let params = [];

      if ((code || warehouse_from || warehouse_to).trim() !== "") {
        sql = `
            SELECT * FROM stock_in_out_slips 
            WHERE code LIKE ? 
            OR warehouse_from LIKE ? 
            OR warehouse_to LIKE ? 
            `;
        params = Array(3).fill(`%${query}%`);
      } else {
        sql = `SELECT * FROM stock_in_out_slips`;
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching stock in out slips:", err.message);
          return res.status(500).send("Error searching stock in out slips.");
        }
        res.json(rows);
      });
    },
  };
};
