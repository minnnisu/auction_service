const { poolPromise } = require("./index");

exports.addNewProduct = async function (productInfo) {
  const { user_id, title, description, min_price, termination_date, images } =
    productInfo;

  const termination_date_o = new Date(termination_date);

  try {
    const pool = await poolPromise;
    const transaction = await pool.transaction().begin();

    const { recordset } = await transaction.request()
      .query`INSERT INTO products(user_id, title, description, min_price, termination_date) VALUES
        (${user_id}, ${title}, ${description}, ${min_price}, ${termination_date_o.toISOString()}); SELECT SCOPE_IDENTITY() AS id;`;

    for (const image of images) {
      await transaction
        .request()
        .query(
          `INSERT INTO productImages(image_name, product_id) VALUES ('${image}', ${recordset[0].id});`
        );
    }

    await transaction.commit();
  } catch (err) {
    if (transaction && transaction._acquiredConnection) {
      await transaction.rollback();
    }

    throw err;
  }
};