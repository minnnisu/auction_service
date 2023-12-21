// 회원 탈퇴 경고 모달
const user_delete_modal = document.getElementById("user_delete_modal");
const user_delete_button = document.querySelector(".user_delete_button");

function open_user_delete_modal() {
  user_delete_modal.classList.remove("hidden");
}

function close_user_delete_modal() {
  user_delete_modal.classList.add("hidden");
}

//회원 탈퇴 완료 모달
const delete_complete_modal = document.getElementById("delete_complete_modal");

function open_delete_complete_modal() {
  delete_complete_modal.classList.remove("hidden");
}

function close_delete_complete_modal() {
  delete_complete_modal.classList.add("hidden");
  window.location.href = "/";
}

//모달 외부 클릭 시 모달 닫기
window.onclick = function (event) {
  if (event.target === user_delete_modal) {
    close_user_delete_modal();
  }
};

window.onclick = function (event) {
  if (event.target === delete_complete_modal) {
    close_delete_complete_modal();
  }
};

// 회원정보 수정
async function user_update() {
  const targetUpdate = {};
  let isModified = false;
  const originalUsername =
    document.getElementById("user_info_username").innerText;
  const originalNickname = document
    .getElementById("user_info_nickname")
    .innerText.split(" ")[0];
  const originalEmail = document.getElementById("user_info_email").innerText;
  const originalTelephone = document.getElementById(
    "user_info_telephone"
  ).innerText;

  const usernameUpdateTarget = document.getElementById("username").value.trim();
  const nicknameUpdateTarget = document.getElementById("nickname").value.trim();
  const emailUpdateTarget = document.getElementById("email").value.trim();
  const telephoneUpdateTarget = document
    .getElementById("telephone")
    .value.trim();

  if (usernameUpdateTarget !== originalUsername) {
    targetUpdate.username = usernameUpdateTarget;
    isModified = true;
  }

  if (nicknameUpdateTarget !== originalNickname) {
    targetUpdate.nickname = nicknameUpdateTarget;
    isModified = true;
  }

  if (emailUpdateTarget !== originalEmail) {
    targetUpdate.email = emailUpdateTarget;
    isModified = true;
  }

  if (telephoneUpdateTarget !== originalTelephone) {
    targetUpdate.telephone = telephoneUpdateTarget;
    isModified = true;
  }

  if (!isModified) {
    return alert("수정사항이 없습니다.");
  }

  try {
    const response = await fetch("http://localhost:8081/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(targetUpdate),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.message == "not_login_status_access_error") {
        return alert("로그아웃 상태에서 접근할 수 없습니다.");
      }
      if (data.message == "nickname_duplication_error") {
        return alert("중복된 닉네임입니다.");
      }
      if (data.message == "not_match_email_condition_error") {
        return alert("이메일 형식이 유효하지 않습니다.");
      }
      if (data.message == "not_match_telephone_condition_error") {
        return alert("전화번호 형식이 유효하지 않습니다.");
      }

      return alert("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
    window.location.reload();
    return alert("회원정보가 수정되었습니다.");
  } catch (error) {
    return alert("예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

//회원 탈퇴
async function user_delete() {
  try {
    const response = await fetch("http://localhost:8081/api/user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      return alert("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }

    close_user_delete_modal();
    open_delete_complete_modal();
  } catch (error) {
    return alert("예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}
