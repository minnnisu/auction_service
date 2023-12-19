const { poolPromise } = require("../../model");
const { suggestBidAmount } = require("../../service/bidService");

async function addBid(users, i) {
  try {
    const pool = await poolPromise;
    const user_id = users[Math.floor(i / 5000)].user_id;
    console.log(i);

    const { recordset: product } = await pool.query`
      SELECT TOP 1 
        p.product_id, 
        p.min_price,
        cp.current_price
      FROM products p
        LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
        LEFT JOIN productStatus ps ON p.product_id = ps.product_id
      WHERE ps.status = '진행중'
      ORDER BY NEWID();`;

    let price = 0;

    if (product[0].current_price === 0) {
      price = product[0].min_price;
    } else {
      const rPrice = Math.floor(Math.random() * 10000); // 0 ~ 10000
      price = product[0].current_price + rPrice;
    }

    await suggestBidAmount({
      product_id: product[0].product_id,
      user_id,
      price,
    });
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  const pool = await poolPromise;
  const { recordset: users } = await pool.query`
  SELECT TOP 5000 user_id
  FROM users
  ORDER BY NEWID();`;

  for (let i = 0; i < 900000; i++) {
    await addBid(users, i);
  }
})();
