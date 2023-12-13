const { poolPromise } = require("./index");

exports.addNewProduct = async function (productInfo) {
  const { nickname, title, description, min_price, termination_date, images } =
    productInfo;

  const termination_date_o = new Date(termination_date);

  const pool = await poolPromise;
  const transaction = await pool.transaction().begin();

  try {
    const { recordset } = await transaction.request()
      .query`INSERT INTO products(nickname, title, description, min_price, termination_date) VALUES
        (${nickname}, ${title}, ${description}, ${min_price}, ${termination_date_o.toISOString()}); SELECT SCOPE_IDENTITY() AS id;`;

    const ImageValueSQL = images.reduce(
      (prevSQL, image) => `${prevSQL}, ('${image}', ${recordset[0].id})`,
      ""
    );
    await transaction
      .request()
      .query(
        `INSERT INTO productImages(image_name, product_id) VALUES ${ImageValueSQL.slice(
          2
        )};`
      );

    await transaction
      .request()
      .query(
        `INSERT INTO productStatus(product_id) VALUES (${recordset[0].id});`
      );

    await transaction.commit();

    return recordset[0].id; // 상품 아이디 반환
  } catch (err) {
    if (transaction && transaction._acquiredConnection) {
      await transaction.rollback();
    }

    throw err;
  }
};

exports.updateProduct = async function (productInfo) {
  const {
    product_id,
    title,
    description,
    termination_date,
    images,
    target_delete_image,
  } = productInfo;

  const termination_date_o = new Date(termination_date);

  const pool = await poolPromise;
  const transaction = await pool.transaction().begin();

  try {
    await transaction.request().query`
      UPDATE products
      SET title = ${title},
          description = ${description},
          termination_date = ${termination_date_o.toISOString()}
      WHERE product_id = ${product_id}`;

    if (images.length > 0) {
      const ImageValueSQL = images.reduce(
        (prevSQL, image) => `${prevSQL}, ('${image}', ${product_id})`,
        ""
      );
      await transaction
        .request()
        .query(
          `INSERT INTO productImages(image_name, product_id) VALUES ${ImageValueSQL.slice(
            2
          )};`
        );
    }

    if (target_delete_image.length > 0) {
      const targetDeleteImageInSQL = target_delete_image.reduce(
        (prevImages, currentImage) => `${prevImages}, '${currentImage}'`,
        ""
      );

      await transaction
        .request()
        .query(
          `DELETE FROM productImages WHERE image_name IN (${targetDeleteImageInSQL.slice(
            2
          )});`
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
