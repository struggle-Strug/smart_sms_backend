module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
              CREATE TABLE IF NOT EXISTS estimation_slip_details (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  estimation_slip_id INT NOT NULL,
                  product_id INT NOT NULL,
                  product_name VARCHAR(255) NOT NULL,
                  number INT NOT NULL,
                  unit VARCHAR(255) DEFAULT NULL,
                  unit_price INT NOT NULL,
                  price INT NOT NULL,
                  tax_rate INT NOT NULL,
                  lot_number INT DEFAULT NULL,
                  storage_facility VARCHAR(255) DEFAULT NULL,
                  stock INT DEFAULT NULL,
                  gross_profit INT DEFAULT NULL,
                  gross_margin_rate INT NOT NULL,
                  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `;

      db.query(sql, (err) => {
        if (err) {
          console.error(
            "Error creating estimationSlipDetails table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing estimationSlipDetails table.");
        }
        res.send("EstimationSlipDetails table initialized successfully.");
      });
    },

    // Load Estimation Slip Details
    loadEstimationSlipDetails: (req, res) => {
      const sql = `SELECT * FROM estimation_slip_details esd
               LEFT JOIN products ON esd.product_id = products.id
               LEFT JOIN estimation_slips es ON esd.estimation_slip_id = es.id`;

      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading estimation slip details:", err.message);
          return res.status(500).send("Error loading estimation slip details.");
        }
        console.log(rows);
        console.log("Executed SQL:", sql);
        res.json(rows);
      });
    },

    // Get Estimation Slip Detail by ID
    getEstimationSlipDetailById: (req, res) => {
      const id = req.params.id;
      const sql = `SELECT * FROM estimation_slip_details WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error(
            "Error retrieving estimation slip detail:",
            err.message
          );
          return res
            .status(500)
            .send("Error retrieving estimation slip detail.");
        }
        console.log(row);
        res.json(row);
      });
    },

    // Save Estimation Slip Detail (Insert/Update)
    saveEstimationSlipDetail: (req, res) => {
      const detailData = req.body;
      const {
        id,
        estimation_slip_id,
        product_id,
        product_name,
        number,
        unit,
        unit_price,
        price,
        tax_rate,
        lot_number,
        storage_facility,
        stock,
        gross_profit,
        gross_margin_rate,
      } = detailData;

      if (id) {
        db.get(
          `SELECT id FROM estimation_slip_details WHERE id = ?`,
          [id],
          (err, row) => {
            if (err) {
              return res.status(500).send(err.message);
            }

            if (row) {
              db.run(
                `UPDATE estimation_slip_details SET 
                                  estimation_slip_id = ?, 
                                  product_id = ?, 
                                  product_name = ?, 
                                  number = ?, 
                                  unit = ?, 
                                  unit_price = ?, 
                                  price = ?, 
                                  tax_rate = ?, 
                                  lot_number = ?, 
                                  storage_facility = ?, 
                                  stock = ?, 
                                  gross_profit = ?, 
                                  gross_margin_rate = ?, 
                                  updated = datetime('now') 
                              WHERE id = ?`,
                [
                  estimation_slip_id,
                  product_id,
                  product_name,
                  number,
                  unit,
                  unit_price,
                  price,
                  tax_rate,
                  lot_number,
                  storage_facility,
                  stock,
                  gross_profit,
                  gross_margin_rate,
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
              db.run(
                `INSERT INTO estimation_slip_details 
                                  (estimation_slip_id, product_id, product_name, number, unit, unit_price, price, tax_rate, lot_number, storage_facility, stock, gross_profit, gross_margin_rate, created, updated) 
                                  VALUES 
                                  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [
                  estimation_slip_id,
                  product_id,
                  product_name,
                  number,
                  unit,
                  unit_price,
                  price,
                  tax_rate,
                  lot_number,
                  storage_facility,
                  stock,
                  gross_profit,
                  gross_margin_rate,
                ],
                function (err) {
                  if (err) {
                    return res.status(500).send(err.message);
                  }
                  res.json({ lastID: this.lastID });
                }
              );
            }
          }
        );
      } else {
        db.run(
          `INSERT INTO estimation_slip_details 
                      (estimation_slip_id, product_id, product_name, number, unit, unit_price, price, tax_rate, lot_number, storage_facility, stock, gross_profit, gross_margin_rate, created, updated) 
                      VALUES 
                      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            estimation_slip_id,
            product_id,
            product_name,
            number,
            unit,
            unit_price,
            price,
            tax_rate,
            lot_number,
            storage_facility,
            stock,
            gross_profit,
            gross_margin_rate,
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

    // Delete Estimation Slip Detail by ID
    deleteEstimationSlipDetailById: (req, res) => {
      const id = req.params.id;
      const sql = `DELETE FROM estimation_slip_details WHERE estimation_slip_id = ?`;
      db.run(sql, [id], function (err) {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ message: "Estimation slip detail deleted successfully." });
      });
    },

    // Search Estimation Slips by Estimation Slip ID
    searchEstimationSlipsByEstimationSlipId: (req, res) => {
      const { estimation_slip_id } = req.query;
      let sql;
      let params = [];

      if (estimation_slip_id && estimation_slip_id.trim() !== "") {
        sql = `SELECT * FROM estimation_slip_details WHERE estimation_slip_id LIKE ?`;
        params = [`%${estimation_slip_id}%`];
      } else {
        sql = `SELECT * FROM estimation_slip_details`;
      }
      db.all(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Search Estimation Slip Details
    searchEstimationSlipDetails: (req, res) => {
      const { conditions } = req.body;
      let sql = `SELECT * FROM estimation_slip_details esd
           LEFT JOIN estimation_slips es ON esd.estimation_slip_id = es.id
           LEFT JOIN products p ON esd.product_id = p.id`;
      let whereClauses = [];
      let params = [];

      if (conditions && Object.keys(conditions).length > 0) {
        for (const [column, value] of Object.entries(conditions)) {
          if (column === "esd.created_start") {
            whereClauses.push(`esd.created >= ?`);
            params.push(value);
          } else if (column === "esd.created_end") {
            whereClauses.push(`esd.created <= ?`);
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
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Delete Estimation Slip Details by Estimation Slip ID
    deleteEstimationSlipDetailsByEsId: (req, res) => {
      const EstimationSlipId = req.params.estimation_slip_id;
      const sql = `DELETE FROM estimation_slip_details WHERE estimation_slip_id = ?`;
      db.run(sql, [EstimationSlipId], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json({ message: "Estimation slip details deleted successfully" });
      });
    },
  };
};
