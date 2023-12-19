const productStatusModel = require("../model/productStatusModel");
const schedule = require("node-schedule");
const productModel = require("../model/productModel");
const HttpError = require("../error/HttpError");

const jobs = {};

async function startServer() {
  try {
    const productInfo = await productStatusModel.getActiveAuctionItemInfo();
    productInfo.forEach((product) => {
      const terminationDate = new Date(product.termination_date);
      const newJob = schedule.scheduleJob(terminationDate, async () => {
        if (product.current_price === 0) {
          await productStatusModel.changeProductStatusByProdctId(
            product.product_id,
            "유찰"
          );
        } else {
          await productStatusModel.changeProductStatusByProdctId(
            product.product_id,
            "종료"
          );
        }

        console.log(`The auction is terminated: ${product.product_id}`);
      });

      jobs[`product_${product.product_id}`] = newJob;
      console.log(`The schedule has been registered: ${product.product_id}`);
    });
  } catch (error) {
    console.error(`fail to schedule: ${error}`);
  }

  try {
    await productStatusModel.updateTimeOverProduct();
    console.log(
      "The items whose auction end time has passed have been terminated"
    );
  } catch (error) {
    console.error(`fail to change product status: ${error}`);
  }
}

async function registerScheduleCallback(productId) {
  try {
    const productPrice = await productModel.getProductPriceByProductId(
      productId
    );
    if (productPrice.length < 1) {
      console.error(`Accessing a Non-existent Product: ${productId}`);
      return;
    }

    if (productPrice[0].current_price === 0) {
      await productStatusModel.changeProductStatusByProdctId(productId, "유찰");
    } else {
      await productStatusModel.changeProductStatusByProdctId(productId, "종료");
    }

    console.log(`The auction is terminated: ${productId}`);
  } catch (error) {
    console.error(`Fail to register the schedule: ${productId}`);
  }
}

function register(productId, terminationDate) {
  const terminationDateD = new Date(terminationDate);
  try {
    const newJob = schedule.scheduleJob(terminationDateD, () => {
      registerScheduleCallback(productId);
    });

    jobs[`product_${productId}`] = newJob;
    console.error(`The schedule has been registered: ${productId}`);
  } catch (error) {
    console.error(`fail to register the schedule: ${productId}`);
    throw new HttpError(500, "server_error");
  }
}

function cancel(productId) {
  try {
    jobs[`product_${productId}`].cancel();
    console.log(`The schedule has been canceled: ${productId}`);
    jobs[`product_${productId}`] = null;
  } catch (error) {
    console.error(`Fail to cancel the schedule: ${error}`);
    throw new HttpError(500, "server_error");
  }
}

function update(productId, terminationDate) {
  try {
    cancel(productId);
    register(productId, terminationDate);
  } catch (error) {
    console.log(error);
    throw new HttpError(500, "server_error");
  }
}

module.exports = { jobs, startServer, register, update, cancel };
