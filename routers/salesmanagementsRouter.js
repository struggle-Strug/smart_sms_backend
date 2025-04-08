const express = require("express");
const router = express.Router();

// Export the router as a function to accept `db`
module.exports = (db) => {
  const estimationSlips =
    require("../controllers/salesmanagementsController/estimationSlips")(db);
  const estimationSlipDetails =
    require("../controllers/salesmanagementsController/estimationSlipDetails")(
      db
    );
  const depositSlips =
    require("../controllers/salesmanagementsController/depositSlips")(db);
  const depositSlipDetails =
    require("../controllers/salesmanagementsController/depositSlipDetails")(db);
  const orderSlips =
    require("../controllers/salesmanagementsController/orderSlips")(db);
  const orderSlipDetails =
    require("../controllers/salesmanagementsController/orderSlipDetails")(db);
  const salesSlips =
    require("../controllers/salesmanagementsController/salesSlips")(db);
  const salesSlipDetails =
    require("../controllers/salesmanagementsController/salesSlipDetails")(db);
  const invoices =
    require("../controllers/salesmanagementsController/invoices")(db);
  const depositTransctions =
    require("../controllers/salesmanagementsController/depositTransctions")(db);

  // Define routes and use the controller methods
  router.post(
    "/estimationSlip/pv/search",
    estimationSlips.searchEstimationSlipsOnPV
  );
  router.post("/estimationSlip/init", estimationSlips.init);
  router.post("/estimationSlip/:id", estimationSlips.deleteEstimationSlipById);
  router.post("/estimationSlip/", estimationSlips.saveEstimationSlip);
  router.put(
    "/estimationSlip/status",
    estimationSlips.updateEstimationSlipStatus
  );
  
  router.post("/estimationSlipDetail/init", estimationSlipDetails.init);
  router.post(
    "/estimationSlipDetail/search",
    estimationSlipDetails.searchEstimationSlipDetails
  );
  router.post(
    "/estimationSlipDetail/si/:id",
    estimationSlipDetails.deleteEstimationSlipDetailsByEsId
  );
  router.post(
    "/estimationSlipDetail/:id",
    estimationSlipDetails.deleteEstimationSlipDetailById
  );
  router.post(
    "/estimationSlipDetail/",
    estimationSlipDetails.saveEstimationSlipDetail
  );
  router.post("/depositSlip/init", depositSlips.init);
  router.post("/depositSlip/:id", depositSlips.deleteDepositSlipById);
  router.post("/depositSlip/", depositSlips.saveDepositSlip);
  router.post(
    "/depositSlipDetail/si/:id",
    depositSlipDetails.deleteDepositSlipDetailsBySlipId
  );
  router.post(
    "/depositSlipDetail/search",
    depositSlipDetails.searchDepositSlipsDetails
  );

  router.post("/depositSlipDetail/init", depositSlipDetails.init);
  router.post(
    "/depositSlipDetail/sum-yes",
    depositSlipDetails.getDepositsTotalYesterdayByVendorIds
  );
  router.post(
    "/depositSlipDetail/sum",
    depositSlipDetails.getDepositsTotalByVendorIds
  );
  router.post(
    "/depositSlipDetail/:id",
    depositSlipDetails.deleteDepositSlipDetailById
  );
  router.post("/depositSlipDetail/", depositSlipDetails.saveDepositSlipDetail);
  router.post("/orderSlip/init", orderSlips.init);
  router.post("/orderSlip/search/", orderSlips.searchOrderSlipsOnPV);
  router.post("/orderSlip/:id", orderSlips.deleteOrderSlipById);
  router.post("/orderSlip", orderSlips.saveOrderSlip);
  router.put("/orderSlip/status", orderSlips.updateOrderSlipStatus);

  router.post("/orderSlipDetail/init", orderSlipDetails.init);
  router.post(
    "/orderSlipDetail/deposit/search",
    orderSlipDetails.searchOrderSlipDetails
  );
  
  router.post(
    "/orderSlipDetail/search",
    orderSlipDetails.searchOrderSlipDetails
  );
  router.post("/orderSlipDetail", orderSlipDetails.saveOrderSlipDetail);
  router.delete(
    "/orderSlipDetail/os/:id",
    orderSlipDetails.deleteOrderSlipDetailByOrderSlipId
  );
  router.delete(
    "/orderSlipDetail/si/:id",
    orderSlipDetails.deleteOrderSlipDetailsBySlipId
  );
  router.delete(
    "/orderSlipDetail/:id",
    orderSlipDetails.deleteOrderSlipDetailById
  );
  router.post("/salesSlip/init", salesSlips.init);
  router.post("/salesSlip/:id", salesSlips.deleteSalesSlipById);
  router.post("/salesSlip/", salesSlips.saveSalesSlip);
  
  router.post(
    "/salesSlipDetails/monthlySales/yesterday",
    salesSlipDetails.getMonthlySalesYesterday
  );
  router.post(
    "/salesSlipDetails/monthlySales/tax",
    salesSlipDetails.getMonthlySalesInTax
  );
  router.post(
    "/salesSlipDetails/monthlySales",
    salesSlipDetails.getMonthlySales
  );
  router.post(
    "/salesSlipDetails/monthly",
    salesSlipDetails.getMonthlySalesWithJoin
  );
  router.post("/salesSlipDetails/init", salesSlipDetails.init);
  router.post(
    "/salesSlipDetails/search",
    salesSlipDetails.searchSalesSlipDetails
  );
  router.post(
    "/salesSlipDetails/si/:id",
    salesSlipDetails.deleteSalesSlipDetailsBySlipId
  );
  router.post(
    "/salesSlipDetails/:id",
    salesSlipDetails.deleteSalesSlipDetailById
  );
  router.post("/salesSlipDetails", salesSlipDetails.saveSalesSlipDetail);
  router.post("/invoice/init", invoices.init);
  router.post("/invoice/:id", invoices.deleteInvoiceById);
  router.post("/invoice", invoices.saveInvoice);
  router.put("/invoice/:id", invoices.updateInvoiceStatus);

  router.post("/depositTransaction/init", depositTransctions.init);
  router.post(
    "/depositTransaction/:id",
    depositTransctions.deleteTransactionById
  );
  router.post("/depositTransaction/", depositTransctions.saveTransaction);
  router.put(
    "/depositTransaction/status/:id",
    depositTransctions.updateTransactionStatus
  );
  router.put(
    "/depositTransaction/invoice/:id",
    depositTransctions.updateInvoiceId
  );
  router.put(
    "/depositTransaction/deposit/:id",
    depositTransctions.updateDepositId
  );

  router.get("/salesSlip/search", salesSlips.searchSalesSlips);
  router.get("/salesSlip/:id", salesSlips.getSalesSlipById);
  router.get("/salesSlip", salesSlips.loadSalesSlips);

  router.get(
    "/salesSlipDetails/vendor/search",
    salesSlipDetails.searchSalesSlipsBySalesSlipId
  );
  router.get("/salesSlipDetails/:id", salesSlipDetails.getSalesSlipDetailById);
  router.get("/salesSlipDetails/", salesSlipDetails.loadSalesSlipDetails);

  router.get(
    "/orderSlipDetail/vender/search",
    orderSlipDetails.searchOrderSlipsByOrderSlipId
  );
  router.get("/orderSlipDetail/:id", orderSlipDetails.getOrderSlipDetailById);
  router.get("/orderSlipDetail", orderSlipDetails.loadOrderSlipDetails);

  router.get("/orderSlip/search", orderSlips.searchOrderSlips);
  router.get("/orderSlip/:id", orderSlips.getOrderSlipById);
  router.get("/orderSlip/", orderSlips.loadOrderSlips);

  router.get("/invoice/total", invoices.getInvoicesByTotalPriceRange);
  router.get("/invoice/count", invoices.countInvoicesForToday);
  router.get("/invoice/search", invoices.searchInvoices);
  router.get("/invoice/:id", invoices.getInvoiceById);
  router.get("/invoice/", invoices.loadInvoices);
  router.get(
    "/estimationSlipDetail/vender/search",
    estimationSlipDetails.searchEstimationSlipsByEstimationSlipId
  );
  router.get(
    "/estimationSlipDetail/:id",
    estimationSlipDetails.getEstimationSlipDetailById
  );
  router.get(
    "/estimationSlipDetail/",
    estimationSlipDetails.loadEstimationSlipDetails
  );
  router.get("/estimationSlip/search", estimationSlips.searchEstimationSlips);
  router.get("/estimationSlip/:id", estimationSlips.getEstimationSlipById);
  router.get("/estimationSlip/", estimationSlips.loadEstimationSlips);

  router.get(
    "/depositTransaction/search",
    depositTransctions.searchTransactions
  );
  router.get(
    "/depositTransaction/insert",
    depositTransctions.fetchAndInsertTransactions
  );
  router.get("/depositTransaction/apiKey", depositTransctions.isApiKeySet);
  router.get("/depositTransaction/:id", depositTransctions.getTransactionById);
  router.get("/depositTransaction/", depositTransctions.loadTransactions);

  router.get(
    "/depositSlipDetail/dsId/:id",
    depositSlipDetails.searchDepositSlipsByDepositSlipId
  );
  router.get(
    "/depositSlipDetail/vender/:id",
    depositSlipDetails.getDepositSlipDetailById
  );

  router.get(
    "/depositSlipDetail/:id",
    depositSlipDetails.getDepositSlipDetailById
  );
  router.get("/depositSlipDetail/", depositSlipDetails.loadDepositSlipDetails);

  router.get("/depositSlip/search", depositSlips.searchDepositSlips);
  router.get("/depositSlip/:id", depositSlips.getDepositSlipById);
  router.get("/depositSlip/", depositSlips.loadDepositSlips);

  return router;
};
