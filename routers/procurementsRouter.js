const express = require("express");
const router = express.Router();

// Export the router as a function to accept `db`
module.exports = (db) => {
  const purchaseOrders =
    require("../controllers/procurementsController/purchaseOrders")(db);
  const productizationOrders =
    require("../controllers/procurementsController/productizationOrders")(db);
  const purchaseInvocies =
    require("../controllers/procurementsController/purchaseInvocies")(db);
  const stockInOutSlips =
    require("../controllers/procurementsController/stockInOutSlips")(db);
  const paymentVouchers =
    require("../controllers/procurementsController/paymentVouchers")(db);
  const purchaseOrderDetails =
    require("../controllers/procurementsController/purchaseOrderDetails")(db);
  const productizationOrderDetails =
    require("../controllers/procurementsController/productizationOrderDetails")(
      db
    );
  const purchaseInvoiceDetails =
    require("../controllers/procurementsController/purchaseInvoiceDetails")(db);
  const stockInOutSlipDetails =
    require("../controllers/procurementsController/stockInOutSlipDetails")(db);
  const paymentVoucherDetails =
    require("../controllers/procurementsController/paymentVoucherDetails")(db);
  const statementSettings =
    require("../controllers/procurementsController/statementSettings")(db);
  const posPvsMappings =
    require("../controllers/procurementsController/posPvsMappings")(db);
  const inventories =
    require("../controllers/procurementsController/inventories")(db);
  const inventoryLog =
    require("../controllers/procurementsController/inventoryLogs")(db);
  const squareLogs =
    require("../controllers/procurementsController/squareLogs")(db);

  // Define routes and use the controller methods
  router.post("/purchaseOrders/init", purchaseOrders.init);
  router.post(
    "/purchaseOrders/pv/search",
    purchaseOrders.searchPurchaseOrdersOnPV
  );
  router.post("/purchaseOrders/:id", purchaseOrders.deletePurchaseOrderById);
  router.post("/purchaseOrders/", purchaseOrders.savePurchaseOrder);
  router.put("/purchaseOrders/", purchaseOrders.updatePurchaseOrderStatus);
  router.post("/productizationOrder/init", productizationOrders.init);
  router.post(
    "/productizationOrder/:id",
    productizationOrders.deleteProductizationOrderById
  );
  router.post(
    "/productizationOrder/",
    productizationOrders.saveProductizationOrder
  );
  router.post("/purchaseInvoice/init", purchaseInvocies.init);
  router.post(
    "/purchaseInvoice/:id",
    purchaseInvocies.deletePurchaseInvoiceById
  );
  router.post("/purchaseInvoice/", purchaseInvocies.savePurchaseInvoice);
  router.put("/purchaseInvoice/", purchaseInvocies.updatePurchaseInvoiceStatus);
  router.post("/stockInOutSlip/init", stockInOutSlips.init);
  router.post("/stockInOutSlip/:id", stockInOutSlips.deleteStockInOutSlipById);
  router.post("/stockInOutSlip/", stockInOutSlips.saveStockInOutSlip);
  router.post("/paymentVoucher/init", paymentVouchers.init);
  router.post("/paymentVoucher/:id", paymentVouchers.deletePaymentVoucherById);
  router.post("/paymentVoucher/", paymentVouchers.savePaymentVoucher);
  router.put(
    "/purchaseOrderDetail/",
    purchaseOrderDetails.editPurchaseOrdersDetail
  );
  router.post("/purchaseOrderDetail/init", purchaseOrderDetails.init);
  router.post(
    "/purchaseOrderDetail/search",
    purchaseOrderDetails.searchPurchaseOrderDetails
  );
  router.post(
    "/purchaseOrderDetail/po/:id",
    purchaseOrderDetails.searchPurchaseOrdersByPurchaseOrderId
  );
  router.post(
    "/purchaseOrderDetail/:id",
    purchaseOrderDetails.deletePurchaseOrderDetailById
  );
  router.post(
    "/purchaseOrderDetail/",
    purchaseOrderDetails.savePurchaseOrderDetail
  );
  router.post(
    "/productizationOrderDetail/init",
    productizationOrderDetails.init
  );
  router.post(
    "/productizationOrderDetail/filter",
    productizationOrderDetails.searchProductizationOrderDetails
  );
  router.post(
    "/productizationOrderDetail/:id",
    productizationOrderDetails.deleteProductizationOrderDetailById
  );
  router.post(
    "/productizationOrderDetail/",
    productizationOrderDetails.saveProductizationOrderDetail
  );
  router.post("/purchaseInvoiceDetails/init", purchaseInvoiceDetails.init);
  router.post(
    "/purchaseInvoiceDetails/pi/:id",
    purchaseInvoiceDetails.deletePurchaseInvoiceDetailById
  );
  
  router.post(
    "/purchaseInvoiceDetails/:id",
    purchaseInvoiceDetails.deletePurchaseInvoiceDetailById
  );
  router.post(
    "/purchaseInvoiceDetails/",
    purchaseInvoiceDetails.savePurchaseInvoiceDetail
  );

  router.post(
    "/stockInOutSlipDetail/si/:id",
    stockInOutSlipDetails.deleteStockInOutSlipDetailsBySlipId
  );
  router.post(
    "/stockInOutSlipDetail/search",
    stockInOutSlipDetails.searchStockInOutSlipDetails
  );
  router.post("/stockInOutSlipDetail/init", stockInOutSlipDetails.init);
  router.post(
    "/stockInOutSlipDetail/:id",
    stockInOutSlipDetails.deleteStockInOutSlipDetailById
  );
  router.post(
    "/stockInOutSlipDetail/",
    stockInOutSlipDetails.saveStockInOutSlipDetail
  );
  router.post("/paymentVoucherDetail/init", paymentVoucherDetails.init);
  router.post(
    "/paymentVoucherDetail/searchByData",
    paymentVoucherDetails.searchPaymentVoucherDetails
  );
  router.post(
    "/paymentVoucherDetail/:id",
    paymentVoucherDetails.deletePaymentVoucherDetailById
  );
  router.post(
    "/paymentVoucherDetail/",
    paymentVoucherDetails.savePaymentVoucherDetail
  );
  router.post("/statementSetting/init", statementSettings.init);
  router.post(
    "/statementSetting/:id",
    statementSettings.deleteStatementSettingById
  );
  router.post("/statementSetting/", statementSettings.saveStatementSetting);
  router.post(
    "/posPvsMapping/pvsId/:id",
    posPvsMappings.deletePosPvsMappingsByPvsId
  );
  router.post("/posPvsMapping/init", posPvsMappings.init);
  router.post("/posPvsMapping/:id", posPvsMappings.deletePosPvsMappingById);
  router.post("/posPvsMapping/", posPvsMappings.savePosPvsMapping);
  router.post(
    "/inventory/subtractEstimated",
    inventories.subtractEstimatedInventoryNumber
  );
  router.post(
    "/inventory/addEstimated",
    inventories.addEstimatedInventoryNumber
  );
  router.post("/inventory/subtract", inventories.subtractInventoryNumber);
  router.post("/inventory/update", inventories.updateInventoryNumber);
  router.post("/inventory/init", inventories.init);
  router.post("/inventory/:id", inventories.deleteInventoryById);
  router.post("/inventory/", inventories.saveInventory);
  router.post("/inventoryLog/init", inventoryLog.init);
  router.post("/inventoryLog/filter", inventoryLog.getFilteredInventoryLogs);
  router.post("/inventoryLog/:id", inventoryLog.deleteInventoryLogById);
  router.post("/squareLog/init", squareLogs.init);
  router.post("/squareLog/:id", squareLogs.deleteSquareLogById);
  router.post("/squareLog/", squareLogs.saveSquareLog);
  router.get(
    "/stockInOutSlipDetail/si",
    stockInOutSlipDetails.searchStockInOutSlipDetailsBySlipId
  );

  router.get(
    "/stockInOutSlipDetail/:id",
    stockInOutSlipDetails.getStockInOutSlipDetailById
  );
  router.get(
    "/stockInOutSlipDetail/",
    stockInOutSlipDetails.loadStockInOutSlipDetails
  );
  router.get("/stockInOutSlip/search", stockInOutSlips.searchStockInOutSlips);
  router.get("/stockInOutSlip/:id", stockInOutSlips.getStockInOutSlipById);
  router.get("/stockInOutSlip/", stockInOutSlips.loadStockInOutSlips);

  router.get(
    "/statementSetting/:id",
    statementSettings.getStatementSettingById
  );
  router.get("/statementSetting/", statementSettings.loadStatementSettings);

  router.get("/squareLog/search", squareLogs.searchSquareLogs);
  router.get("/squareLog/latest", squareLogs.getLatestLogByRequestDateTime);
  router.get("/squareLog/:id", squareLogs.editSquareLog);
  router.get("/squareLog/", squareLogs.loadSquareLogs);
  router.get(
    "/purchaseOrderDetail/venderId/search",
    purchaseOrderDetails.searchPurchaseOrderDetails
  );

  router.get(
    "/purchaseOrderDetail/:id",
    purchaseOrderDetails.getPurchaseOrderDetailById
  );
  router.get(
    "/purchaseOrderDetail/",
    purchaseOrderDetails.loadPurchaseOrderDetails
  );

  router.get("/purchaseOrders/search", purchaseOrders.searchPurchaseOrders);
  router.get("/purchaseOrders/:id", purchaseOrders.getPurchaseOrderById);
  router.get("/purchaseOrders/", purchaseOrders.loadPurchaseOrders);
  router.get(
    "/purchaseInvoiceDetails/pi/search",
    purchaseInvoiceDetails.searchPurchaseInvoicesByPurchaseInvoiceId
  );
  router.get(
    "/purchaseInvoiceDetails/search",
    purchaseInvoiceDetails.searchPurchaseInvoiceDetails
  );
  router.get(
    "/purchaseInvoiceDetails/:id",
    purchaseInvoiceDetails.getPurchaseInvoiceDetailById
  );
  router.get(
    "/purchaseInvoiceDetails/",
    purchaseInvoiceDetails.loadPurchaseInvoiceDetails
  );
  router.get(
    "/purchaseInvoice/search",
    purchaseInvocies.searchPurchaseInvoices
  );
  router.get("/purchaseInvoice/:id", purchaseInvocies.getPurchaseInvoiceById);
  router.get("/purchaseInvoice/", purchaseInvocies.loadPurchaseInvoices);

  router.get(
    "/productizationOrderDetail/search",
    productizationOrderDetails.searchProductizationOrdersByProductizationOrderId
  );

  router.get(
    "/productizationOrderDetail/:id",
    productizationOrderDetails.loadProductizationOrderDetails
  );
  router.get(
    "/productizationOrderDetail/",
    productizationOrderDetails.loadProductizationOrderDetails
  );
  router.get(
    "/productizationOrder/search",
    productizationOrders.searchProductizationOrders
  );
  router.get(
    "/productizationOrder/:id",
    productizationOrders.getProductizationOrderById
  );
  router.get(
    "/productizationOrder/",
    productizationOrders.loadProductizationOrders
  );
  router.get(
    "/posPvsMapping/pvsId/search",
    posPvsMappings.searchPosPvsMappingsByPvsId
  );
  router.get(
    "/posPvsMapping/posId/search",
    posPvsMappings.searchPosPvsMappingsByPos
  );
  router.get("/posPvsMapping/search", posPvsMappings.searchPosPvsMappings);
  router.get("/posPvsMapping/:id", posPvsMappings.getPosPvsMappingById);
  router.get("/posPvsMapping/", posPvsMappings.loadPosPvsMappings);
  router.get("/paymentVoucher/search", paymentVouchers.searchPaymentVouchers);
  router.get("/paymentVoucher/:id", paymentVouchers.getPaymentVoucherById);
  router.get("/paymentVoucher/", paymentVouchers.loadPaymentVouchers);

  router.get(
    "/paymentVoucherDetail/search",
    paymentVoucherDetails.searchPaymentVouchersByPaymentVoucherId
  );
  router.get(
    "/paymentVoucherDetail/:id",
    paymentVoucherDetails.getPaymentVoucherDetailById
  );
  router.get(
    "/paymentVoucherDetail/",
    paymentVoucherDetails.loadPaymentVoucherDetails
  );
  router.get("/inventoryLog/search", inventoryLog.saveInventoryLog);
  router.get("/inventoryLog/grouped", inventoryLog.getGroupedInventoryLogs);
  router.get("/inventoryLog/:id", inventoryLog.editInventoryLog);
  router.get("/inventoryLog/", inventoryLog.loadInventoryLogs);
  router.get("/inventory/pos-api-setting", inventories.isPosApiKeySet);
  router.get("/inventory/search", inventories.searchInventories);
  router.get("/inventory/:id", inventories.editInventory);
  router.get("/inventory/", inventories.load);
  return router;
};
