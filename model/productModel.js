const { poolPromise } = require("./index");

exports.getProducts = async function (filter) {
  const pool = await poolPromise;

  const PAGE_SIZE = 3;
  const offset = (filter.page - 1) * PAGE_SIZE;

  if (filter.sort === "latest") {
    const { recordset } =
      await pool.query`SELECT title, current_price, CONVERT(VARCHAR, DATEADD(HOUR, 9, termination_date), 120) AS termination_date, (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages WHERE product_id = p.product_id) AS image_url
    FROM products p
    WHERE selling_status = 1
    ORDER BY created_at DESC
    OFFSET ${offset} ROWS
    FETCH NEXT ${PAGE_SIZE} ROWS ONLY;
    `;

    return recordset;
  }

  if (filter.sort === "popular") {
    const { recordset } =
      await pool.query`SELECT title, current_price, CONVERT(VARCHAR, DATEADD(HOUR, 9, termination_date), 120) AS termination_date, (SELECT TOP 1 'http://localhost:8081/images/' + image_name FROM productImages WHERE product_id = p.product_id) AS image_url
    FROM products p
    WHERE selling_status = 1
    ORDER BY favorite_count DESC
    OFFSET ${offset} ROWS
    FETCH NEXT ${PAGE_SIZE} ROWS ONLY;`;

    return recordset;
  }
};
