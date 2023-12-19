const { poolPromise } = require("../../model");
const wishlistModel = require("../../model/wishlistModel");

async function addWishlist(users, i) {
  try {
    const pool = await poolPromise;
    const user_id = users[Math.floor(i / 200)].user_id;

    console.log(`${i}: ${user_id}`);

    const { recordset: product } = await pool.query`SELECT TOP 1 product_id
    FROM products
    ORDER BY NEWID();`;

    const wishlistItem = await wishlistModel.getWishlist(
      product[0].product_id,
      user_id
    );
    if (wishlistItem.length > 0) {
      await wishlistModel.deleteWishlist(product[0].product_id, user_id);
    } else {
      await wishlistModel.addWishlist(product[0].product_id, user_id);
    }
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  const pool = await poolPromise;
  const { recordset: users } = await pool.query`
        SELECT TOP 50 user_id
        FROM users
        ORDER BY NEWID();`;

  for (let i = 0; i < 10000; i++) {
    await addWishlist(users, i);
  }
})();
