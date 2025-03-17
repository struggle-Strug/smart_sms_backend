const axios = require("axios");

module.exports = (db) => {
  return {
    // Initialize the database table
    init: (req, res) => {
      const sql = `
            CREATE TABLE IF NOT EXISTS deposit_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                amount TEXT DEFAULT NULL,
                balance INT DEFAULT NULL,
                debitCreditTypeCode TEXT DEFAULT NULL,
                memo TEXT DEFAULT NULL,
                remarks TEXT DEFAULT NULL,
                settlementDate TEXT DEFAULT NULL,
                transactionId TEXT DEFAULT NULL,
                transactionType TEXT DEFAULT NULL,
                valueDate TEXT DEFAULT NULL,
                status BOOLEAN DEFAULT FALSE,
                invoice_id TEXT DEFAULT NULL,
                deposit_id TEXT DEFAULT NULL,
                created DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;

      db.query(sql, (err) => {
        if (err) {
          console.error(
            "Error creating depositTransactions table:",
            err.message
          );
          return res
            .status(500)
            .send("Error initializing depositTransactions table.");
        }
        res.send("DepositTransactions table initialized successfully.");
      });
    },

    // Load Transactions
    loadTransactions: (req, res) => {
      const sql = `SELECT * FROM deposit_transactions 
                     LEFT JOIN invoices iv ON iv.id = deposit_transactions.invoice_id`;

      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error("Error loading transactions:", err.message);
          return res.status(500).send("Error loading transactions.");
        }
        res.json(rows);
      });
    },

    // Get Transaction by ID
    getTransactionById: (req, res) => {
      const { id } = req.params;
      const sql = "SELECT * FROM deposit_transactions WHERE id = ?";

      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error("Error retrieving transaction by ID:", err.message);
          return res.status(500).send("Error retrieving transaction by ID.");
        }
        res.json(row);
      });
    },

    // Save Transaction
    saveTransaction: (req, res) => {
      const transactionData = req.body;
      const {
        id,
        amount,
        balance,
        debitCreditTypeCode,
        memo,
        remarks,
        settlementDate,
        transactionId,
        transactionType,
        valueDate,
        status,
        invoice_id,
        deposit_id,
      } = transactionData;

      if (id) {
        db.run(
          `UPDATE deposit_transactions 
             SET amount = ?, balance = ?, debitCreditTypeCode = ?, memo = ?, 
                 remarks = ?, settlementDate = ?, transactionId = ?, transactionType = ?, 
                 valueDate = ?, status = ?, invoice_id = ?, deposit_id = ?, updated = datetime('now') 
             WHERE id = ?`,
          [
            amount,
            balance,
            debitCreditTypeCode,
            memo,
            remarks,
            settlementDate,
            transactionId,
            transactionType,
            valueDate,
            status,
            invoice_id,
            deposit_id,
            id,
          ],
          (err) => {
            if (err) {
              console.error("Error updating transaction:", err.message);
              return res.status(500).send("Error updating transaction.");
            }
            res.send("Transaction updated successfully.");
          }
        );
      } else {
        db.run(
          `INSERT INTO deposit_transactions 
             (amount, balance, debitCreditTypeCode, memo, remarks, settlementDate, 
              transactionId, transactionType, valueDate, status, invoice_id, deposit_id, created, updated) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            amount,
            balance,
            debitCreditTypeCode,
            memo,
            remarks,
            settlementDate,
            transactionId,
            transactionType,
            valueDate,
            status,
            invoice_id,
            deposit_id,
          ],
          (err) => {
            if (err) {
              console.error("Error inserting transaction:", err.message);
              return res.status(500).send("Error inserting transaction.");
            }
            res.send("Transaction saved successfully.");
          }
        );
      }
    },

    // Delete Transaction by ID
    deleteTransactionById: (req, res) => {
      const { id } = req.params;
      const sql = "DELETE FROM deposit_transactions WHERE id = ?";

      db.run(sql, [id], (err) => {
        if (err) {
          console.error("Error deleting transaction:", err.message);
          return res.status(500).send("Error deleting transaction.");
        }
        res.send("Transaction deleted successfully.");
      });
    },

    // Fetch and Insert Transactions
    fetchAndInsertTransactions: async (req, res) => {
      try {
        const apiKey = await getApiKey();

        if (!apiKey) {
          return res.status(400).send("API key not found.");
        }

        const response = await axios.get(
          "https://developer.api.bk.mufg.jp/btmu/retail/trial/v2/me/accounts/001001110001/transactions?inquiryDateFrom=2021-12-20&inquiryDateTo=2021-12-27",
          {
            headers: {
              "X-IBM-Client-Id": apiKey,
              "X-BTMU-Seq-No": "20200514-0000000123456789",
              Accept: "application/json",
            },
          }
        );

        const transactions = response.data.transactions;

        for (const transaction of transactions) {
          const {
            transactionId,
            amount,
            balance,
            memo,
            remarks,
            settlementDate,
            transactionType,
            valueDate,
            status,
          } = transaction;

          const exists = await getAllTransactions(
            transactionId,
            settlementDate,
            remarks
          );

          if (exists.length === 0) {
            await new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO deposit_transactions (transactionId, amount, balance, memo, remarks, settlementDate, transactionType, valueDate, status, invoice_id, deposit_id, created, updated)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [
                  transactionId,
                  amount,
                  balance,
                  memo,
                  remarks,
                  settlementDate,
                  transactionType,
                  valueDate,
                  status,
                  null,
                  null,
                ],
                (err) => (err ? reject(err) : resolve())
              );
            });
          }
        }

        db.all("SELECT * FROM deposit_transactions", [], (err, rows) => {
          if (err) {
            console.error("Error retrieving transactions:", err.message);
            return res.status(500).send("Error retrieving transactions.");
          }
          res.json(rows);
        });
      } catch (error) {
        console.error(
          "Error fetching or inserting transactions:",
          error.message
        );
        res.status(500).send("Error processing transactions.");
      }
    },

    // Update Transaction Status
    updateTransactionStatus: (req, res) => {
      const { id } = req.params;
      db.run(
        "UPDATE deposit_transactions SET status = 1, updated = datetime('now') WHERE id = ?",
        [id],
        (err) => {
          if (err) {
            return res.status(500).send("Error updating transaction status.");
          }
          res.send("Transaction status updated successfully.");
        }
      );
    },

    // Update Invoice ID
    updateInvoiceId: (req, res) => {
      const { id } = req.params;
      const { invoice_id } = req.body;
      db.run(
        "UPDATE deposit_transactions SET invoice_id = ?, updated = datetime('now') WHERE id = ?",
        [invoice_id, id],
        (err) => {
          if (err) {
            return res.status(500).send("Error updating invoice ID.");
          }
          res.send("Invoice ID updated successfully.");
        }
      );
    },

    // Update Deposit ID
    updateDepositId: (req, res) => {
      const { id } = req.params;
      const { deposit_id } = req.body;
      db.run(
        "UPDATE deposit_transactions SET deposit_id = ?, updated = datetime('now') WHERE id = ?",
        [deposit_id, id],
        (err) => {
          if (err) {
            return res.status(500).send("Error updating deposit ID.");
          }
          res.send("Deposit ID updated successfully.");
        }
      );
    },

    // Search Transactions
    searchTransactions: (req, res) => {
      const { memo, remarks, transactionId } = req.query;
      let sql;
      let params = [];

      if ((memo || remarks || transactionId).trim() !== "") {
        sql = `
            SELECT * FROM deposit_transactions 
            WHERE memo LIKE ? OR remarks LIKE ? OR transactionId LIKE ?
            `;
        params = Array(3).fill(`%${query}%`);
      } else {
        sql = `SELECT * FROM deposit_transactions`;
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).send("Error searching transactions.");
        }
        res.json(rows);
      });
    },

    // Check if API Key is set
    isApiKeySet: (req, res) => {
      db.get("SELECT api_key FROM bank_apis LIMIT 1", [], async (err, row) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).send("Database error.");
        } else if (!row || !row.api_key) {
          return res.json(false);
        } else {
          try {
            const response = await axios({
              method: "GET",
              url: "https://developer.api.bk.mufg.jp/btmu/retail/trial/v2/me/accounts/001001110001/transactions?inquiryDateFrom=2021-12-20&inquiryDateTo=2021-12-27",
              headers: {
                "X-IBM-Client-Id": row.api_key,
                "X-BTMU-Seq-No": "20200514-0000000123456789",
                Accept: "application/json",
              },
            });

            return res.json(response.status === 200);
          } catch (error) {
            console.error("API connection error:", error);
            return res.json(false);
          }
        }
      });
    },
  };
};

function getApiKey() {
  return new Promise((resolve, reject) => {
    db.get("SELECT api_key FROM bank_apis LIMIT 1", [], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.api_key);
      }
    });
  });
}

// Get All Transactions by Criteria
async function getAllTransactions(transactionId, settlementDate, remarks) {
  db.all(
    "SELECT * FROM deposit_transactions WHERE transactionId = ? AND settlementDate = ? AND remarks = ?",
    [transactionId, settlementDate, remarks],
    (err, rows) => {
      if (err) {
        return res.status(500).send("Error retrieving transactions.");
      }
      return rows;
    }
  );
}
