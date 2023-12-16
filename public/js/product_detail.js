const PRODUCT_ID = window.location.pathname.split("/")[3];

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
      console.log();
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

// document.addEventListener("DOMContentLoaded", function () {
//   const showRepliesButtons = document.querySelectorAll(".show-replies-btn");

//   showRepliesButtons.forEach((button) => {
//     button.addEventListener("click", async function () {
//       const commentId = button.dataset.commentId;
//       const repliesContainer = document.getElementById(
//         `replies-container-${commentId}`
//       );

//       // 현재 답글 컨테이너의 표시 여부 확인
//       const isRepliesVisible = repliesContainer.style.display === "block";

//       // 토글 기능 - 표시되어 있으면 숨기고, 그렇지 않으면 보이게 함
//       repliesContainer.style.display = isRepliesVisible ? "none" : "block";

//       // 답글이 표시되어 있지 않으면 서버에서 답글을 가져와서 표시
//       if (!isRepliesVisible) {
//         try {
//           const response = await fetch(
//             `http://localhost:8081/api/auction/item/comment/reply?cid=${commentId}`
//           );
//           const data = await response.json();

//           // 답글을 화면에 표시
//           if (data.replies && data.replies.length > 0) {
//             const repliesHTML = data.replies
//               .map(
//                 (reply) => `
//                                   <div class="reply">
//                                       <strong>${reply.nickname}</strong>
//                                       <p>${reply.description}</p>
//                                       <p>${reply.timestamp}</p>
//                                       ${
//                                         reply.modify_status === "updated"
//                                           ? "<p>(수정됨)</p>"
//                                           : ""
//                                       }
//                                   </div>
//                               `
//               )
//               .join("");

//             repliesContainer.innerHTML = repliesHTML;
//           } else {
//             repliesContainer.innerHTML = "<p>답글이 없습니다.</p>";
//           }
//         } catch (error) {
//           console.error("Error fetching replies:", error);
//         }
//       }
//     });
//   });
// });
