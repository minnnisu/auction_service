const PRODUCT_ID = window.location.pathname.split("/")[3];

// 드롭다운 토글 함수
function toggleDropdown() {
  console.log("실행");
  const dropdown = document.getElementById("productDropdown");
  if (dropdown.style.display === "none" || dropdown.style.display === "") {
    dropdown.style.display = "block";
  } else {
    dropdown.style.display = "none";
  }
}

async function openBidListModal() {
  const bidListModal = document.getElementById("bidListModal");

  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/${PRODUCT_ID}/bid`
    );

    if (!response.ok) {
      throw new Error("경매정보를 불러오는 과정에서 오류가 발생하였습니다.");
    }

    const data = await response.json();

    const bidListWrapper = document.querySelector(".bid_list_wrapper");

    data.bidList.forEach((bid) => {
      const bidWrapper = document.createElement("div");
      bidWrapper.className = "bid_wrapper";
      bidWrapper.id = `bid-${bid.bid_id}`;

      const nicknameDiv = document.createElement("div");
      nicknameDiv.className = "nickname";
      nicknameDiv.textContent = bid.nickname;

      const priceDiv = document.createElement("div");
      priceDiv.className = "price";
      priceDiv.textContent = `${bid.price}원`;

      const createdAtDiv = document.createElement("div");
      createdAtDiv.className = "created_at";
      createdAtDiv.textContent = bid.created_at;

      const cancelBtn = document.createElement("button");
      cancelBtn.style.visibility = "hidden";
      cancelBtn.className = "bid_cancel";
      cancelBtn.textContent = "취소";

      if (bid.is_my_bid && !bid.is_canceled && bid.editable) {
        cancelBtn.style.visibility = "visible";
        cancelBtn.bidId = bid.bid_id;
        cancelBtn.onclick = async function () {
          await cancelBid(cancelBtn);
        };
      }

      const statusWrapperDiv = document.createElement("div");
      const statusDiv = document.createElement("div");
      const statusSpan = document.createElement("sapn");

      statusWrapperDiv.className = "status_wrapper";
      statusDiv.className = "status";
      statusSpan.className = "text";
      statusDiv.appendChild(statusSpan);
      statusWrapperDiv.appendChild(statusDiv);

      if (bid.is_canceled) {
        bidWrapper.className = `${bidWrapper.className} canceled`;
        statusSpan.textContent = "입찰 취소됨";
      }

      bidWrapper.appendChild(nicknameDiv);
      bidWrapper.appendChild(priceDiv);
      bidWrapper.appendChild(createdAtDiv);
      bidWrapper.appendChild(statusWrapperDiv);
      bidWrapper.appendChild(cancelBtn);

      bidListWrapper.appendChild(bidWrapper);
    });

    if (data.topBidId) {
      const topBidWrapper = document.getElementById(`bid-${data.topBidId}`);
      topBidWrapper.className = `${topBidWrapper.className} top_bid`;

      const topBidStatus = document.querySelector(
        `#bid-${data.topBidId} .status_wrapper .status .text`
      );
      topBidStatus.textContent = "최고 입찰가";
    }

    bidListModal.style.display = "flex";
  } catch (error) {
    console.log(error);
    alert("경매정보를 불러오는 과정에서 오류가 발생하였습니다.");
    bidListModal.style.display = "none";
  }
}

function closeBidListModal() {
  const bidListModal = document.getElementById("bidListModal");

  const bidListWrapper = document.querySelector(".bid_list_wrapper");
  bidListWrapper.innerHTML = "";

  bidListModal.style.display = "none";
}

async function openBidSuggestModal() {
  const bidListModal = document.getElementById("bidSuggestModal");
  bidListModal.style.display = "flex";
}

function closeBidSuggestModal() {
  const bidSuggestModal = document.getElementById("bidSuggestModal");
  bidSuggestModal.style.display = "none";
}

