const { poolPromise } = require("./index");

exports.getSummarizedProducts = async function (filter) {
  const pool = await poolPromise;

  const PAGE_SIZE = 10;
  const offset = (filter.page - 1) * PAGE_SIZE;

  if (filter.sort === "latest") {
    const { recordset } = await pool.query`SELECT 
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
    FETCH NEXT ${PAGE_SIZE} ROWS ONLY;
    `;

    return recordset;
  }

  if (filter.sort === "popular") {
    const { recordset } = await pool.query`SELECT 
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
    FETCH NEXT ${PAGE_SIZE} ROWS ONLY;`;

    return recordset;
  }
};

exports.getProductByProductId = async function (product_id) {
  const pool = await poolPromise;

  const { recordset } = await pool.query`SELECT *
                        FROM products
                        WHERE product_id = ${product_id};`;

  return recordset;
};

exports.getDetailProductByProductId = async function (product_id) {
  const pool = await poolPromise;

  const { recordset } = await pool.query`
  SELECT product_id, nickname, title, description, current_price, like_count, min_price,  CONVERT(VARCHAR, DATEADD(HOUR, 9, termination_date), 120) AS termination_date,
    (SELECT status FROM productStatus WHERE product_id = p.product_id) AS status,
    CASE 
        WHEN created_at < updated_at THEN CONVERT(VARCHAR, DATEADD(HOUR, 9, updated_at), 120)
        ELSE CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120)
    END AS timestamp,
    CASE
        WHEN created_at < updated_at THEN 'updated'
        ELSE 'normal'
    END AS modify_status
  FROM products p
  WHERE product_id = ${product_id}`;

  return recordset;
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
