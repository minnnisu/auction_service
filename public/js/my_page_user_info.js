const TAP_TYPE = window.location.pathname.split("/")[2];

console.log(TAP_TYPE);
window.onload = function () {
  if (TAP_TYPE === "sell") {
    document.querySelector(
      ".user_menu_list_wapper .user_menu_list .user_menu_tap.sell a"
    ).className = "active";
  }

  if (TAP_TYPE === "bid") {
    document.querySelector(
      ".user_menu_list_wapper .user_menu_list .user_menu_tap.bid a"
    ).className = "active";
  }

  if (TAP_TYPE === "successfulbid") {
    document.querySelector(
      ".user_menu_list_wapper .user_menu_list .user_menu_tap.successful_bid a"
    ).className = "active";
  }

  if (TAP_TYPE === "wishlist") {
    document.querySelector(
      ".user_menu_list_wapper .user_menu_list .user_menu_tap.wishlist a"
    ).className = "active";
  }

  if (TAP_TYPE === "update") {
    document.querySelector(
      ".user_menu_list_wapper .user_menu_list .user_menu_tap.update a"
    ).className = "active";
  }
};
