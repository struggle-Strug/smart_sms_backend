const express = require("express");
const router = express.Router();

// Export the router as a function to accept `db`
module.exports = (db) => {
  const customersController =
    require("../controllers/mastersController/customers")(db); // Pass `db` to the controller
  const deliveryCustomersController =
    require("../controllers/mastersController/deliveryCustomers")(db);
  const products = require("../controllers/mastersController/products")(db);
  const vendors = require("../controllers/mastersController/vendors")(db);
  const storageFacilities =
    require("../controllers/mastersController/storageFacilities")(db);
  const paymentMethods =
    require("../controllers/mastersController/paymentMethods")(db);
  const contactPersons =
    require("../controllers/mastersController/contactPersons")(db);
  const shippingMethods =
    require("../controllers/mastersController/shippingMethods")(db);
  const companies = require("../controllers/mastersController/companies")(db);
  const primarySections =
    require("../controllers/mastersController/primarySections")(db);
  const secondarySections =
    require("../controllers/mastersController/secondarySections")(db);
  const shops = require("../controllers/mastersController/shops")(db);
  const setProducts = require("../controllers/mastersController/setProducts")(
    db
  );
  const categories = require("../controllers/mastersController/categories")(db);
  const subCategories =
    require("../controllers/mastersController/subCategories")(db);

  // Define routes and use the controller methods
  router.post("/customer/init", customersController.init);
  router.post("/customer/:id", customersController.deleteById);
  router.post("/customer/", customersController.save);
  router.post("/deliveryCustomer/init", deliveryCustomersController.init);
  router.post("/deliveryCustomer/:id", deliveryCustomersController.deleteById);
  router.post("/deliveryCustomer/", deliveryCustomersController.save);
  router.post("/product/init", products.init);
  router.post("/product/:id", products.deleteById);
  router.post("/product/", products.save);
  router.post("/vendor/init", vendors.init);
  router.post("/vendor/:id", vendors.deleteById);
  router.post("/vendor/", vendors.save);
  router.post("/storageFacility/init", storageFacilities.init);
  router.post("/storageFacility/:id", storageFacilities.deleteById);
  router.post("/storageFacility/", storageFacilities.save);
  router.post("/paymentMethod/init", paymentMethods.init);
  router.post("/paymentMethod/:id", paymentMethods.deleteById);
  router.post("/paymentMethod/", paymentMethods.save);
  router.post("/contactPerson/init", contactPersons.init);
  router.post("/contactPerson/:id", contactPersons.deleteById);
  router.post("/contactPerson/", contactPersons.save);
  router.post("/shippingMethod/init", shippingMethods.init);
  router.post("/shippingMethod/:id", shippingMethods.deleteById);
  router.post("/shippingMethod/", shippingMethods.save);
  router.post("/company/init", companies.init);
  router.post("/company/:id", companies.deleteById);
  router.post("/company/", companies.save);
  router.post("/primarySection/init", primarySections.init);
  router.post("/primarySection/:id", primarySections.deleteById);
  router.post("/primarySection/", primarySections.save);
  router.post("/secondarySection/init", secondarySections.init);
  router.post("/secondarySection/:id", secondarySections.deleteById);
  router.post("/secondarySection/", secondarySections.save);
  router.post("/shop/init", shops.init);
  router.post("/shop/:id", shops.deleteById);
  router.post("/shop/", shops.save);
  router.post("/setProduct/init", setProducts.init);
  router.post("/setProduct/:id", setProducts.deleteById);
  router.post("/setProduct/", setProducts.save);
  router.post("/category/init", categories.init);
  router.post("/category/:id", categories.deleteById);
  router.post("/category/", categories.save);
  router.post("/subCategory/init", subCategories.init);
  router.post("/subCategory/:id", subCategories.deleteById);
  router.post("/subCategory/", subCategories.save);
  router.get("/vendor/search", vendors.searchVendors);
  router.get("/vendor/all", vendors.load);
  router.get("/vendor/id", vendors.searchIdVendors);
  router.get("/vendor/name", vendors.searchNameVendors);
  router.get("/vendor/code", vendors.loadVendorByCode);
  router.get("/vendor/:id", vendors.getById);
  router.get("/subCategory/all", subCategories.load);
  router.get("/subCategory/:id", subCategories.getById);
  router.get("/subCategory", subCategories.searchSubcategories);
  router.get("/storageFacility/all", storageFacilities.load);
  router.get("/storageFacility/:id", storageFacilities.getById);
  router.get("/storageFacility", storageFacilities.searchStorageFacilities);
  router.get("/shop/all", shops.load);
  router.get("/shop/:id", shops.getById);
  router.get("/shop", shops.searchShops);
  router.get("/shippingMethod/all", shippingMethods.load);
  router.get("/shippingMethod/:id", shippingMethods.getById);
  router.get("/shippingMethod", shippingMethods.searchShippingMethods);
  router.get("/setProduct/search", setProducts.searchSetProducts);
  router.get("/setProduct/all", setProducts.load);
  router.get("/setProduct/:id", setProducts.getById);
  router.get("/secondarySection/all", secondarySections.load);
  router.get("/secondarySection/:id", secondarySections.getById);
  router.get("/secondarySection", secondarySections.searchSecondarySections);
  router.get("/product/search", products.searchProducts);
  router.get("/product/all", products.load);
  router.get("/product/id", products.searchIdProducts);
  router.get("/product/name", products.searchNameProducts);
  router.get("/product/:id", products.getById);
  router.get("/primarySection/all", primarySections.load);
  router.get("/primarySection/:id", primarySections.getById);
  router.get("/primarySection", primarySections.searchPrimarySections);
  router.get("/paymentMethod/all", paymentMethods.load);
  router.get("/paymentMethod/:id", paymentMethods.getById);
  router.get("/paymentMethod", paymentMethods.searchPaymentMethod);
  router.get(
    "/deliveryCustomer/search",
    deliveryCustomersController.searchDeliveryCustomers
  );
  router.get("/deliveryCustomer/all", deliveryCustomersController.load);
  router.get("/deliveryCustomer/:id", deliveryCustomersController.getById);
  router.get("/customer/search", customersController.searchCustomers);
  router.get("/customer/all", customersController.load);
  router.get("/customer/id", customersController.searchIdCustomers);
  router.get("/customer/name", customersController.searchNameCustomers);
  router.get("/customer/code", customersController.loadCustomerByCode);
  router.get("/customer/:id", customersController.getById);
  router.get("/contactPerson/all", contactPersons.load);
  router.get("/contactPerson/:id", contactPersons.getById);
  router.get("/contactPerson", contactPersons.searchContact_persons);
  router.get("/company/search", companies.searchCompanies);
  router.get("/company/all", companies.load);
  router.get("/company/:id", companies.getById);
  router.get("/category/all", categories.load);
  router.get("/category/:id", categories.getById);
  router.get("/category", categories.searchCategories);

  return router;
};
