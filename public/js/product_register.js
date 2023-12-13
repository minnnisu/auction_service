const MAX_IMAGE_COUNT = 10;
const input = document.getElementById("imageInput");

function selectProductImg() {
  var inputElement = document.getElementById("imageInput");

  // input 태그를 클릭
  inputElement.click();
}

function addImages() {
  const files = input.files;
  const preview = document.getElementById("imagePreview");

  const totalImageCount = preview.childElementCount + files.length;
  // 카메라 버튼 포함하고 계산해야 되므로 +1 한다.
  if (totalImageCount > MAX_IMAGE_COUNT + 1) {
    return alert("이미지는 최대 10개까지만 등록할 수 있습니다");
  }

  for (const file of files) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const previewImage = document.createElement("img");
      previewImage.className = "preview_image";
      previewImage.src = e.target.result;
      previewImage.imageFile = file;

      const deleteBtnWrapper = document.createElement("button");
      deleteBtnWrapper.className = "delete_btn_wrapper";

      const deleteBtn = document.createElement("span");
      deleteBtn.className = "delete_btn material-symbols-outlined";
      deleteBtn.textContent = "close";
      deleteBtnWrapper.appendChild(deleteBtn);

      deleteBtnWrapper.onclick = function () {
        removeImage(previewImage);
      };

      const previewImageContainer = document.createElement("div");
      previewImageContainer.className = "preview_image_container";
      previewImageContainer.appendChild(previewImage);
      previewImageContainer.appendChild(deleteBtnWrapper);

      preview.appendChild(previewImageContainer);
    };

    reader.readAsDataURL(file); // base64로 변환
  }
}

function removeImage(previewImage) {
  const preview = document.getElementById("imagePreview");
  preview.removeChild(previewImage.parentNode);
}

function checkProductDataInputValid(data) {
  const { title, description, minPrice, terminationDate, imageCount } = data;

  if (title === "") {
    throw new Error("제목을 입력해주세요.");
  }

  if (description.trim() === "") {
    throw new Error("본문을 입력해주세요.");
  }

  if (minPrice === "") {
    throw new Error("최소입찰가를 입력해주세요.");
  }

  if (terminationDate === "") {
    throw new Error("경매종료시간을 입력해주세요.");
  }

  const terminationDateObj = new Date(terminationDate);
  const nowDateObj = new Date();
  if (terminationDateObj <= nowDateObj) {
    throw new Error("경매종료시간은 지금 시각 이유이여야 합니다.");
  }

  // 이미지는 최소 하나 이상
  if (imageCount < 1) {
    throw new Error("이미지를 하나 이상 등록해주세요.");
  }
}

async function registerProduct() {
  const formData = new FormData();
  const preview = document.getElementById("imagePreview");

  const title = document.getElementById("title_input").value.trim(); // 앞, 뒤 공백 제거
  const description = document.getElementById("description_input").value;
  const minPrice = document.getElementById("min_price_input").value;
  const terminationDate = document.getElementById("terminate_time_input").value;

  try {
    checkProductDataInputValid({
      title,
      description,
      minPrice,
      terminationDate,
      imageCount: preview.childNodes.length - 3,
    });

    for (let i = 3; i < preview.childNodes.length; i++) {
      const imgContainer = preview.childNodes[i];
      formData.append("images", imgContainer.childNodes[0].imageFile);
    }

    formData.append("title", title);
    formData.append("description", description);
    formData.append("min_price", minPrice);
    formData.append("termination_date", terminationDate);

    const response = await fetch("http://localhost:8081/api/auction/item", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.message === "not_login_status_access_error") {
        window.location.href = "/login";
        return alert("로그인이 필요합니다.");
      }

      return alert("상품을 등록하는 중 오류가 발생하였습니다");
    }

    window.location.href = `/auction/item/${data.product_id}`;
  } catch (error) {
    return alert(error.message || "상품을 등록하는 중 오류가 발생하였습니다");
  }
}
