module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS inventories (
                id INT AUTO_INCREMENT PRIMARY KEY, -- MySQL equivalent for AUTOINCREMENT
                product_id INT DEFAULT NULL,       -- Foreign key to products (if applicable)
                product_name VARCHAR(255) DEFAULT NULL,
                lot_number VARCHAR(255) DEFAULT NULL,
                inventory INT DEFAULT NULL,
                estimated_inventory INT DEFAULT NULL,
                warning_value INT DEFAULT NULL,
                created DATE DEFAULT CURRENT_DATE,  -- Current date as default for created
                updated DATE DEFAULT CURRENT_DATE,  -- Current date as default for updated
                alert_time DATE DEFAULT NULL,       -- Nullable date for alert time
                estimated_alert_time DATE DEFAULT NULL -- Nullable date for estimated alert time
            );

        `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating inventories table:", err.message);
          return res.status(500).send("Error initializing inventories table.");
        }
        res.send("Inventories table initialized successfully.");
      });
    },

    //Load Inventories
    load: (req, res) => {
      const sql =
        "SELECT * FROM inventories LEFT JOIN products p ON p.id = inventories.product_id ORDER BY inventories.estimated_alert_time ASC";

      db.query(sql, (err, rows) => {
        if (err) {
          console.error("Error loading inventories:", err.message);
          return res.status(500).send("Error loading inventories.");
        }
        res.json(rows);
      });
    },

    // Check if POS API Key is set
    isPosApiKeySet: (req, res) => {
      const sql = "SELECT api_key FROM pos_coordinations LIMIT 1";

      db.query(sql, (err, row) => {
        if (err) {
          console.error("Error checking POS API key:", err.message);
          return res.status(500).send("Error checking POS API key.");
        }
        res.json(!!row.length);
      });
    },

    // Save or update inventory
    saveInventory: (req, res) => {
      const {
        id,
        product_id,
        product_name,
        lot_number,
        inventory,
        estimated_inventory,
        warning_value,
      } = req.body;

      if (id) {
        // Update existing inventory
        const sql = `UPDATE inventories SET 
                product_id = ?,
                product_name = ?, 
                lot_number = ?, 
                inventory = ?, 
                estimated_inventory = ?, 
                warning_value = ?, 
                updated = NOW() 
                WHERE id = ?`;

        db.query(
          sql,
          [
            product_id,
            product_name,
            lot_number,
            inventory,
            estimated_inventory,
            warning_value,
            id,
          ],
          (err) => {
            if (err) {
              console.error("Error updating inventory:", err.message);
              return res.status(500).send("Error updating inventory.");
            }
            res.json({ lastID: id });
          }
        );
      } else {
        // Insert new inventory
        const sql = `INSERT INTO inventories 
                (product_id, product_name, lot_number, inventory, estimated_inventory, warning_value, created, updated) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;

        db.query(
          sql,
          [
            product_id,
            product_name,
            lot_number,
            inventory,
            estimated_inventory,
            warning_value,
          ],
          function (err, result) {
            if (err) {
              console.error("Error inserting inventory:", err.message);
              return res.status(500).send("Error inserting inventory.");
            }
            res.json({ lastID: result.insertId });
          }
        );
      }
    },

    // Add or update estimated inventory number
    addEstimatedInventoryNumber: (req, res) => {
      const {
        product_id,
        product_name,
        lot_number,
        inventory,
        estimated_inventory,
        warning_value,
      } = req.body;

      const findSql = "SELECT * FROM inventories WHERE product_id = ?";
      db.query(findSql, [product_id], (err, rows) => {
        if (err) {
          console.error("Error finding inventory:", err.message);
          return res.status(500).send("Error finding inventory.");
        }

        if (rows.length > 0) {
          const row = rows[0];
          const updatedInventory =
            parseInt(row.estimated_inventory) + parseInt(estimated_inventory);
          const updateSql = `
                    UPDATE inventories 
                    SET estimated_inventory = ?, updated = NOW() 
                    WHERE product_id = ?`;

          db.query(updateSql, [updatedInventory, product_id], (err) => {
            if (err) {
              console.error("Error updating estimated inventory:", err.message);
              return res
                .status(500)
                .send("Error updating estimated inventory.");
            }
            res.json({ lastID: row.id, estimated_inventory: updatedInventory });
          });
        } else {
          const insertSql = `
                    INSERT INTO inventories 
                    (product_id, product_name, lot_number, inventory, estimated_inventory, warning_value, created, updated) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;

          db.query(
            insertSql,
            [
              product_id,
              product_name,
              lot_number,
              inventory,
              estimated_inventory || inventory,
              warning_value,
            ],
            function (err, result) {
              if (err) {
                console.error("Error inserting inventory:", err.message);
                return res.status(500).send("Error inserting inventory.");
              }
              res.json({
                lastID: result.insertId,
                estimated_inventory: estimated_inventory || inventory,
              });
            }
          );
        }
      });
    },

    // Add or update inventory number
    addInventoryNumber: (req, res) => {
      const {
        product_id,
        product_name,
        lot_number,
        inventory,
        estimated_inventory,
        warning_value,
      } = req.body;

      const findSql = "SELECT * FROM inventories WHERE product_id = ?";
      db.query(findSql, [product_id], (err, rows) => {
        if (err) {
          console.error("Error finding inventory:", err.message);
          return res.status(500).send("Error finding inventory.");
        }

        if (rows.length > 0) {
          const row = rows[0];
          const updatedInventory =
            parseInt(row.inventory) + parseInt(inventory);
          const updateSql = `
                    UPDATE inventories 
                    SET inventory = ?, updated = NOW() 
                    WHERE product_id = ?`;

          db.query(updateSql, [updatedInventory, product_id], (err) => {
            if (err) {
              console.error("Error updating inventory:", err.message);
              return res.status(500).send("Error updating inventory.");
            }
            res.json({ lastID: row.id, inventory: updatedInventory });
          });
        } else {
          const insertSql = `
                    INSERT INTO inventories 
                    (product_id, product_name, lot_number, inventory, estimated_inventory, warning_value, created, updated) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;

          db.query(
            insertSql,
            [
              product_id,
              product_name,
              lot_number,
              inventory,
              estimated_inventory || inventory,
              warning_value,
            ],
            function (err, result) {
              if (err) {
                console.error("Error inserting inventory:", err.message);
                return res.status(500).send("Error inserting inventory.");
              }
              res.json({ lastID: result.insertId, inventory: inventory });
            }
          );
        }
      });
    },

    // Update inventory number
    updateInventoryNumber: (req, res) => {
      const {
        product_id,
        product_name,
        lot_number,
        inventory,
        estimated_inventory,
        warning_value,
      } = req.body;

      // Search for inventory by product_id
      const findSql = "SELECT * FROM inventories WHERE product_id = ?";
      db.query(findSql, [product_id], (err, rows) => {
        if (err) {
          console.error("Error finding inventory:", err.message);
          return res.status(500).send("Error finding inventory.");
        }

        if (rows.length > 0) {
          const row = rows[0];
          const updatedInventory = parseInt(inventory);

          const updateSql = `
              UPDATE inventories 
              SET 
                inventory = ?, 
                updated = NOW() 
              WHERE product_id = ?
            `;
          db.query(updateSql, [updatedInventory, product_id], (err) => {
            if (err) {
              console.error("Error updating inventory:", err.message);
              return res.status(500).send("Error updating inventory.");
            }
            res.json({
              lastID: row.id,
              inventory: updatedInventory,
            });
          });
        } else {
          // If no matching inventory is found, insert a new entry
          const insertSql = `
              INSERT INTO inventories 
              (product_id, product_name, lot_number, inventory, estimated_inventory, warning_value, created, updated) 
              VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
          db.query(
            insertSql,
            [
              product_id,
              product_name,
              lot_number,
              inventory,
              estimated_inventory || inventory,
              warning_value,
            ],
            (err, result) => {
              if (err) {
                console.error("Error inserting inventory:", err.message);
                return res.status(500).send("Error inserting inventory.");
              }
              res.json({
                lastID: result.insertId,
                inventory: inventory,
              });
            }
          );
        }
      });
    },

    // Subtract estimated inventory number
    subtractEstimatedInventoryNumber: (req, res) => {
      const {
        product_id,
        product_name,
        lot_number,
        inventory,
        estimated_inventory,
        warning_value,
      } = req.body;

      // Search for inventory by product_id
      const findSql = "SELECT * FROM inventories WHERE product_id = ?";
      db.query(findSql, [product_id], (err, rows) => {
        if (err) {
          console.error("Error finding inventory:", err.message);
          return res.status(500).send("Error finding inventory.");
        }

        if (rows.length > 0) {
          const row = rows[0];
          const updatedInventory =
            parseInt(row.estimated_inventory) - parseInt(estimated_inventory);

          let updateSql = `
              UPDATE inventories 
              SET estimated_inventory = ?, 
                  updated = NOW()
            `;
          const params = [updatedInventory, row.id];

          // Set estimated_alert_time if the updated inventory is below the warning value
          if (updatedInventory < parseInt(row.warning_value)) {
            updateSql += `, estimated_alert_time = NOW()`;
          }

          updateSql += ` WHERE id = ?`;

          db.query(updateSql, params, (err) => {
            if (err) {
              console.error("Error updating estimated inventory:", err.message);
              return res
                .status(500)
                .send("Error updating estimated inventory.");
            }
            res.json({
              id: row.id,
              product_name: product_name,
              estimated_inventory: updatedInventory,
            });
          });
        } else {
          // If no matching inventory is found, insert a new entry
          const insertSql = `
              INSERT INTO inventories 
              (product_id, product_name, lot_number, inventory, estimated_inventory, warning_value, created, updated) 
              VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
          db.query(
            insertSql,
            [
              product_id,
              product_name,
              lot_number,
              inventory,
              estimated_inventory || inventory,
              warning_value,
            ],
            (err, result) => {
              if (err) {
                console.error("Error inserting inventory:", err.message);
                return res.status(500).send("Error inserting inventory.");
              }
              res.json({
                lastID: result.insertId,
                estimated_inventory: estimated_inventory || inventory,
              });
            }
          );
        }
      });
    },

    // Subtract inventory number
    subtractInventoryNumber: (req, res) => {
      const {
        product_id,
        product_name,
        lot_number,
        inventory,
        estimated_inventory,
        warning_value,
      } = req.body;

      // Search for inventory by product_id
      const findSql = "SELECT * FROM inventories WHERE product_id = ?";
      db.query(findSql, [product_id], (err, rows) => {
        if (err) {
          console.error("Error finding inventory:", err.message);
          return res.status(500).send("Error finding inventory.");
        }

        if (rows.length > 0) {
          const row = rows[0];
          const updatedInventory =
            parseInt(row.inventory) - parseInt(inventory);

          const updateSql = `
              UPDATE inventories 
              SET 
                  inventory = ?, 
                  updated = NOW() 
              WHERE product_id = ?
            `;
          db.query(updateSql, [updatedInventory, product_id], (err) => {
            if (err) {
              console.error("Error updating inventory:", err.message);
              return res.status(500).send("Error updating inventory.");
            }
            res.json({
              lastID: row.id,
              inventory: updatedInventory,
            });
          });
        } else {
          // If no matching inventory is found, insert a new entry
          const insertSql = `
              INSERT INTO inventories 
              (product_id, product_name, lot_number, inventory, estimated_inventory, warning_value, created, updated) 
              VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
          db.query(
            insertSql,
            [
              product_id,
              product_name,
              lot_number,
              inventory,
              estimated_inventory || inventory,
              warning_value,
            ],
            (err, result) => {
              if (err) {
                console.error("Error inserting inventory:", err.message);
                return res.status(500).send("Error inserting inventory.");
              }
              res.json({
                lastID: result.insertId,
                inventory: inventory,
              });
            }
          );
        }
      });
    },

    // Delete inventory by ID
    deleteInventoryById: (req, res) => {
      const { id } = req.params; // Assuming the id is passed as a URL parameter

      const sql = `DELETE FROM inventories WHERE id = ?`;
      db.query(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting inventory:", err.message);
          return res.status(500).send("Error deleting inventory.");
        }
        res.send({ message: "Inventory deleted successfully." });
      });
    },

    // Edit inventory by ID
    editInventory: (req, res) => {
      const { id } = req.params; // Assuming the id is passed as a URL parameter

      const sql = `SELECT * FROM inventories WHERE id = ?`;
      db.query(sql, [id], (err, rows) => {
        if (err) {
          console.error("Error fetching inventory:", err.message);
          return res.status(500).send("Error fetching inventory.");
        }

        if (rows.length === 0) {
          return res.status(404).send("Inventory not found.");
        }

        res.json(rows[0]);
      });
    },

    // Search inventories
    searchInventories: (req, res) => {
      const { product_name, lot_number } = req.query; // Assuming the search query is passed as a URL query parameter (e.g., ?query=example)

      let sql;
      let params = [];

      // If a query is provided, search using LIKE for the relevant columns
      if ((product_name || lot_number).trim() !== "") {
        sql = `
            SELECT * FROM inventories 
            WHERE product_name LIKE ? 
            OR lot_number LIKE ? 
          `;
        params = [
          product_name || "%", // Fallback to '%' if the query is not provided
          lot_number || "%",
        ];
      } else {
        sql = `SELECT * FROM inventories`; // Return all inventories if no query is provided
      }

      db.query(sql, params, (err, rows) => {
        if (err) {
          console.error("Error searching inventories:", err.message);
          return res.status(500).send("Error searching inventories.");
        }

        res.json(rows); // Return the results as JSON
      });
    },

    // subtractInventoryByProductName
    subtractInventoryByProductName: (req, res) => {
      const { product_name, quantity } = req.body;

      const findSql = `SELECT * FROM inventories WHERE product_name = ? LIMIT 1`;

      // Search for the inventory by product name
      db.query(findSql, [product_name], (err, rows) => {
        if (err) {
          console.error(
            "Error searching inventory by product name:",
            err.message
          );
          return res.status(500).send("Error searching inventory.");
        }

        if (rows.length > 0) {
          const row = rows[0];
          const updatedInventory =
            parseInt(row.estimated_inventory) - parseInt(quantity);

          // Handle case where estimated_inventory would become negative
          if (updatedInventory < 0) {
            return res
              .status(400)
              .send(
                "Insufficient inventory to subtract the specified quantity."
              );
          }

          let updateSql = `
              UPDATE inventories 
              SET estimated_inventory = ?, 
                  updated = NOW()
            `;
          const params = [updatedInventory, row.id];

          // Set estimated_alert_time if inventory goes below warning_value
          if (updatedInventory < parseInt(row.warning_value)) {
            updateSql += `, estimated_alert_time = NOW()`;
          }

          updateSql += ` WHERE id = ?`;

          db.query(updateSql, params, (err) => {
            if (err) {
              console.error("Error updating inventory:", err.message);
              return res.status(500).send("Error updating inventory.");
            }

            res.json({
              id: row.id,
              product_name: product_name,
              estimated_inventory: updatedInventory,
            });
          });
        } else {
          return res
            .status(404)
            .send(`Product "${product_name}" not found in inventories.`);
        }
      });
    },
  };
};
