const { poolPromise } = require("./index");

exports.addNewUser = async function (userInfo) {
  const { id, hashedPassword, username, nickname, telephone, email } = userInfo;

  const pool = await poolPromise;
  await pool.query`INSERT INTO users(user_id, password, username, nickname, telephone, email) VALUES
                    (${id}, ${hashedPassword}, ${username}, ${nickname}, ${telephone}, ${email});`;
};

exports.getUser = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM users WHERE user_id = ${id}`;
  return recordset;
};

exports.getNicknameByUserId = async function (userId) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT nickname FROM users WHERE user_id = ${userId}`;
  return recordset[0].nickname;
};

exports.updateUser = async function (userUpdateInfo, userId) {
  const { username, nickname, email, telephone } = userUpdateInfo;

  const pool = await poolPromise;
  await pool.query`
      UPDATE users
      SET 
        username = ${username},
        nickname = ${nickname},
        email = ${email},
        telephone = ${telephone}
      WHERE user_id = ${userId}`;
};

exports.deleteUser = async function (userId) {
  const pool = await poolPromise;
  const transaction = await pool.transaction().begin();

  try {
    await transaction.request().query`
      UPDATE productStatus
      SET status = '철회'
      WHERE product_id IN 
          (SELECT product_id 
          FROM 
              (SELECT product_id 
              FROM products p 
                  LEFT JOIN users u ON p.nickname = u.nickname 
              WHERE u.user_id = ${userId}) p)`;

    await transaction.request().query`
      DELETE
      FROM users
      WHERE user_id = ${userId}`;

    await transaction.commit();
  } catch (err) {
    if (transaction && transaction._acquiredConnection) {
      await transaction.rollback();
    }

    throw err;
  }
};

exports.checkIdDuplication = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT user_id FROM users WHERE user_id = ${id}`;

  if (recordset.length > 0) {
    return true;
  }
  return false;
};

exports.checkNicknameDuplication = async function (nickname) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT nickname FROM users WHERE nickname = ${nickname}`;

  if (recordset.length > 0) {
    return true;
  }
  return false;
};

exports.getUserSellPage = async function (filter, pageSize, nickname) {
  const pool = await poolPromise;

  const offset = (filter.page - 1) * pageSize;

  const { recordset: totalProductCount } = await pool.query`
    SELECT
      COUNT(*) AS cnt
    FROM (SELECT * FROM products WHERE nickname = ${nickname}) p 
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id`;

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
    FROM (SELECT * FROM products WHERE nickname = ${nickname}) p 
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON p.product_id = wc.product_id
    ORDER BY p.created_at DESC
    OFFSET ${offset} ROWS
    FETCH NEXT ${pageSize} ROWS ONLY;`;

  return { totalProductCount, products };
};

exports.getUserBidPage = async function (filter, pageSize, userId) {
  const pool = await poolPromise;

  const offset = (filter.page - 1) * pageSize;

  const { recordset: totalProductCount } = await pool.query`
    SELECT
      COUNT(*) AS cnt
    FROM 
      (SELECT * FROM bids WHERE user_id = '7xi6qizi') b
          LEFT JOIN products p ON b.product_id = p.product_id
          LEFT JOIN currentPriceView cp ON b.product_id = cp.product_id
          LEFT JOIN wishlistCountView wc ON b.product_id = wc.product_id`;

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
    FROM 
      (SELECT * FROM bids WHERE user_id = ${userId}) b
          LEFT JOIN products p ON b.product_id = p.product_id
          LEFT JOIN currentPriceView cp ON b.product_id = cp.product_id
          LEFT JOIN wishlistCountView wc ON b.product_id = wc.product_id
    ORDER BY p.created_at DESC 
    OFFSET ${offset} ROWS
    FETCH NEXT ${pageSize} ROWS ONLY;`;

  return { totalProductCount, products };
};

exports.getUserSuccessfulBidPage = async function (filter, pageSize, userId) {
  const pool = await poolPromise;

  const offset = (filter.page - 1) * pageSize;

  const { recordset: totalProductCount } = await pool.query`
    SELECT
      COUNT(*) AS cnt
    FROM  
      (SELECT * FROM successfulBidView WHERE user_id = ${userId}) sb
          LEFT JOIN products p ON sb.product_id = p.product_id
          LEFT JOIN currentPriceView cp ON sb.product_id = cp.product_id
          LEFT JOIN wishlistCountView wc ON sb.product_id = wc.product_id`;

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
    FROM  
      (SELECT * FROM successfulBidView WHERE user_id = ${userId}) sb
          LEFT JOIN products p ON sb.product_id = p.product_id
          LEFT JOIN currentPriceView cp ON sb.product_id = cp.product_id
          LEFT JOIN wishlistCountView wc ON sb.product_id = wc.product_id
    ORDER BY p.created_at DESC 
    OFFSET ${offset} ROWS
    FETCH NEXT ${pageSize} ROWS ONLY;`;

  return { totalProductCount, products };
};

exports.getUserWishlistPage = async function (filter, pageSize, userId) {
  const pool = await poolPromise;

  const offset = (filter.page - 1) * pageSize;

  const { recordset: totalProductCount } = await pool.query`
    SELECT
      COUNT(*) AS cnt
      FROM 
        (SELECT * FROM wishlists WHERE user_id = ${userId}) wl 
          LEFT JOIN products p ON wl.product_id = p.product_id
          LEFT JOIN currentPriceView cp ON wl.product_id = cp.product_id
          LEFT JOIN wishlistCountView wc ON wl.product_id = wc.product_id`;

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
    FROM (SELECT * FROM wishlists WHERE user_id = ${userId}) wl 
      LEFT JOIN products p ON wl.product_id = p.product_id
      LEFT JOIN currentPriceView cp ON wl.product_id = cp.product_id
      LEFT JOIN wishlistCountView wc ON wl.product_id = wc.product_id
    ORDER BY p.created_at DESC
    OFFSET ${offset} ROWS
    FETCH NEXT ${pageSize} ROWS ONLY;`;

  return { totalProductCount, products };
};
