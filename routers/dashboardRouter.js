const express = require("express");
const router = express.Router();

// Export the router as a function to accept `db`
module.exports = (db) => {
    
  const salesTaxSettings = require("../controllers/dashboardController/salesTaxSettings")(db);
  const dataConversions = require("../controllers/dashboardController/dataConversions")(db);
  const adminSettings = require("../controllers/dashboardController/adminSettings")(db);
  const posCoordinationSettings = require("../controllers/dashboardController/posCoordinationSettings")(db);
  const bankApiSettings = require("../controllers/dashboardController/bankApiSettings")(db);
  const backupsSettings = require("../controllers/dashboardController/backupsSettings")(db);
    
  // Define routes and use the controller methods
  router.post("/adminSetting/init", adminSettings.init);
  router.post("/adminSetting/login", adminSettings.checkLogin);
  router.post("/adminSetting/", adminSettings.save);
  router.post("/salesTax/init", salesTaxSettings.init);
  router.post("/salesTax/:id", salesTaxSettings.deleteById);
  router.post("/salesTax/", salesTaxSettings.save);
  router.post("/dataConversion/init", dataConversions.init);
  router.post("/dataConversion/import", dataConversions.importExcelToDatabase);
  router.post("/posCoordinator/init", posCoordinationSettings.init);
  router.post("/posCoordinator/:id", posCoordinationSettings.deleteById);
  router.post("/posCoordinator/", posCoordinationSettings.save);
  router.post("/bankApiSetting/init", bankApiSettings.init);
  router.post("/bankApiSetting/:id", bankApiSettings.deleteById);
  router.post("/bankApiSetting/", bankApiSettings.save);
  router.post("/backupSetting/convert", backupsSettings.convertToCSV);
  router.post("/backupSetting/importallcsv", backupsSettings.importAllCsvToDatabase);
  router.post("/backupSetting/importalldata", backupsSettings.loadAllTablesDataAndExportToCSV);
  router.post("/backupSetting/import", backupsSettings.importCsvToTable);
  router.get("/salesTax/:id", salesTaxSettings.getById);
  router.get("/salesTax/", salesTaxSettings.load);
  router.get("/posCoordinator/:id", posCoordinationSettings.getById);
  router.get("/posCoordinator/", posCoordinationSettings.load);
  router.get("/dataConversion/", dataConversions.loadDataConversions);
  router.get("/backupSetting/", backupsSettings.loadAllTablesData);
  router.get("/bankApiSetting/:id", bankApiSettings.getById);
  router.get("/bankApiSetting/", bankApiSettings.load);
  router.get("/adminSetting/:id", adminSettings.getById);
  router.get("/adminSetting/", adminSettings.load);


  return router;
};
