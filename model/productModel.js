const { poolPromise } = require("./index");

exports.getMainPage = async function () {
  const pool = await poolPromise;

  const { recordset: popularProducts } = await pool.query`
    SELECT TOP 5 
      product_id, 
      title,
      current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, termination_date), 120) AS termination_date, 
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages 
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120) AS created_at,
      like_count
    FROM products p
    WHERE product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
    ORDER BY like_count DESC`;

  const { recordset: latestProducts } = await pool.query`
    SELECT TOP 5
      product_id, 
      title,
      current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, termination_date), 120) AS termination_date, 
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages 
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120) AS created_at,
      like_count
    FROM products p
    WHERE product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
    ORDER BY created_at DESC`;

  return { latestProducts, popularProducts };
};

exports.getPopularPage = async function (filter, pageSize) {
  const pool = await poolPromise;

  const offset = (filter.page - 1) * pageSize;

  const { recordset: totalProductCount } = await pool.query`
    SELECT
      COUNT(*) AS cnt
    FROM products p
    WHERE product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')`;

  const { recordset: products } = await pool.query`
    SELECT
      product_id,
      title,
      current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, termination_date), 120) AS termination_date,
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120) AS created_at,
      like_count
    FROM products p
    WHERE product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
    ORDER BY like_count DESC
    OFFSET ${offset} ROWS
    FETCH NEXT ${pageSize} ROWS ONLY;`;

  return { totalProductCount, products };
};

exports.getLatestPage = async function (filter, pageSize) {
  const pool = await poolPromise;

  const offset = (filter.page - 1) * pageSize;

  const { recordset: totalProductCount } = await pool.query`
  SELECT
    COUNT(*) AS cnt
  FROM products p
  WHERE product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')`;

  const { recordset: products } = await pool.query`
    SELECT
      product_id,
      title,
      current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, termination_date), 120) AS termination_date,
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120) AS created_at,
      like_count
    FROM products p
    WHERE product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
    ORDER BY created_at DESC
    OFFSET ${offset} ROWS
    FETCH NEXT ${pageSize} ROWS ONLY;
  `;

  return { totalProductCount, products };
};

exports.getProductByProductId = async function (product_id) {
  const pool = await poolPromise;

  const { recordset } = await pool.query`
                        SELECT *
                        FROM products
                        WHERE product_id = ${product_id};`;

  return recordset;
};

exports.getProductPriceByProductId = async function (product_id) {
  const pool = await poolPromise;

  const { recordset } = await pool.query`
                        SELECT min_price, current_price
                        FROM products
                        WHERE product_id = ${product_id};`;

  return recordset;
};

exports.getDetailProductByProductId = async function (product_id, userId) {
  const pool = await poolPromise;

  let result = null;

  if (userId !== undefined) {
    result = await pool.query`
    SELECT 
      p.product_id, 
      p.nickname, 
      p.title, 
      p.description, 
      p.current_price, 
      p.like_count, 
      p.min_price, 
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.termination_date), 120) AS termination_date,
      (SELECT status FROM productStatus WHERE product_id = p.product_id) AS status,
      CASE 
          WHEN p.created_at < p.updated_at THEN CONVERT(VARCHAR, DATEADD(HOUR, 9, p.updated_at), 120)
          ELSE CONVERT(VARCHAR, DATEADD(HOUR, 9, p.created_at), 120)
      END AS timestamp,
      CASE
          WHEN p.created_at < p.updated_at THEN 'updated'
          ELSE 'normal'
      END AS modify_status,
      CASE 
        WHEN u.user_id = ${userId} THEN 1
        ELSE 0
      END AS is_my_product
    FROM products p INNER JOIN users u ON p.nickname = u.nickname
    WHERE p.product_id = ${product_id}`;
  } else {
    result = await pool.query`
    SELECT 
      product_id, 
      nickname, 
      title, 
      description, 
      current_price, 
      like_count, 
      min_price, 
      CONVERT(VARCHAR, DATEADD(HOUR, 9, termination_date), 120) AS termination_date,
      (SELECT status FROM productStatus WHERE product_id = p.product_id) AS status,
      CASE 
          WHEN created_at < updated_at THEN CONVERT(VARCHAR, DATEADD(HOUR, 9, updated_at), 120)
          ELSE CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120)
      END AS timestamp,
      CASE
          WHEN created_at < updated_at THEN 'updated'
          ELSE 'normal'
      END AS modify_status,
      (SELECT 0) AS is_my_product
    FROM products p
    WHERE product_id = ${product_id}`;
  }

  return result.recordset;
};

exports.getPriceByProductId = async function (productId) {
  const pool = await poolPromise;

  const { recordset } = await pool.query`SELECT min_price, current_price
                        FROM products
                        WHERE product_id = ${productId};`;

  return recordset;
};

exports.deleteProductByProductId = async function (productId) {
  const pool = await poolPromise;

  const { recordset } =
    await pool.query`DELETE FROM products WHERE product_id = ${productId};`;

  return recordset;
};
