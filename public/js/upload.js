const input = document.getElementById("imageInput");

function addImages() {
  const files = input.files;
  const preview = document.getElementById("imagePreview");

  for (const file of files) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.imageFile = file;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.onclick = function () {
        removeImage(img);
      };

      const imgContainer = document.createElement("div");
      imgContainer.appendChild(img);
      imgContainer.appendChild(deleteBtn);

      preview.appendChild(imgContainer);
    };

    reader.readAsDataURL(file); // base64로 변환
  }
}

function removeImage(img) {
  const preview = document.getElementById("imagePreview");
  preview.removeChild(img.parentNode);
}

async function registerProduct() {
  const formData = new FormData();
  const preview = document.getElementById("imagePreview");

  const title = document.getElementById("title_input").value;
  const description = document.getElementById("description_input").value;
  const min_price = document.getElementById("min_price_input").value;
  const termination_date = document.getElementById(
    "terminate_time_input"
  ).value;

  for (const imgContainer of preview.childNodes) {
    formData.append("images", imgContainer.childNodes[0].imageFile);
  }

  formData.append("title", title);
  formData.append("description", description);
  formData.append("min_price", min_price);
  formData.append("termination_date", termination_date);

  const response = await fetch("http://localhost:8081/api/auction/item", {
    method: "POST",
    body: formData,
  });
  const data = response.json();
  console.log(data);
}