// 모달 외부를 클릭하면 모달이 닫히도록 설정
window.onclick = function (event) {
  const bidListModal = document.getElementById("bidListModal");
  if (event.target === bidListModal) {
    closeBidListModal();
  }

  const bidSuggestModal = document.getElementById("bidSuggestModal");
  if (event.target === bidSuggestModal) {
    closeBidSuggestModal();
  }

  const dropdownBtn = document.getElementById("productDropdownBtn");
  if (event.target === dropdownBtn) {
    toggleDropdown();
  }
};

async function cancelBid(btn) {
  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/bid/${btn.bidId}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("입찰 취소를 실패하였습니다.");
    }

    window.location.reload();
    return alert("입찰이 취소되었습니다");
  } catch (error) {
    alert("입찰 취소를 실패하였습니다.");
  }
}

async function suggestBid() {
  const priceSuggest = Number(
    document.getElementById("bid-suggest-price").value
  );

  try {
    const priceResponse = await fetch(
      `http://localhost:8081/api/auction/item/${PRODUCT_ID}/price`
    );

    const priceResponseData = await priceResponse.json();

    if (!priceResponse.ok) {
      if (priceResponseData.message === "not_exist_product_error") {
        window.location.href = "/";
        return alert("존재하지 않는 상품입니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }

    if (priceSuggest === "") {
      return alert("입찰가를 입력해주세요");
    }

    if (priceSuggest < priceResponseData.price.min_price) {
      return alert("최소입찰가보다 높은 가격이여야합니다.");
    }

    if (priceSuggest <= priceResponseData.price.current_price) {
      return alert("현재입찰가보다 높은 가격이여야합니다.");
    }

    const bidSuggetResponse = await fetch(
      `http://localhost:8081/api/auction/item/bid?pid=${PRODUCT_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: priceSuggest,
        }),
      }
    );

    const bidSuggestResponseData = await bidSuggetResponse.json();

    if (!bidSuggetResponse.ok) {
      if (bidSuggestResponseData.message === "not_login_status_access_error") {
        window.location.href = "/login";
        return alert("로그인이 필요한 서비스입니다.");
      }

      if (bidSuggestResponseData.message === "not_exist_product_error") {
        window.location.href = "/";
        return alert("존재하지 않는 상품입니다.");
      }

      if (bidSuggestResponseData.message === "unable_to_restrict_bid_error") {
        return alert("경매가 진행중인 상품만 입찰가 등록이 가능합니다.");
      }

      if (bidSuggestResponseData.message === "not_exist_user_error") {
        window.location.href = "/";
        return alert("존재하지 않은 계정입니다.");
      }

      if (bidSuggestResponseData.message === "owner_cannot_bid_error") {
        return alert("경매 주최자는 입찰가를 등록할 수 없습니다.");
      }

      if (bidSuggestResponseData.message === "below_min_bid_error") {
        return alert("최소입찰가보다 높은 가격이여야합니다.");
      }

      if (bidSuggestResponseData.message === "below_current_bid_error") {
        return alert("현재입찰가보다 높은 가격이여야합니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }

    window.location.reload();
    return alert("새로운 입찰가가 등록되었습니다.");
  } catch (error) {
    return alert("예상치 못한 에러가 발생하였습니다.");
  }
}
//이미지 슬라이드
const product_image_slider = document.querySelector(".product_image_slider"); //전체 슬라이드 컨테이너
const slideImg = document.querySelectorAll(".product_image_slider li"); //모든 슬라이드들
let currentSlide = 0; //현재 슬라이드 index
const slideCount = slideImg.length; // 슬라이드 개수
const prev = document.querySelector(".prev"); //이전 버튼
const next = document.querySelector(".next"); //다음 버튼
const slideWidth = 750; //한개의 슬라이드 넓이
const slideMargin = 100; //슬라이드간의 margin 값

product_image_slider.style.width =
  (slideWidth + slideMargin) * slideCount + "px";

function moveSlide(num) {
  product_image_slider.style.left = -num * 850 + "px";
  currentSlide = num;
}

prev.addEventListener("click", function () {
  next.style.visibility = "visible";
  if (currentSlide !== 0) {
    moveSlide(currentSlide - 1);
  }
});

next.addEventListener("click", function () {
  prev.style.visibility = "visible";
  if (currentSlide !== slideCount - 1) {
    moveSlide(currentSlide + 1);
  }
});
 

// comment

async function submitComment() {
  const description = document.getElementById("comment_input").value;

  if (description.trim() === "") {
    return alert("댓글을 입력해주세요.");
  }

  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/comment/?pid=${PRODUCT_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.message === "not_login_status_access_error") {
        window.location.href = "/login";
        return alert("로그인이 필요한 서비스입니다.");
      }

      if (data.message === "not_exist_product_error") {
        window.location.href = "/";
        return alert("존재하지 않는 상품입니다.");
      }

      if (data.message === "not_exist_user_error") {
        window.location.href = "/";
        return alert("존재하지 않은 계정입니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }

    window.location.reload();
    return alert("새로운 댓글이 등록되었습니다.");
  } catch (error) {
    return alert("예상치 못한 에러가 발생하였습니다.");
  }
}

function showCommentModifyInput(btn) {
  const id = btn.parentNode.parentNode.parentNode.id;
  const descriptionWrapper = document.querySelector(
    `#${id} .comment_item_description_wrapper`
  );
  const description = document.querySelector(
    `#${id} .comment_item_description_wrapper .comment_item_description`
  ).innerText;

  const descriptionInputEdit = document.createElement("input");
  descriptionInputEdit.type = "text";
  descriptionInputEdit.className = "description_input_edit";
  descriptionInputEdit.value = description;

  const descriptionInputSubmitBtn = document.createElement("button");
  descriptionInputSubmitBtn.textContent = "등록";
  descriptionInputSubmitBtn.className = "description_input_edit_submit_btn";
  descriptionInputSubmitBtn.onclick = function () {
    submitCommentEdit(id, descriptionInputEdit);
  };

  const descriptionInputCancelBtn = document.createElement("button");
  descriptionInputCancelBtn.textContent = "취소";
  descriptionInputCancelBtn.className = "description_input_edit_cancel_btn";
  descriptionInputCancelBtn.onclick = function () {
    cancelCommentEdit(id, description);
  };

  const descriptionInputEditWrapper = document.createElement("div");
  descriptionInputEditWrapper.className = "description_input_edit_wrapper";

  descriptionInputEditWrapper.appendChild(descriptionInputEdit);
  descriptionInputEditWrapper.appendChild(descriptionInputSubmitBtn);
  descriptionInputEditWrapper.appendChild(descriptionInputCancelBtn);

  descriptionWrapper.innerHTML = "";
  descriptionWrapper.appendChild(descriptionInputEditWrapper);
}

async function submitCommentEdit(commentId, descriptionInputEdit) {
  const description = descriptionInputEdit.value;
  const realCommentId = commentId.split("-")[1];

  if (description.trim() === "") {
    return alert("댓글을 입력해주세요.");
  }

  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/comment/${realCommentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.message === "not_login_status_access_error") {
        window.location.href = "/login";
        return alert("로그인이 필요한 서비스입니다.");
      }

      if (data.message === "not_exist_comment_error") {
        return alert("존재하지 않는 댓글입니다.");
      }

      if (data.message === "not_exist_user_error") {
        window.location.href = "/";
        return alert("존재하지 않은 계정입니다.");
      }

      if (data.message === "different_author_error") {
        return alert("댓글 등록자만 댓글을 수정할 수 있습니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }

    window.location.reload();
    return alert("댓글이 수정되었습니다.");
  } catch (error) {
    return alert("예상치 못한 에러가 발생하였습니다.");
  }
}

async function deleteComment(btn) {
  const commentId = btn.parentNode.parentNode.parentNode.id;
  const realCommentId = commentId.split("-")[1];

  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/comment/${realCommentId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.message === "not_login_status_access_error") {
        window.location.href = "/login";
        return alert("로그인이 필요한 서비스입니다.");
      }

      if (data.message === "not_exist_comment_error") {
        return alert("존재하지 않는 댓글입니다.");
      }

      if (data.message === "not_exist_user_error") {
        window.location.href = "/";
        return alert("존재하지 않은 계정입니다.");
      }

      if (data.message === "different_author_error") {
        return alert("댓글 등록자만 댓글을 삭제할 수 있습니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }

    window.location.reload();
    return alert("댓글이 삭제되었습니다.");
  } catch (error) {
    return alert("예상치 못한 에러가 발생하였습니다.");
  }
}

async function cancelCommentEdit(id, description) {
  const descriptionWrapper = document.querySelector(
    `#${id} .comment_item_description_wrapper`
  );

  const descriptionP = document.createElement("p");
  descriptionP.className = "comment_item_description";
  descriptionP.innerText = description;

  descriptionWrapper.innerHTML = "";
  descriptionWrapper.appendChild(descriptionP);
}

// reply

function getReplyItemHtml(replyItem) {
  return `
  <div id=r-${replyItem.reply_id} class="reply_item">
    <div class="reply_item_header">
      <div class="reply_nickname_wrapper">
        <span class="reply_nickname">${replyItem.nickname}</span>
      </div>
      <div class="reply_timestamp_wrapper">
        <span class="reply_timestamp">
          ${replyItem.timestamp} ${
    replyItem.modify_status === "updated" ? "(수정됨)" : ""
  }
        </span>
      </div>
    </div>
    <div class="reply_item_description_wrapper">
      <p class="reply_item_description">
        ${replyItem.description}
      </p>
    </div>
  ${
    replyItem.is_my_reply && !replyItem.is_deleted
      ? ` 
    <div class="reply_item_footer">
      <div class="reply_modify_btn_wrapper">
        <button class="modify_btn" onclick="showReplyModifyInput(this)">수정</button>
      </div>
      <div class="reply_delete_btn_wrapper">
        <button class="delete_btn" onclick="deleteReply(this)">삭제</button>
      </div>
    </div>`
      : ""
  }
    
  </div>`;
}

async function showReflies(btn) {
  const id = btn.parentNode.parentNode.parentNode.id;
  const realCommentID = id.split("-")[1];
  const repliesContainer = document.querySelector(`#${id} .reflies_container`);

  // 토글 기능
  if (repliesContainer.innerHTML !== "") {
    repliesContainer.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/comment/reply?cid=${realCommentID}`
    );
    const data = await response.json();

    if (!response.ok) {
      if (data.message === "not_exist_comment_error") {
        return alert("존재하지 않는 댓글입니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }
    const replyInput = document.createElement("input");
    replyInput.className = "reply_input";
    const replyInputSubmitBtn = document.createElement("button");
    replyInputSubmitBtn.className = "reply_input_submit_btn";
    replyInputSubmitBtn.innerText = "등록";
    replyInputSubmitBtn.onclick = function () {
      submitReply(realCommentID, replyInput);
    };

    const replyInputWrappper = document.createElement("div");
    replyInputWrappper.className = "reply_input_wrapper";

    replyInputWrappper.appendChild(replyInput);
    replyInputWrappper.appendChild(replyInputSubmitBtn);
    repliesContainer.appendChild(replyInputWrappper);

    const replyList = document.createElement("div");
    replyList.className = "reply_list";

    let replyItems = "";
    if (data.replies && data.replies.length > 0) {
      replyItems = data.replies.reduce(
        (prevRefly, replyItem) => prevRefly + getReplyItemHtml(replyItem),
        ""
      );
    } else {
      replyItems = `<p class="no_comment">답글이 없습니다.</p>`;
    }
    replyList.innerHTML = replyItems;
    repliesContainer.appendChild(replyList);
  } catch (error) {
    console.log(error);
    return alert("예상치 못한 에러가 발생하였습니다.");
  }
}

async function submitReply(commentId, replyInput) {
  const description = replyInput.value;

  if (description.trim() === "") {
    return alert("답글을 입력해주세요.");
  }

  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/comment/reply?cid=${commentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.message === "not_login_status_access_error") {
        window.location.href = "/login";
        return alert("로그인이 필요한 서비스입니다.");
      }

      if (data.message === "not_exist_comment_error") {
        window.location.href = "/";
        return alert("존재하지 않는 댓글입니다.");
      }

      if (data.message === "not_exist_user_error") {
        window.location.href = "/";
        return alert("존재하지 않은 계정입니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }

    window.location.reload();
    return alert("새로운 답글이 등록되었습니다.");
  } catch (error) {
    return alert("예상치 못한 에러가 발생하였습니다.");
  }
}

function showReplyModifyInput(btn) {
  const id = btn.parentNode.parentNode.parentNode.id;
  const descriptionWrapper = document.querySelector(
    `#${id} .reply_item_description_wrapper`
  );
  const description = document.querySelector(
    `#${id} .reply_item_description_wrapper .reply_item_description`
  ).innerText;

  const descriptionInputEdit = document.createElement("input");
  descriptionInputEdit.type = "text";
  descriptionInputEdit.className = "description_input_edit";
  descriptionInputEdit.value = description;

  const descriptionInputSubmitBtn = document.createElement("button");
  descriptionInputSubmitBtn.textContent = "등록";
  descriptionInputSubmitBtn.className = "description_input_edit_submit_btn";
  descriptionInputSubmitBtn.onclick = function () {
    submitReplyEdit(id, descriptionInputEdit);
  };

  const descriptionInputCancelBtn = document.createElement("button");
  descriptionInputCancelBtn.textContent = "취소";
  descriptionInputCancelBtn.className = "description_input_edit_cancel_btn";
  descriptionInputCancelBtn.onclick = function () {
    cancelReplyEdit(id, description);
  };

  const descriptionInputEditWrapper = document.createElement("div");
  descriptionInputEditWrapper.className = "description_input_edit_wrapper";

  descriptionInputEditWrapper.appendChild(descriptionInputEdit);
  descriptionInputEditWrapper.appendChild(descriptionInputSubmitBtn);
  descriptionInputEditWrapper.appendChild(descriptionInputCancelBtn);

  descriptionWrapper.innerHTML = "";
  descriptionWrapper.appendChild(descriptionInputEditWrapper);
}

async function cancelReplyEdit(id, description) {
  const descriptionWrapper = document.querySelector(
    `#${id} .reply_item_description_wrapper`
  );

  const descriptionP = document.createElement("p");
  descriptionP.className = "reply_item_description";
  descriptionP.innerText = description;

  descriptionWrapper.innerHTML = "";
  descriptionWrapper.appendChild(descriptionP);
}

async function submitReplyEdit(replyId, descriptionInputEdit) {
  const description = descriptionInputEdit.value;
  const realReplyId = replyId.split("-")[1];

  if (description.trim() === "") {
    return alert("답글을 입력해주세요.");
  }

  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/comment/reply/${realReplyId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.message === "not_login_status_access_error") {
        window.location.href = "/login";
        return alert("로그인이 필요한 서비스입니다.");
      }

      if (data.message === "not_exist_reply_error") {
        return alert("존재하지 않는 답글입니다.");
      }

      if (data.message === "not_exist_user_error") {
        window.location.href = "/";
        return alert("존재하지 않은 계정입니다.");
      }

      if (data.message === "different_author_error") {
        return alert("답글 등록자만 댓글을 수정할 수 있습니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }

    window.location.reload();
    return alert("답글이 수정되었습니다.");
  } catch (error) {
    return alert("예상치 못한 에러가 발생하였습니다.");
  }
}

async function deleteReply(btn) {
  const replyId = btn.parentNode.parentNode.parentNode.id;
  const realReplyId = replyId.split("-")[1];

  try {
    const response = await fetch(
      `http://localhost:8081/api/auction/item/comment/reply/${realReplyId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.message === "not_login_status_access_error") {
        window.location.href = "/login";
        return alert("로그인이 필요한 서비스입니다.");
      }

      if (data.message === "not_exist_reply_error") {
        return alert("존재하지 않는 답글입니다.");
      }

      if (data.message === "not_exist_user_error") {
        window.location.href = "/";
        return alert("존재하지 않은 계정입니다.");
      }

      if (data.message === "different_author_error") {
        return alert("답글 등록자만 답글을 삭제할 수 있습니다.");
      }

      return alert("예상치 못한 에러가 발생하였습니다.");
    }

    window.location.reload();
    return alert("답글이 삭제되었습니다.");
  } catch (error) {
    return alert("예상치 못한 에러가 발생하였습니다.");
  }
}
