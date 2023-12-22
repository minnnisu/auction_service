exports.formatCreatedAt = function (time) {
  const postDate = new Date(time);
  const currentDate = new Date();
  const timeDifference = currentDate - postDate;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  function formatTimeAgo(value, unit) {
    return value + unit + " 전";
  }

  let formattedTime;
  if (seconds < 60) {
    formattedTime = formatTimeAgo(seconds, "초");
  } else if (minutes < 60) {
    formattedTime = formatTimeAgo(minutes, "분");
  } else if (hours < 24) {
    formattedTime = formatTimeAgo(hours, "시간");
  } else if (days < 30) {
    formattedTime = formatTimeAgo(days, "일");
  } else if (months < 12) {
    formattedTime = formatTimeAgo(months, "달");
  } else {
    formattedTime = formatTimeAgo(years, "년");
  }

  return formattedTime;
};

exports.formatTerminationTime = function (time) {
  const date = new Date(time);
  const formattedDate =
    date.getFullYear() +
    "-" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + date.getDate()).slice(-2) +
    " " +
    ("0" + date.getHours()).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2);

  return formattedDate;
};

exports.formatCurrentPrice = function (amount) {
  const formattedAmount = amount.toLocaleString("ko-KR");
  return formattedAmount;
};
