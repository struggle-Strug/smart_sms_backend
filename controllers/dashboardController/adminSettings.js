module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY, -- ユーザーID
                user_name VARCHAR(255) DEFAULT NULL, -- ユーザー名
                access_level VARCHAR(255) DEFAULT NULL, -- アクセスレベル
                password VARCHAR(255) DEFAULT NULL -- パスワード
            );
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error("Error creating adminSettings table:", err.message);
          return res
            .status(500)
            .send("Error initializing adminSettings table.");
        }
        res.send("AdminSettings table initialized successfully.");
      });
    },

    // Load admin settings from the database
    load: (req, res) => {
      const sql = "SELECT * FROM users";
      db.query(sql, (err, rows) => {
        if (err) {
          console.error("Error loading admin settings:", err.message);
          return res.status(500).send("Error loading admin settings.");
        }
        res.json(rows);
      });
    },

    //Get AdminSetting By ID
    getById: (req, res) => {
      const id = req.params.id;
      const sql = "SELECT * FROM users WHERE id = ?";
      db.query(sql, [id], (err, rows) => {
        if (err) {
          console.error("Error fetching admin setting:", err.message);
          return res.status(500).send("Error fetching admin setting.");
        }
        res.json(rows[0]);
      });
    },

    //Save
    save: (req, res) => {
      const { id, user_name, access_level, password } = req.body;
      let sql, params;

      if (id) {
        // Update existing admin setting
        sql = `UPDATE users SET user_name = ?, access_level = ?, password = ? WHERE id = ?`;
        params = [user_name, access_level, password, id];
      } else {
        // Insert new admin setting
        sql = `INSERT INTO users (user_name, access_level, password) VALUES (?, ?, ?)`;
        params = [user_name, access_level, password];
      }

      db.query(sql, params, (err) => {
        if (err) {
          console.error("Error saving admin setting:", err.message);
          return res.status(500).send("Error saving admin setting.");
        }
        res.send("Admin setting saved successfully.");
      });
    },

    //Check Login
    checkLogin: (req, res) => {
      const { user_name, password } = req.body;
      const sql = "SELECT * FROM users WHERE user_name = ? AND password = ?";
      db.query(sql, [user_name, password], (err, rows) => {
        if (err) {
          console.error("Error checking login:", err.message);
          return res.status(500).send("Error checking login.");
        }
        if (rows.length > 0) {
          res.json({ success: true, user_id: rows[0].id });
        } else {
          res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });
        }
      });
    },
  };
};
