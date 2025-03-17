module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
          CREATE TABLE IF NOT EXISTS deposit_slip_details (
              id INT AUTO_INCREMENT PRIMARY KEY,
              deposit_slip_id INT NOT NULL,
              deposit_date DATE DEFAULT NULL,
              vender_id VARCHAR(255) DEFAULT NULL,
              vender_name VARCHAR(255) DEFAULT NULL,
              claim_id VARCHAR(255) DEFAULT NULL,
              deposit_method VARCHAR(255) DEFAULT NULL,
              deposits INT DEFAULT NULL,
              commission_fee INT DEFAULT NULL,
              remarks VARCHAR(255) DEFAULT NULL,
              data_category VARCHAR(255) DEFAULT NULL,
              created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      db.query(sql, (err) => {
        if (err) {
          console.error(
            "Error creating depositSlipDetails table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing depositSlipDetails table.");
        }
        res.send("DepositSlipDetails table initialized successfully.");
      });
    },

    // Load Deposit Slip Details
    loadDepositSlipDetails: (req, res) => {
      const sql = `SELECT dsd.*, v.*, ds.*, v.code AS vendor_code, ds.code AS ds_code, ds.id AS ds_id, v.id AS v_id, dsd.id AS dsd_id, dsd.vender_name AS dsd_vender_name
                   FROM deposit_slip_details dsd
                   LEFT JOIN deposit_slips ds ON dsd.deposit_slip_id = ds.id
                   LEFT JOIN vendors v ON ds.vender_id = v.id`;

      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading deposit slip details:", err.message);
          return res.status(500).send("Error loading deposit slip details.");
        }
        res.json(rows);
      });
    },

    // Get Deposit Slip Detail by ID
    getDepositSlipDetailById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM deposit_slip_details WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving deposit slip detail:", err.message);
          return res.status(500).send("Error retrieving deposit slip detail.");
        }
        res.json(row);
      });
    },

    // Get Deposit Slip Detail by Vender Name
    getDepositSlipDetailByVenderName: (req, res) => {
      const { id } = req.params;
      console.log(id);
      const sql = `SELECT * FROM deposit_slip_details WHERE vender_name = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error(
            "Error retrieving deposit slip detail by vender name:",
            err.message
          );
          return res
            .status(500)
            .send("Error retrieving deposit slip detail by vender name.");
        }
        res.json(row);
      });
    },

    // Save Deposit Slip Detail
    saveDepositSlipDetail: (req, res) => {
      const detailData = req.body;
      console.log("Received data", detailData);
      const {
        id,
        deposit_slip_id,
        deposit_date,
        vender_id,
        vender_name,
        claim_id,
        deposit_method,
        deposits,
        commission_fee,
        remarks,
        data_category,
      } = detailData;

      if (id) {
        db.run(
          `UPDATE deposit_slip_details SET 
                    deposit_slip_id = ?, 
                    deposit_date = ?, 
                    vender_id = ?, 
                    vender_name = ?, 
                    claim_id = ?, 
                    deposit_method = ?, 
                    deposits = ?, 
                    commission_fee = ?, 
                    remarks = ?, 
                    data_category = ?, 
                    updated = datetime('now') 
                WHERE id = ?`,
          [
            deposit_slip_id,
            deposit_date,
            vender_id,
            vender_name,
            claim_id,
            deposit_method,
            deposits,
            commission_fee,
            remarks,
            data_category,
            id,
          ],
          function (err) {
            if (err) {
              console.error("Error updating deposit slip detail:", err.message);
              return res
                .status(500)
                .send("Error updating deposit slip detail.");
            }
            res.json({ lastID: id });
          }
        );
      } else {
        console.log("Executing insert");
        db.run(
          `INSERT INTO deposit_slip_details 
                (deposit_slip_id, deposit_date, vender_id, vender_name, claim_id, deposit_method, deposits, commission_fee, remarks, data_category, created, updated) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            deposit_slip_id,
            deposit_date,
            vender_id,
            vender_name,
            claim_id,
            deposit_method,
            deposits,
            commission_fee,
            remarks,
            data_category,
          ],
          function (err) {
            if (err) {
              console.error(
                "Error inserting deposit slip detail:",
                err.message
              );
              return res
                .status(500)
                .send("Error inserting deposit slip detail.");
            }
            res.json({ lastID: this.lastID });
          }
        );
      }
    },

    // Delete Deposit Slip Detail by ID
    deleteDepositSlipDetailById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM deposit_slip_details WHERE id = ?`;
      db.run(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting deposit slip detail:", err.message);
          return res.status(500).send("Error deleting deposit slip detail.");
        }
        res.send("Deposit slip detail deleted successfully.");
      });
    },

    // Delete Deposit Slip Details by Slip ID
    deleteDepositSlipDetailsBySlipId: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM deposit_slip_details WHERE deposit_slip_id = ?`;
      db.run(sql, [id], (err) => {
        if (err) {
          console.error(
            "Error deleting deposit slip details by slip ID:",
            err.message
          );
          return res
            .status(500)
            .send("Error deleting deposit slip details by slip ID.");
        }
        res.send("Deposit slip details deleted successfully.");
      });
    },

    // Search Deposit Slip Details
    searchDepositSlipsDetails: (req, res) => {
      const { conditions } = req.body;
      let sql = `SELECT * FROM deposit_slip_details dsd
                   LEFT JOIN deposit_slips ds ON dsd.deposit_slip_id = ds.id
                   LEFT JOIN vendors v ON dsd.vender_id = v.id`;
      let whereClauses = [];
      let params = [];

      if (conditions && Object.keys(conditions).length > 0) {
        for (const [column, value] of Object.entries(conditions)) {
          if (column === "dsd.created_start") {
            whereClauses.push(`dsd.created >= ?`);
            params.push(value);
          } else if (column === "dsd.created_end") {
            whereClauses.push(`dsd.created <= ?`);
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

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching deposit slip details:", err.message);
          return res.status(500).send("Error searching deposit slip details.");
        }
        res.json(rows);
      });
    },

    // Search Deposit Slips by Deposit Slip ID
    searchDepositSlipsByDepositSlipId: (req, res) => {
      const { deposit_slip_id } = req.query;
      let sql;
      let params = [];

      if (deposit_slip_id && deposit_slip_id.trim() !== "") {
        sql = `SELECT * FROM deposit_slip_details WHERE deposit_slip_id LIKE ?`;
        params = [`%${deposit_slip_id}%`];
      } else {
        sql = `SELECT * FROM deposit_slip_details`;
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error(
            "Error searching deposit slips by deposit slip ID:",
            err.message
          );
          return res
            .status(500)
            .send("Error searching deposit slips by deposit slip ID.");
        }
        res.json(rows);
      });
    },

    // Get Deposits Total by Vendor IDs
    getDepositsTotalByVendorIds: (req, res) => {
      const { venderIds, formattedDate } = req.body;

      const placeholders = venderIds.map(() => "?").join(", ");
      const sql = `
        SELECT 
          dsd.vender_id, 
          SUM(dsd.deposits) AS total_deposits, 
          SUM(dsd.commission_fee) AS total_commission_fee,
          ds.deposit_date
        FROM deposit_slip_details dsd
        LEFT JOIN deposit_slips ds ON dsd.deposit_slip_id = ds.id
        WHERE dsd.vender_id IN (${placeholders})
          AND ds.deposit_date <= ?
        GROUP BY dsd.vender_id
      `;

      db.all(sql, [...venderIds, formattedDate], (err, rows) => {
        if (err) {
          console.error(
            "Error retrieving deposits total by vendor IDs:",
            err.message
          );
          return res
            .status(500)
            .send("Error retrieving deposits total by vendor IDs.");
        }
        res.json(rows);
      });
    },

    // Get Deposits Total Yesterday by Vendor IDs
    getDepositsTotalYesterdayByVendorIds: (req, res) => {
      const { venderIds, formattedDate } = req.body;

      const yesterday = new Date(formattedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedYesterday = yesterday.toISOString().split("T")[0];

      const placeholders = venderIds.map(() => "?").join(", ");
      const sql = `
        SELECT 
          dsd.vender_id, 
          SUM(dsd.deposits) AS total_deposits, 
          SUM(dsd.commission_fee) AS total_commission_fee,
          ds.deposit_date
        FROM deposit_slip_details dsd
        LEFT JOIN deposit_slips ds ON dsd.deposit_slip_id = ds.id
        WHERE dsd.vender_id IN (${placeholders})
          AND ds.deposit_date <= ?
        GROUP BY dsd.vender_id
      `;

      db.all(sql, [...venderIds, formattedYesterday], (err, rows) => {
        if (err) {
          console.error(
            "Error retrieving deposits total yesterday by vendor IDs:",
            err.message
          );
          return res
            .status(500)
            .send("Error retrieving deposits total yesterday by vendor IDs.");
        }
        res.json(rows);
      });
    },
  };
};
