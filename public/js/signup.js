const id = document.getElementById("id");
const password = document.getElementById("password");
const checkedPassword = document.getElementById("checkedPassword");
const username = document.getElementById("username");
const nickname = document.getElementById("nickname");
const email = document.getElementById("email");
const telephone = document.getElementById("telephone");
const form = document.getElementById("form");
let resultcheck = {
  id: false,
  password: false,
  checkedPassword: false,
  username: false,
  nickname: false,
  email: false,
  telephone: false,
};

// 유효성 검사 실패
function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = "signup_info error";
  const check_msg = formControl.querySelector(".check_msg");
  check_msg.innerText = message;
  resultcheck[input.name] = false;
}

// 유효성 검사 성공
function showSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = "signup_info success";
  resultcheck[input.name] = true;
}

// 이메일 유효성 체크
function checkEmail(input) {
  if (!checkRequired(email)) {
    return false;
  }
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (re.test(input.value.trim())) {
    showSuccess(input);
  } else {
    showError(input, "유효하지 않은 이메일입니다.");
  }
}

// 비밀번호 유효성 체크
function checkPassword(input) {
  if (!checkRequired(password)) {
    return false;
  }

  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (re.test(input.value.trim())) {
    showSuccess(input);
  } else {
    showError(input, "유효하지 않은 비밀번호입니다.");
  }
}

// 비밀번호 확인 체크

function checkPasswordsMatch(input1, input2) {
  if (!checkRequired(checkedPassword)) {
    return false;
  }

  if (input1.value === input2.value) {
    showSuccess(checkedPassword);
  } else {
    showError(checkedPassword, "비밀번호가 일치하지 않습니다.");
  }
}

// 전화번호 유효성 체크
function checkTelephone(input) {
  if (!checkRequired(telephone)) {
    return false;
  }
  const re = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;

  if (re.test(input.value.trim())) {
    showSuccess(input);
  } else {
    showError(input, "유효하지 않은 전화번호입니다.");
  }
}

function checkUsername(input) {
  if (!checkRequired(username)) {
    return false;
  }
}

// 아이디 유효성 체크
async function checkId() {
  // async = 비동기 통신을 위해 await를 사용하러면 async를 써서 선언해야 함
  if (!checkRequired(id)) {
    return false;
  }
  try {
    const response = await fetch(
      // 데이터를 가져오겠다는 뜻
      "http://localhost:8081/api/auth/local/id/check", // api 명세서에 나와있는 링크로 보내면 됨
      {
        method: "POST", // POST 형식으로 보내겠다
        headers: {
          "Content-Type": "application/json", // 이건 그냥 약속. 따라치면 됨. 데이터를 JSON 형식으로 보내겠다는 뜻.
        },
        body: JSON.stringify({
          // 이것도 그냥 약속. 따라치면 됨.
          id: id.value, // 값이 있는지 확인
        }),
      }
    );

    const data = await response.json(); // JSON 데이터를 다시 자바스크립트 형식으로 바꿈
    if (!response.ok) {
      // response.ok는 같은 데이터가 있으면 true, 같은 데이터가 없으면 false를 반환한다.
      if (data.message === "not_logout_status_access_error") {
        // 이것도 api 명세서에 있는 오류 메세지로 어떤 오류인지 판별하면 됨.
        return alert(
          "로그인을 한 상태에서는 아이디 중복 확인을 할 수 없습니다."
        );
      }

      if (data.message === "id_duplication_error") {
        // 마찬가지
        return showError(id, "중복된 아이디입니다.");
      }
      return;
    }

    return showSuccess(id);
  } catch (error) {
    return alert(
      "예기치 못한 에러가 발생하였습니다. 잠시 후 다시 시도해주세요"
    );
  }
}

// 닉네임 유효성 체크
async function checkNickname() {
  if (!checkRequired(nickname)) {
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
          nickname: nickname.value,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      if (data.message === "not_logout_status_access_error") {
        return alert(
          "로그인을 한 상태에서는 닉네임 중복확인을 할 수 없습니다."
        );
      }

      if (data.message === "nickname_duplication_error") {
        return showError(nickname, "중복된 닉네임입니다.");
      }
      return;
    }
    return showSuccess(nickname);
  } catch (error) {
    return alert(
      "예기치 못한 에러가 발생하였습니다. 잠시 후 다시 시도해주세요"
    );
  }
}

// 필수 입력 항목 체크
function checkRequired(input) {
  if (input.value.trim() === "") {
    showError(input, "필수 입력 항목입니다.");
    return false;
  } else {
    showSuccess(input);
    return true;
  }
}

// 가입
async function signup() {
  if (
    resultcheck.id == false ||
    resultcheck.password == false ||
    resultcheck.checkedPassword == false ||
    resultcheck.username == false ||
    resultcheck.nickname == false ||
    resultcheck.email == false ||
    resultcheck.telephone == false
  ) {
    return false;
  }

  try {
    const response = await fetch("http://localhost:8081/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id.value,
        password: password.value,
        checkedPassword: checkedPassword.value,
        username: username.value,
        nickname: nickname.value,
        email: email.value,
        telephone: telephone.value,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (data.message == "not_logout_status_access_error") {
        return alert("로그인 한 상태에서 접근할 수 없습니다.");
      }
      if (data.message == "not_contain_nessary_body") {
        return alert("필수로 포함해야 하는 내용이 포함되어있지 않습니다.");
      }
      if (data.message == "id_duplication_error") {
        return alert("중복된 아이디입니다.");
      }
      if (data.message == "nickname_duplication_error") {
        return alert("중복된 닉네임입니다.");
      }
      if (data.message == "not_match_pw_condition_error") {
        return alert("비밀번호 조합이 유효하지 않습니다.");
      }
      if (data.message == "not_match_email_condition_error") {
        return alert("이메일 형식이 유효하지 않습니다.");
      }
      if (data.message == "not_match_telephone_condition_error") {
        return alert("전화번호 형식이 유효하지 않습니다.");
      }
      if (data.message == "pw_consistency_error") {
        return alert("비밀번호와 재입력 비밀번호가 일치하지 않습니다.");
      }

      return alert("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
    return open_go_login_modal();
  } catch (error) {
    return alert("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault(); // submit시 자동 새로고침을 막음

  checkId();
  checkPassword(password);
  checkPasswordsMatch(password, checkedPassword);
  checkUsername(username);
  checkNickname();
  checkEmail(email);
  checkTelephone(telephone);
  signup();
});

// 로그인 창 이동 모달
const go_login_modal = document.getElementById("go_login_modal");

function open_go_login_modal() {
  go_login_modal.classList.remove("hidden");
}

function close_go_login_modal() {
  go_login_modal.classList.add("hidden");
  window.location.href="/login";
}

//모달 외부 클릭 시 모달 닫기
window.onclick = function (event) {
  if (event.target === go_login_modal) {
    close_go_login_modal();
  }
};

