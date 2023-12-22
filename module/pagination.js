const PAGE_UNIT = 10; // 한 페이지 당 게시물 갯수
const GROUP_UNIT = 10; // 그룹 당 페이지 갯수

function pagination(totalProductCount, reqPage) {
  const metaData = {
    totalProductCount,
    group: {
      prevGroupPage: null,
      nextGroupPage: null,
    },
    page: {
      startPage: null,
      currentPage: reqPage,
      endPage: null,
    },
  };

  let totalPage = null; // 전체 페이지 개수

  if (totalProductCount === 0) {
    totalPage = 1;
  } else {
    totalPage = Math.ceil(totalProductCount / PAGE_UNIT);
  }

  if (reqPage > totalPage || reqPage < 1) {
    throw new Error("존재하지 않는 페이지입니다");
  }

  // 0 ~ 9 => Group1
  // 10 ~ 19 => Group2
  // 20 ~ 29 => Group3

  const lastestGroup = Math.floor((totalPage - 1) / GROUP_UNIT); // 마지막 그룹
  const currentGroup = Math.floor((reqPage - 1) / GROUP_UNIT); // 현재 그룹

  if (currentGroup > lastestGroup) {
    throw new Error("존재하지 않는 페이지입니다");
  }

  if (currentGroup - 1 === -1) {
    metaData["group"]["prevGroupPage"] = null;
  } else {
    metaData["group"]["prevGroupPage"] = GROUP_UNIT * currentGroup;
  }

  if (currentGroup + 1 > lastestGroup) {
    metaData["group"]["nextGroupPage"] = null;
  } else {
    metaData["group"]["nextGroupPage"] =
      GROUP_UNIT * currentGroup + GROUP_UNIT + 1;
  }

  if (currentGroup == lastestGroup) {
    metaData["page"]["startPage"] = GROUP_UNIT * currentGroup + 1;
    metaData["page"]["endPage"] = totalPage;
    return metaData;
  }

  metaData["page"]["startPage"] = GROUP_UNIT * currentGroup + 1;
  metaData["page"]["endPage"] = GROUP_UNIT * currentGroup + GROUP_UNIT;
  return metaData;
}

module.exports = { PAGE_UNIT, GROUP_UNIT, pagination };
