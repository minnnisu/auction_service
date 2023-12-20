const { poolPromise } = require("./index");

exports.getMainPage = async function () {
  const pool = await poolPromise;

  const { recordset: popularProducts } = await pool.query`
    SELECT TOP 5 
      p.product_id, 
      p.title,
      cp.current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.termination_date), 120) AS termination_date, 
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages 
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.created_at), 120) AS created_at,
      CASE 
        WHEN wc.like_count IS NULL THEN 0
        ELSE wc.like_count
      END AS like_count
    FROM products p
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id
    WHERE 
      p.product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
    ORDER BY like_count DESC`;

  const { recordset: latestProducts } = await pool.query`
    SELECT TOP 5
      p.product_id, 
      p.title,
      cp.current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.termination_date), 120) AS termination_date, 
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages 
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.created_at), 120) AS created_at,
      CASE 
        WHEN wc.like_count IS NULL THEN 0
        ELSE wc.like_count
      END AS like_count
    FROM products p
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id
    WHERE p.product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
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
      p.product_id, 
      p.title,
      cp.current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.termination_date), 120) AS termination_date, 
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages 
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.created_at), 120) AS created_at,
      CASE 
        WHEN wc.like_count IS NULL THEN 0
        ELSE wc.like_count
      END AS like_count
    FROM products p
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id
    WHERE p.product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
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
      p.product_id, 
      p.title,
      cp.current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.termination_date), 120) AS termination_date, 
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages 
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.created_at), 120) AS created_at,
      CASE 
        WHEN wc.like_count IS NULL THEN 0
        ELSE wc.like_count
      END AS like_count
    FROM products p
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id
    WHERE p.product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
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
                        SELECT min_price, cp.current_price
                        FROM products p
                          LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
                        WHERE p.product_id = ${product_id};`;

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
      p.min_price, 
      cp.current_price,
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
        WHEN un.user_id = ${userId} THEN 1
        ELSE 0
      END AS is_my_product,
      CASE 
          WHEN wc.like_count IS NULL THEN 0
          ELSE wc.like_count
      END AS like_count
    FROM products p 
      LEFT JOIN userNickname un ON p.nickname = un.nickname 
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id
    WHERE p.product_id = ${product_id}`;
  } else {
    result = await pool.query`
    SELECT 
      p.product_id, 
      p.nickname, 
      p.title, 
      p.description, 
      p.min_price, 
      cp.current_price,
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
          WHEN wc.like_count IS NULL THEN 0
          ELSE wc.like_count
      END AS like_count,
      (SELECT 0) AS is_my_product
    FROM products p 
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id
    WHERE p.product_id = ${product_id}`;
  }

  return result.recordset;
};

exports.deleteProductByProductId = async function (productId) {
  const pool = await poolPromise;

  const { recordset } =
    await pool.query`DELETE FROM products WHERE product_id = ${productId};`;

  return recordset;
};

exports.getSearchPage = async function (filter, pageSize) {
  const pool = await poolPromise;

  const offset = (filter.page - 1) * pageSize;

  console.log(offset);

  const { recordset: totalProductCount } = await pool.query`
    SELECT
      COUNT(*) AS cnt
    FROM products p
    WHERE product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중')
    UNION
    SELECT
      COUNT(*) AS cnt
    FROM products p
    WHERE p.title LIKE ${`%${filter.query}%`}`;

  const { recordset: products } = await pool.query`
    SELECT
      p.product_id, 
      p.title,
      cp.current_price,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.termination_date), 120) AS termination_date, 
      (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages 
        WHERE product_id = p.product_id) AS image_url,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.created_at), 120) AS created_at,
      CASE 
        WHEN wc.like_count IS NULL THEN 0
        ELSE wc.like_count
      END AS like_count
    FROM products p
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id
    WHERE p.product_id IN (SELECT product_id FROM productStatus WHERE status = '진행중') 
      AND p.title LIKE ${`%${filter.query}%`} 
    ORDER BY like_count DESC
    OFFSET ${offset} ROWS
    FETCH NEXT ${pageSize} ROWS ONLY;
  `;

  return { totalProductCount, products };
};
