module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS inventory_logs (
                id INT AUTO_INCREMENT PRIMARY KEY, -- MySQL equivalent for AUTOINCREMENT
                number INT DEFAULT NULL,
                storage_facility_id INT DEFAULT NULL,  -- Foreign key to storage_facilities (if applicable)
                product_id INT DEFAULT NULL,           -- Foreign key to products (if applicable)
                product_name VARCHAR(255) DEFAULT NULL,
                lot_number INT DEFAULT NULL,
                action VARCHAR(255) DEFAULT NULL,
                created DATE DEFAULT CURRENT_DATE,  -- Current date as default for created
                updated DATE DEFAULT CURRENT_DATE   -- Current date as default for updated
            );
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating inventoryLogs table:", err.message);
          return res
            .status(500)
            .send("Error initializing inventoryLogs table.");
        }
        res.send("InventoryLogs table initialized successfully.");
      });
    },

    // Load inventory logs
    loadInventoryLogs: (req, res) => {
      const sql = `SELECT * FROM inventory_logs`;
      db.query(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading inventory logs:", err.message);
          return res.status(500).send("Error loading inventory logs.");
        }
        res.json(rows);
      });
    },
    // Save new inventory log
    saveInventoryLog: (req, res) => {
      const {
        number,
        storage_facility_id,
        product_id,
        product_name,
        lot_number,
        action,
      } = req.body;

      const insertSql = `
          INSERT INTO inventory_logs 
          (number, storage_facility_id, product_id, product_name, lot_number, action, created, updated) 
          VALUES 
          (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

      db.query(
        insertSql,
        [
          number,
          storage_facility_id,
          product_id,
          product_name,
          lot_number,
          action,
        ],
        function (err, result) {
          if (err) {
            console.error("Error saving inventory log:", err.message);
            return res.status(500).send("Error saving inventory log.");
          }
          res.json({ lastID: result.insertId });
        }
      );
    },
    // Delete inventory log by ID
    deleteInventoryLogById: (req, res) => {
      const { id } = req.params; // Assuming the ID is passed as a route parameter, e.g., /inventory-log/:id

      const sql = `DELETE FROM inventory_logs WHERE id = ?`;

      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting inventory log:", err.message);
          return res.status(500).send("Error deleting inventory log.");
        }
        res.send("Inventory log deleted successfully.");
      });
    },

    // Get a specific inventory log by ID (MySQL version)
    editInventoryLog: (req, res) => {
      const { id } = req.params; // Get ID from request parameters

      const sql = `SELECT * FROM inventory_logs WHERE id = ?`;

      db.query(sql, [id], (err, rows) => {
        if (err) {
          console.error("Error fetching inventory log:", err.message);
          return res.status(500).send("Error fetching inventory log.");
        }

        if (rows.length === 0) {
          return res.status(404).send("Inventory log not found.");
        }

        res.json(rows[0]); // Return the first matching record as JSON response
      });
    },

    // Search inventory logs
    searchInventoryLogs: (req, res) => {
      const { product_name, action } = req.query; // Assuming the query is passed as a query parameter, e.g., ?query=example
      let sql;
      let params = [];

      // If there is a query, search using LIKE for relevant fields
      if (query && query.trim() !== "") {
        sql = `
            SELECT * FROM inventory_logs 
            WHERE product_name LIKE ? 
            OR action LIKE ? 
          `;
        params = [
          product_name || "%", // Fallback to '%' if the query is not provided
          action || "%",
        ]; // Fill params with the query value for both product_name and action
      } else {
        sql = `SELECT * FROM inventory_logs`; // If no query, select all logs
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching inventory logs:", err.message);
          return res.status(500).send("Error searching inventory logs.");
        }
        res.json(rows); // Return the rows found based on the query
      });
    },
    // Get grouped inventory logs by product_id and storage_facility_id
    getGroupedInventoryLogs: (req, res) => {
      const sql = `
          SELECT 
              product_id,
              storage_facility_id,
              SUM(number) AS total_number
          FROM 
              inventory_logs
          GROUP BY 
              product_id, 
              storage_facility_id
          ORDER BY 
              product_id, 
              storage_facility_id;
        `;

      db.query(sql, [], (err, rows) => {
        if (err) {
          console.error("Error fetching grouped inventory logs:", err.message);
          return res.status(500).send("Error fetching grouped inventory logs.");
        }
        res.json(rows); // Return the grouped results in JSON format
      });
    },
    // Get filtered inventory logs with dynamic conditions
    getFilteredInventoryLogs: (req, res) => {
      const { conditions } = req.body; // Assuming conditions are passed via query parameters
      let sql = `
          SELECT 
              invl.product_id AS product_code,
              invl.product_name AS invl_product_name,
              p.name AS product_name,
              COALESCE(SUM(CASE WHEN invl.action = '入庫' AND invl.created < ? THEN ABS(invl.number) ELSE 0 END), 0) 
                  - COALESCE(SUM(CASE WHEN invl.action = '出庫' AND invl.created < ? THEN ABS(invl.number) ELSE 0 END), 0) AS previous_stock, -- Previous month's stock
              COALESCE(SUM(CASE WHEN invl.action = '入庫' AND invl.created BETWEEN ? AND ? THEN ABS(invl.number) ELSE 0 END), 0) AS monthly_in, -- Incoming stock this month
              COALESCE(SUM(CASE WHEN invl.action = '出庫' AND invl.created BETWEEN ? AND ? THEN ABS(invl.number) ELSE 0 END), 0) AS monthly_out, -- Outgoing stock this month
              COALESCE(SUM(CASE WHEN invl.action = '入庫' AND invl.created < ? THEN ABS(invl.number) ELSE 0 END), 0) 
                  - COALESCE(SUM(CASE WHEN invl.action = '出庫' AND invl.created < ? THEN ABS(invl.number) ELSE 0 END), 0)
                  + COALESCE(SUM(CASE WHEN invl.action = '入庫' AND invl.created BETWEEN ? AND ? THEN ABS(invl.number) ELSE 0 END), 0)
                  - COALESCE(SUM(CASE WHEN invl.action = '出庫' AND invl.created BETWEEN ? AND ? THEN ABS(invl.number) ELSE 0 END), 0) AS end_stock -- End of month stock
          FROM 
              inventory_logs invl
          LEFT JOIN 
              products p ON p.id = invl.product_id
          WHERE 
              1=1
        `;

      const params = [];

      // Dynamic date conditions based on 'created' (YYYY-MM)
      if (conditions["created"]) {
        const [year, month] = conditions["created"].split("-");
        const firstDayOfMonth = `${year}-${month}-01`; // Start of the month
        const lastDayOfMonth = new Date(year, month, 0)
          .toISOString()
          .split("T")[0]; // End of the month
        const lastDayOfPreviousMonth = new Date(year, month - 1, 0)
          .toISOString()
          .split("T")[0]; // End of the previous month

        // Push date parameters for various actions
        params.push(lastDayOfPreviousMonth); // For previous month's stock
        params.push(lastDayOfPreviousMonth); // For previous month's stock (outgoing)
        params.push(firstDayOfMonth); // For incoming this month
        params.push(lastDayOfMonth); // For outgoing this month
        params.push(firstDayOfMonth); // For incoming this month
        params.push(lastDayOfMonth); // For outgoing this month
        params.push(lastDayOfPreviousMonth); // For end of previous month (incoming)
        params.push(lastDayOfPreviousMonth); // For end of previous month (outgoing)
        params.push(firstDayOfMonth); // For this month's incoming stock
        params.push(lastDayOfMonth); // For this month's outgoing stock
        params.push(firstDayOfMonth); // For this month's incoming stock
        params.push(lastDayOfMonth); // For this month's outgoing stock
      }

      // Additional conditions added dynamically
      if (conditions["p.name"]) {
        sql += ` AND p.name LIKE ?`;
        params.push(`%${conditions["p.name"]}%`);
      }
      if (conditions["p.classification_primary"]) {
        sql += ` AND p.classification_primary = ?`;
        params.push(conditions["p.classification_primary"]);
      }
      if (conditions["p.classification_secondary"]) {
        sql += ` AND p.classification_secondary = ?`;
        params.push(conditions["p.classification_secondary"]);
      }
      if (conditions["invl.facility_storage"]) {
        sql += ` AND invl.storage_facility_id = ?`;
        params.push(conditions["invl.facility_storage"]);
      }
      if (conditions["invl.lot_number"]) {
        sql += ` AND invl.lot_number = ?`;
        params.push(conditions["invl.lot_number"]);
      }

      // Grouping and sorting results
      sql += `
          GROUP BY 
              invl.product_id, 
              p.name
          ORDER BY 
              invl.product_id;
        `;

      // Execute the query
      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching filtered inventory logs:", err.message);
          return res
            .status(500)
            .send("Error fetching filtered inventory logs.");
        }
        res.json(rows); // Return the results as a JSON response
      });
    },
  };
};
