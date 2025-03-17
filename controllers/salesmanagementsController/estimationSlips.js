module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
              CREATE TABLE IF NOT EXISTS estimation_slips (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  code VARCHAR(255) DEFAULT NULL,
                  estimation_date DATE,
                  estimation_due_date DATE,
                  estimation_id VARCHAR(255),
                  vender_id VARCHAR(255),
                  vender_name VARCHAR(255),
                  honorific VARCHAR(255),
                  vender_contact_person VARCHAR(255),
                  remarks VARCHAR(255),
                  estimated_delivery_date DATE,
                  closing_date DATE,
                  deposit_due_date DATE,
                  deposit_method VARCHAR(255),
                  status VARCHAR(255) DEFAULT '未受注',
                  created DATE DEFAULT CURRENT_DATE,
                  updated DATE DEFAULT CURRENT_DATE
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating estimationSlips table:", err.message);
          return res
            .status(500)
            .send("Error initializing estimationSlips table.");
        }
        res.send("EstimationSlips table initialized successfully.");
      });
    },

    // Load Estimation Slips
    loadEstimationSlips: (req, res) => {
      const pageSize = 10;
      const page = req.query.page ? parseInt(req.query.page) : undefined;
      const offset = page;
      const sql =
        page === undefined
          ? `SELECT * FROM estimation_slips`
          : `SELECT * FROM estimation_slips LIMIT ? OFFSET ?`;

      const queryParams = page === undefined ? [] : [pageSize, offset];
      db.all(sql, queryParams, (err, rows) => {
        if (err) {
          console.error("Error loading estimation slips:", err.message);
          return res.status(500).send("Error loading estimation slips.");
        }
        res.json(rows);
      });
    },

    // Get Estimation Slip by ID
    getEstimationSlipById: (req, res) => {
      const id = req.params.id;
      const sql = `SELECT 
              estimation_slips.*, 
              v.code AS vendor_code  
              FROM estimation_slips
              LEFT JOIN vendors v ON v.id = estimation_slips.vender_id
              WHERE estimation_slips.id = ?;`;

      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving estimation slip:", err.message);
          return res.status(500).send("Error retrieving estimation slip.");
        }
        res.json(row);
      });
    },

    // Save Estimation Slip (Insert/Update)
    saveEstimationSlip: (req, res) => {
      const estimationData = req.body;
      const {
        id,
        code,
        estimation_date,
        estimation_due_date,
        estimation_id,
        vender_id,
        vender_name,
        honorific,
        vender_contact_person,
        remarks,
        estimated_delivery_date,
        closing_date,
        deposit_due_date,
        deposit_method,
      } = estimationData;

      if (id) {
        db.run(
          `UPDATE estimation_slips SET 
                      code = ?,
                      estimation_date = ?, 
                      estimation_due_date = ?, 
                      estimation_id = ?, 
                      vender_id = ?, 
                      vender_name = ?, 
                      honorific = ?, 
                      vender_contact_person = ?, 
                      remarks = ?, 
                      estimated_delivery_date = ?, 
                      closing_date = ?, 
                      deposit_due_date = ?, 
                      deposit_method = ?, 
                      updated = datetime('now') 
                  WHERE id = ?`,
          [
            code,
            estimation_date,
            estimation_due_date,
            estimation_id,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            remarks,
            estimated_delivery_date,
            closing_date,
            deposit_due_date,
            deposit_method,
            id,
          ],
          function (err) {
            if (err) {
              console.error("Error updating estimation slip:", err.message);
              return res.status(500).send("Error updating estimation slip.");
            }
            res.json({ lastID: id });
          }
        );
      } else {
        db.run(
          `INSERT INTO estimation_slips 
                      (code, estimation_date, estimation_due_date, estimation_id, vender_id, vender_name, honorific, vender_contact_person, remarks, estimated_delivery_date, closing_date, deposit_due_date, deposit_method, created, updated) 
                      VALUES 
                      (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            code,
            estimation_date,
            estimation_due_date,
            estimation_id,
            vender_id,
            vender_name,
            honorific,
            vender_contact_person,
            remarks,
            estimated_delivery_date,
            closing_date,
            deposit_due_date,
            deposit_method,
          ],
          function (err) {
            if (err) {
              console.error("Error inserting estimation slip:", err.message);
              return res.status(500).send("Error inserting estimation slip.");
            }
            res.json({ lastID: this.lastID });
          }
        );
      }
    },

    // Delete Estimation Slip by ID
    deleteEstimationSlipById: (req, res) => {
      const id = req.params.id;
      const sql = `DELETE FROM estimation_slips WHERE id = ?`;
      db.run(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting estimation slip:", err.message);
          return res.status(500).send("Error deleting estimation slip.");
        }
        res.send("Estimation slip deleted successfully.");
      });
    },

    // Search Estimation Slips
    searchEstimationSlips: (req, res) => {
      const { vender_name, estimation_id, vender_contact_person } = req.query;
      let sql;
      let params = [];

      if (
        (vender_name || estimation_id || vender_contact_person).trim() !== ""
      ) {
        sql = `
              SELECT * FROM estimation_slips 
              WHERE vender_name LIKE ? OR estimation_id LIKE ? OR vender_contact_person LIKE ?
          `;
        params = Array(3).fill(`%${query}%`);
      } else {
        sql = `SELECT * FROM estimation_slips`;
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching estimation slips:", err.message);
          return res.status(500).send("Error searching estimation slips.");
        }
        res.json(rows);
      });
    },

    // Search Estimation Slips on PV
    searchEstimationSlipsOnPV: (req, res) => {
      const { conditions } = req.body;
      let sql = `SELECT * FROM estimation_slips LEFT JOIN estimation_slip_details ON estimation_slips.id = estimation_slip_details.estimation_slip_id WHERE 1=1`;
      let params = [];

      if (conditions.es_start_date) {
        sql += ` AND estimation_date >= ?`;
        params.push(conditions.es_start_date);
      }
      if (conditions.es_end_date) {
        sql += ` AND estimation_date <= ?`;
        params.push(conditions.es_end_date);
      }
      if (conditions.es_code) {
        sql += ` AND code LIKE ?`;
        params.push(`%${conditions.es_code}%`);
      }
      if (conditions.es_name) {
        sql += ` AND vender_name LIKE ?`;
        params.push(`%${conditions.es_name}%`);
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching estimation slips on PV:", err.message);
          return res
            .status(500)
            .send("Error searching estimation slips on PV.");
        }
        res.json(rows);
      });
    },

    // Update Estimation Slip Status
    updateEstimationSlipStatus: (req, res) => {
      const query = req.body;
      const sql = `UPDATE estimation_slips SET status = ?, updated = datetime('now') WHERE code = ?`;
      db.run(sql, [query.status, query.code], function (err) {
        if (err) {
          console.error("Error updating estimation slip status:", err.message);
          return res.status(500).send("Error updating estimation slip status.");
        }
        res.json({ code: query.code });
      });
    },
  };
};
