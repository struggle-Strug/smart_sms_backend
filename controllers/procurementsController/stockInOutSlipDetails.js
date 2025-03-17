module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS stock_in_out_slip_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                stock_in_out_slip_id INT,
                product_id INT,
                product_name VARCHAR(255),
                number INT,
                unit VARCHAR(255),
                price INT,
                lot_number INT,
                created DATE DEFAULT CURRENT_DATE,
                updated DATE DEFAULT CURRENT_DATE
            );
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error(
            "Error creating stockInOutSlipDetails table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing stockInOutSlipDetails table.");
        }
        res.send("StockInOutSlipDetails table initialized successfully.");
      });
    },

    // Load Stock In Out Slip Details
    loadStockInOutSlipDetails: (req, res) => {
      const sql = `
        SELECT siod.*, p.*, sio.*
        FROM stock_in_out_slip_details siod
        LEFT JOIN stock_in_out_slips sio ON siod.stock_in_out_slip_id = sio.id
        LEFT JOIN products p ON siod.product_id = p.id
      `;
      db.query(sql, [], (err, rows) => {
        if (err) {
          console.error(
            "Error loading stock in out slip details:",
            err.message
          );
          return res
            .status(500)
            .send("Error loading stock in out slip details.");
        }
        res.json(rows);
      });
    },

    // Get Stock In Out Slip Detail by ID
    getStockInOutSlipDetailById: (req, res) => {
      const { id } = req.params;
      const sql = `SELECT * FROM stock_in_out_slip_details WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          console.error(
            "Error retrieving stock in out slip detail:",
            err.message
          );
          return res
            .status(500)
            .send("Error retrieving stock in out slip detail.");
        }
        res.json(row);
      });
    },

    // Save Stock In Out Slip Detail
    saveStockInOutSlipDetail: (req, res) => {
      const {
        id,
        stock_in_out_slip_id,
        product_id,
        product_name,
        number,
        unit,
        price,
        lot_number,
      } = req.body;

      const sql = id
        ? `UPDATE stock_in_out_slip_details SET 
              stock_in_out_slip_id = ?, 
              product_id = ?, 
              product_name = ?,
              number = ?, 
              unit = ?, 
              price = ?, 
              lot_number = ?, 
              updated = NOW() 
            WHERE id = ?`
        : `INSERT INTO stock_in_out_slip_details 
              (stock_in_out_slip_id, product_id, product_name, number, unit, price, lot_number, created, updated) 
              VALUES 
              (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

      const params = id
        ? [
            stock_in_out_slip_id,
            product_id,
            product_name,
            number,
            unit,
            price,
            lot_number,
            id,
          ]
        : [
            stock_in_out_slip_id,
            product_id,
            product_name,
            number,
            unit,
            price,
            lot_number,
          ];

      db.query(sql, params, (err) => {
        if (err) {
          console.error("Error saving stock in out slip detail:", err.message);
          return res.status(500).send("Error saving stock in out slip detail.");
        }
        res.send({ success: true });
      });
    },

    // Delete Stock In Out Slip Detail by ID
    deleteStockInOutSlipDetailById: (req, res) => {
      const { id } = req.params;
      const sql = `DELETE FROM stock_in_out_slip_details WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          console.error(
            "Error deleting stock in out slip detail:",
            err.message
          );
          return res
            .status(500)
            .send("Error deleting stock in out slip detail.");
        }
        res.send({ success: true });
      });
    },

    // Delete Stock In Out Slip Details by Slip ID
    deleteStockInOutSlipDetailsBySlipId: (req, res) => {
      const { stockInOutSlipId } = req.params;
      const sql = `DELETE FROM stock_in_out_slip_details WHERE stock_in_out_slip_id = ?`;
      db.query(sql, [stockInOutSlipId], (err) => {
        if (err) {
          console.error(
            "Error deleting stock in out slip details:",
            err.message
          );
          return res
            .status(500)
            .send("Error deleting stock in out slip details.");
        }
        res.send({ success: true });
      });
    },

    // Search Stock In Out Slip Details
    searchStockInOutSlipDetails: (req, res) => {
      const { conditions } = req.body;
      let sql = `
        SELECT siod.*, sio.*, p.*
        FROM stock_in_out_slip_details siod
        LEFT JOIN stock_in_out_slips sio ON siod.stock_in_out_slip_id = sio.id
        LEFT JOIN products p ON siod.product_id = p.id
      `;

      let whereClauses = [];
      let params = [];

      if (conditions && Object.keys(conditions).length > 0) {
        for (const [column, value] of Object.entries(conditions)) {
          if (column === "siod.created_start") {
            whereClauses.push(`sio.stock_in_out_date >= ?`);
            params.push(value);
          } else if (column === "siod.created_end") {
            whereClauses.push(`sio.stock_in_out_date <= ?`);
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

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error(
            "Error searching stock in out slip details:",
            err.message
          );
          return res
            .status(500)
            .send("Error searching stock in out slip details.");
        }
        res.json(rows);
      });
    },

    // Search Stock In Out Slip Details by Slip ID
    searchStockInOutSlipDetailsBySlipId: (req, res) => {
      const { stock_in_out_slip_id } = req.params;
      let sql;
      let params = [];

      if (stock_in_out_slip_id && stock_in_out_slip_id.trim() !== "") {
        sql = `SELECT * FROM stock_in_out_slip_details WHERE stock_in_out_slip_id LIKE ?`;
        params = [`%${stock_in_out_slip_id}%`];
      } else {
        sql = `SELECT * FROM stock_in_out_slip_details`;
      }
      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error(
            "Error searching stock in out slip details by slip ID:",
            err.message
          );
          return res
            .status(500)
            .send("Error searching stock in out slip details by slip ID.");
        }
        res.json(rows);
      });
    },
  };
};
