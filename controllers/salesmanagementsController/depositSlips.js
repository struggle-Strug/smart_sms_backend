module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS deposit_slips (
              id INT AUTO_INCREMENT PRIMARY KEY,
              code VARCHAR(255) DEFAULT NULL,
              remarks VARCHAR(255) DEFAULT NULL,
              status VARCHAR(255) DEFAULT NULL,
              deposit_date DATE DEFAULT NULL,
              vender_id VARCHAR(255) DEFAULT NULL,
              vender_name VARCHAR(255) DEFAULT NULL,
              created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating depositSlips table:", err.message);
          return res.status(500).send("Error initializing depositSlips table.");
        }
        res.send("DepositSlips table initialized successfully.");
      });
    },

    // Load Deposit Slips
    loadDepositSlips: (req, res) => {
      const pageSize = 10;
      const { page } = req.query;
      const offset = page;
      const sql =
        page === undefined
          ? `SELECT 
                deposit_slip_details.*, 
                deposit_slip_details.vender_id AS dsd_vender_id, 
                deposit_slip_details.vender_name AS dsd_vender_name, 
                deposit_slips.*
             FROM deposit_slip_details 
             LEFT JOIN deposit_slips ON deposit_slips.id = deposit_slip_details.deposit_slip_id`
          : `SELECT 
                deposit_slip_details.*, 
                deposit_slip_details.vender_id AS dsd_vender_id, 
                deposit_slip_details.vender_name AS dsd_vender_name, 
                deposit_slips.* 
             FROM deposit_slip_details 
             LEFT JOIN deposit_slips ON deposit_slips.id = deposit_slip_details.deposit_slip_id 
             LIMIT ? OFFSET ?`;

      page === undefined
        ? db.all(sql, (err, rows) => {
            if (err) {
              console.error("Error loading deposit slips:", err.message);
              return res.status(500).send("Error loading deposit slips.");
            }
            res.json(rows);
          })
        : db.all(sql, [pageSize, offset], (err, rows) => {
            if (err) {
              console.error(
                "Error loading deposit slips with pagination:",
                err.message
              );
              return res
                .status(500)
                .send("Error loading deposit slips with pagination.");
            }
            res.json(rows);
          });
    },

    // Get Deposit Slip by ID
    getDepositSlipById: (req, res) => {
      const { id } = req.params;
      const sql = "SELECT * FROM deposit_slips WHERE id = ?";
      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving deposit slip:", err.message);
          return res.status(500).send("Error retrieving deposit slip.");
        }
        res.json(row);
      });
    },

    // Save Deposit Slip
    saveDepositSlip: (req, res) => {
      const depositSlipData = req.body;
      console.log("Received Data:", depositSlipData);
      const {
        id,
        code,
        deposit_date,
        status,
        vender_name,
        vender_id,
        remarks,
      } = depositSlipData;

      if (id) {
        db.run(
          `UPDATE deposit_slips SET 
                    code = ?,
                    deposit_date = ?,
                    status = ?,
                    vender_name = ?,
                    vender_id = ?,
                    remarks = ?, 
                    updated = datetime('now') 
                WHERE id = ?`,
          [code, deposit_date, status, vender_name, vender_id, remarks, id],
          function (err) {
            if (err) {
              console.error("Error updating deposit slip:", err.message);
              return res.status(500).send("Error updating deposit slip.");
            }
            res.json({ lastID: id });
          }
        );
      } else {
        db.run(
          `INSERT INTO deposit_slips 
                (code, remarks, deposit_date, status, vender_name, vender_id, created, updated) 
                VALUES 
                (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [code, remarks, deposit_date, status, vender_name, vender_id],
          function (err) {
            if (err) {
              console.error("Error inserting deposit slip:", err.message);
              return res.status(500).send("Error inserting deposit slip.");
            }
            res.json({ lastID: this.lastID });
          }
        );
      }
    },

    // Delete Deposit Slip by ID
    deleteDepositSlipById: (req, res) => {
      const { id } = req.params;
      const sql = "DELETE FROM deposit_slips WHERE id = ?";
      db.run(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting deposit slip:", err.message);
          return res.status(500).send("Error deleting deposit slip.");
        }
        res.send("Deposit slip deleted successfully.");
      });
    },

    // Search Deposit Slips
    searchDepositSlips: (req, res) => {
      const { code, vender_name, vender_id } = req.query;
      let sql;
      let params = [];

      if ((code || vender_id || vender_name).trim() !== "") {
        sql = `
            SELECT * FROM deposit_slips 
            WHERE code LIKE ?
            OR vender_name LIKE ? 
            OR vender_id LIKE ?
            `;
        params = Array(3).fill(`%${query}%`);
      } else {
        sql = `SELECT * FROM deposit_slips`;
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching deposit slips:", err.message);
          return res.status(500).send("Error searching deposit slips.");
        }
        res.json(rows);
      });
    },
  };
};
