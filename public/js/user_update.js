let resultcheck = {
  username: false,
  nickname: false,
  email: false,
  telephone: false,
};

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

// 유효성 검사 실패
function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = "signup_info error";
  const check_msg = formControl.querySelector(".check_msg");
  check_msg.innerText = message;
  resultcheck[input.name] = false;
}

// 이메일 유효성 체크
function checkEmail(emailInput) {
  if (!checkRequired(emailInput)) {
    return false;
  }
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!re.test(emailInput.value.trim())) {
    showError(emailInput, "유효하지 않은 이메일입니다.");
    return false;
  }
}

// 전화번호 유효성 체크
function checkTelephone(telephoneInput) {
  if (!checkRequired(telephoneInput)) {
    return false;
  }
  const re = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

  if (!re.test(telephoneInput.value.trim())) {
    showError(telephoneInput, "유효하지 않은 전화번호입니다.");
    return false;
  }
}

function checkUsername(usernameInput) {
  if (!checkRequired(usernameInput)) {
    return false;
  }
}

// 닉네임 유효성 체크
async function checkNickname(nicknameInput) {
  if (!checkRequired(nicknameInput)) {
    return false;
  }
  try {
    const response = await fetch(
      "http://localhost:8081/api/auth/local/nickname/check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: nicknameInput.value,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      if (data.message === "not_logout_status_access_error") {
        alert("로그인을 한 상태에서는 닉네임 중복확인을 할 수 없습니다.");
      }

      if (data.message === "nickname_duplication_error") {
        showError(nickname, "중복된 닉네임입니다.");
      }
      return false;
    }
  } catch (error) {
    alert("예기치 못한 에러가 발생하였습니다. 잠시 후 다시 시도해주세요");

    return false;
  }
}

// 필수 입력 항목 체크
function checkRequired(input) {
  if (input.value.trim() !== "") {
    showError(input, "필수 입력 항목입니다.");
    return false;
  }
}

// 회원정보 수정
async function user_update() {
  const targetUpdate = {};
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
  }

  if (nicknameUpdateTarget !== originalNickname) {
    targetUpdate.nickname = nicknameUpdateTarget;
  }

  if (emailUpdateTarget !== originalEmail) {
    targetUpdate.email = emailUpdateTarget;
  }

  if (telephoneUpdateTarget !== originalTelephone) {
    targetUpdate.telephone = telephoneUpdateTarget;
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
      if (data.message == "not_logout_status_access_error") {
        return alert("로그인 한 상태에서 접근할 수 없습니다.");
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
    return alert("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}
