module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
              CREATE TABLE IF NOT EXISTS sales_slip_details (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  sales_slip_id INT,
                  product_id INT,
                  product_name VARCHAR(255),
                  customer_id INT,
                  customer_name VARCHAR(255),
                  number INT,
                  unit VARCHAR(255) DEFAULT NULL,
                  unit_price INT,
                  tax_rate INT,
                  lot_number INT DEFAULT NULL,
                  storage_facility VARCHAR(255),
                  stock INT DEFAULT NULL,
                  gross_profit INT DEFAULT NULL,
                  gross_margin_rate INT DEFAULT NULL,
                  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating salesSlipDetails table:", err.message);
          return res
            .status(500)
            .send("Error initializing salesSlipDetails table.");
        }
        res.send("SalesSlipDetails table initialized successfully.");
      });
    },

    // Load Sales Slip Details
    loadSalesSlipDetails: (req, res) => {
      const sql = `SELECT ssd.*, p.*, ss.*, p.created AS product_created, ss.created AS ss_created, ssd.created AS ssd_created, ss.code AS sales_slip_code
              FROM sales_slip_details ssd
              LEFT JOIN products p ON ssd.product_id = p.id
              LEFT JOIN sales_slips ss ON ssd.sales_slip_id = ss.id
              LEFT JOIN customers c ON ss.vender_id = c.id`;
      console.log("SQL Query:", sql);

      db.query(sql, [], (err, rows) => {
        if (err) {
          console.error("Error executing SQL:", err);
          return res.status(500).send(err.message);
        }
        console.log("Query Result:", rows);
        res.json(rows);
      });
    },

    // Get Sales Slip Detail by ID
    getSalesSlipDetailById: (req, res) => {
      const id = req.params.id;
      const sql = `SELECT * FROM sales_slip_details WHERE id = ?`;
      db.query(sql, [id], (err, row) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(row);
      });
    },

    // Save Sales Slip Detail
    saveSalesSlipDetail: (req, res) => {
      const salesSlipDetailData = req.body;
      const {
        id,
        sales_slip_id,
        product_id,
        product_name,
        number,
        unit,
        unit_price,
        tax_rate,
        lot_number,
        storage_facility,
        stock,
        gross_profit,
        gross_margin_rate,
      } = salesSlipDetailData;
      if (id) {
        db.query(
          `SELECT id FROM sales_slip_details WHERE id = ?`,
          [id],
          (err, row) => {
            if (err) {
              return res.status(500).send(err.message);
            }

            if (row) {
              db.query(
                `UPDATE sales_slip_details SET 
                              sales_slip_id = ?, 
                              product_id = ?, 
                              product_name = ?, 
                              number = ?, 
                              unit = ?, 
                              unit_price = ?, 
                              tax_rate = ?, 
                              lot_number = ?, 
                              storage_facility = ?, 
                              stock = ?, 
                              gross_profit = ?, 
                              gross_margin_rate = ?, 
                              updated = CURRENT_TIMESTAMP 
                          WHERE id = ?`,
                [
                  sales_slip_id,
                  product_id,
                  product_name,
                  number,
                  unit,
                  unit_price,
                  tax_rate,
                  lot_number,
                  storage_facility,
                  stock,
                  gross_profit,
                  gross_margin_rate,
                  id,
                ],
                (err) => {
                  if (err) {
                    return res.status(500).send(err.message);
                  }
                  res.send("Sales slip detail updated successfully.");
                }
              );
            } else {
              db.query(
                `INSERT INTO sales_slip_details 
                          (sales_slip_id, product_id, product_name, number, unit, unit_price, tax_rate, lot_number, storage_facility, stock, gross_profit, gross_margin_rate, created, updated) 
                          VALUES 
                          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                  sales_slip_id,
                  product_id,
                  product_name,
                  number,
                  unit,
                  unit_price,
                  tax_rate,
                  lot_number,
                  storage_facility,
                  stock,
                  gross_profit,
                  gross_margin_rate,
                ],
                (err) => {
                  if (err) {
                    return res.status(500).send(err.message);
                  }
                  res.send("Sales slip detail inserted successfully.");
                }
              );
            }
          }
        );
      } else {
        db.query(
          `INSERT INTO sales_slip_details 
              (sales_slip_id, product_id, product_name, number, unit, unit_price, tax_rate, lot_number, storage_facility, stock, gross_profit, gross_margin_rate, created, updated) 
              VALUES 
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            sales_slip_id,
            product_id,
            product_name,
            number,
            unit,
            unit_price,
            tax_rate,
            lot_number,
            storage_facility,
            stock,
            gross_profit,
            gross_margin_rate,
          ],
          (err) => {
            if (err) {
              return res.status(500).send(err.message);
            }
            res.send("Sales slip detail inserted successfully.");
          }
        );
      }
    },

    // Delete Sales Slip Details by Slip ID
    deleteSalesSlipDetailsBySlipId: (req, res) => {
      const salesSlipId = req.params.salesSlipId;
      const sql = `DELETE FROM sales_slip_details WHERE sales_slip_id = ?`;
      db.query(sql, [salesSlipId], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.send("Sales slip details deleted successfully.");
      });
    },

    // Delete Sales Slip Detail by ID
    deleteSalesSlipDetailById: (req, res) => {
      const id = req.params.id;
      const sql = `DELETE FROM sales_slip_details WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.send("Sales slip detail deleted successfully.");
      });
    },

    // Search Sales Slips by Sales Slip ID
    searchSalesSlipsBySalesSlipId: (req, res) => {
      const { sales_slip_id } = req.query;
      let sql = `SELECT * FROM sales_slip_details WHERE sales_slip_id LIKE ?`;
      let params = [`%${sales_slip_id}%`];

      db.query(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Search Sales Slip Details
    searchSalesSlipDetails: (req, res) => {
      const conditions = req.body;
      let sql = `SELECT ssd.*, ss.*, p.*, c.*, pc.code AS parent_code, c.id AS customer_id, pc.name_primary AS parent_name, pc.id AS parent_id,  pc.zip_code AS parent_zip_code, pc.address AS parent_address, p.created AS product_created, ss.created AS ss_created, ssd.created AS ssd_created
          FROM sales_slip_details ssd
          LEFT JOIN sales_slips ss ON ssd.sales_slip_id = ss.id
          LEFT JOIN products p ON ssd.product_id = p.id
          LEFT JOIN customers c ON ss.vender_id = c.id
          LEFT JOIN customers pc ON c.billing_code = pc.code`;

      let whereClauses = [];
      let params = [];

      if (conditions && Object.keys(conditions).length > 0) {
        for (const [column, value] of Object.entries(conditions)) {
          if (column === "ssd.created_start") {
            whereClauses.push(`ssd_created >= ?`);
            params.push(value);
          } else if (column === "ssd.created_end") {
            whereClauses.push(`ssd_created <= ?`);
            params.push(value);
          } else if (column === "ss.sales_date_start") {
            whereClauses.push(`sales_date >= ?`);
            params.push(value);
          } else if (column === "ss.sales_date_end") {
            whereClauses.push(`sales_date <= ?`);
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
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Get Monthly Sales With Join
    getMonthlySalesWithJoin: (req, res) => {
      const conditions = req.body;
      searchSalesSlipDetails(conditions, (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }

        const monthlySales = {};

        rows.forEach((row) => {
          const month = row.created ? row.created.substring(0, 7) : null;
          if (month) {
            const saleAmount = row.unit_price * row.number;
            monthlySales[month] = (monthlySales[month] || 0) + saleAmount;
          }
        });

        const result = Object.keys(monthlySales).map((month) => ({
          month,
          total_sales: monthlySales[month],
        }));

        res.json(result);
      });
    },

    // Get Monthly Sales
    getMonthlySales: (req, res) => {
      const { venderIds, formattedDate } = req.body;
      const placeholders = venderIds.map(() => "?").join(", ");
      const sql = `
          SELECT 
              ssd.sales_slip_id, 
              SUM(ssd.unit_price * ssd.number) AS total_sales, 
              SUM((ssd.tax_rate / 100.0) * ssd.unit_price * ssd.number) AS taxes,  
              ss.vender_id AS vender_id,
              ss.sales_date
          FROM sales_slip_details ssd
          LEFT JOIN sales_slips ss ON ssd.sales_slip_id = ss.id
          LEFT JOIN products p ON ssd.product_id = p.id
          LEFT JOIN customers c ON ss.vender_id = c.id
          WHERE ss.vender_id IN (${placeholders})
              AND ss.sales_date <= ?
          GROUP BY ss.vender_id
      `;

      db.query(sql, [...venderIds, formattedDate], (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Get Monthly Sales Yesterday
    getMonthlySalesYesterday: (req, res) => {
      const { venderIds, formattedDate } = req.body;
      const yesterday = new Date(formattedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedYesterday = yesterday.toISOString().split("T")[0];

      const placeholders = venderIds.map(() => "?").join(", ");
      const sql = `
          SELECT 
              ssd.sales_slip_id, 
              SUM(ssd.unit_price * ssd.number) AS total_sales, 
              SUM((ssd.tax_rate / 100.0) * ssd.unit_price * ssd.number) AS taxes,  
              ss.vender_id AS vender_id,
              ss.sales_date
          FROM sales_slip_details ssd
          LEFT JOIN sales_slips ss ON ssd.sales_slip_id = ss.id
          LEFT JOIN products p ON ssd.product_id = p.id
          LEFT JOIN customers c ON ss.vender_id = c.id
          WHERE ss.vender_id IN (${placeholders})
              AND ss.sales_date <= ?
          GROUP BY ss.vender_id
      `;

      db.query(sql, [...venderIds, formattedYesterday], (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },

    // Get Monthly Sales Including Tax
    getMonthlySalesInTax: (req, res) => {
      const { venderIds, formattedDate } = req.body;
      const placeholders = venderIds.map(() => "?").join(", ");
      const sql = `
          SELECT ssd.sales_slip_id, SUM(ssd.unit_price * ssd.number * (ssd.tax_rate*0.01 + 1)) AS total_sales, ss.vender_id AS vender_id
          FROM sales_slip_details ssd
          LEFT JOIN sales_slips ss ON ssd.sales_slip_id = ss.id
          LEFT JOIN products p ON ssd.product_id = p.id
          LEFT JOIN customers c ON ss.vender_id = c.id
          WHERE ss.vender_id IN (${placeholders})
          AND strftime('%Y-%m', ss.sales_date) = strftime('%Y-%m', ?)
          GROUP BY ss.vender_id
      `;
      db.query(sql, [...venderIds, formattedDate], (err, rows) => {
        if (err) {
          return res.status(500).send(err.message);
        }
        res.json(rows);
      });
    },
  };
};

// Search Sales Slip Details
function searchSalesSlipDetails(conditions, callback) {
  let sql = `SELECT ssd.*, ss.*, p.*, c.*, pc.code AS parent_code, c.id AS customer_id, pc.name_primary AS parent_name, pc.id AS parent_id,  pc.zip_code AS parent_zip_code, pc.address AS parent_address, p.created AS product_created, ss.created AS ss_created, ssd.created AS ssd_created
      FROM sales_slip_details ssd
      LEFT JOIN sales_slips ss ON ssd.sales_slip_id = ss.id
      LEFT JOIN products p ON ssd.product_id = p.id
      LEFT JOIN customers c ON ss.vender_id = c.id
      LEFT JOIN customers pc ON c.billing_code = pc.code`;

  let whereClauses = [];
  let params = [];

  if (conditions && Object.keys(conditions).length > 0) {
    for (const [column, value] of Object.entries(conditions)) {
      if (column === "ssd.created_start") {
        whereClauses.push(`ssd_created >= ?`);
        params.push(value);
      } else if (column === "ssd.created_end") {
        whereClauses.push(`ssd_created <= ?`);
        params.push(value);
      } else if (column === "ss.sales_date_start") {
        whereClauses.push(`sales_date >= ?`);
        params.push(value);
      } else if (column === "ss.sales_date_end") {
        whereClauses.push(`sales_date <= ?`);
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
      return res.status(500).send(err.message);
    }
    callback(rows);
  });
}
