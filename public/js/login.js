const username = document.getElementById("username");
const password = document.getElementById("password");
const check_msg = document.querySelector(".check_msg");

// 로그인 실패
function showError(message) {
  const error_info = check_msg.parentElement;
  error_info.className="error_info_error"
  check_msg.innerText = message;
}

async function login() {
  // async = 비동기 통신을 위해 await를 사용하러면 async를 써서 선언해야 함
  try {
    const response = await fetch(
      // 데이터를 가져오겠다는 뜻
      "http://localhost:8081/api/auth/local/login", // api 명세서에 나와있는 링크로 보내면 됨
      {
        method: "POST", // POST 형식으로 보내겠다
        headers: {
          "Content-Type": "application/json", // 이건 그냥 약속. 따라치면 됨. 데이터를 JSON 형식으로 보내겠다는 뜻.
        },
        body: JSON.stringify({
          // 이것도 그냥 약속. 따라치면 됨.
          username: username.value,
          password: password.value,
        }),
      }
    );

    const data = await response.json(); // JSON 데이터를 다시 자바스크립트 형식으로 바꿈
    if (!response.ok) {
      // response.ok는 같은 데이터가 있으면 true, 같은 데이터가 없으면 false를 반환한다.
      if (data.message === "not_logout_status_access_error") {
        // 이것도 api 명세서에 있는 오류 메세지로 어떤 오류인지 판별하면 됨.
        return alert("로그인을 한 상태입니다.");
      }

      if (data.message === "not_contain_nessary_body") {
        return showError("아이디와 비밀번호를 입력해주세요.");
      }

      if (data.message === "not_found_id_error") {
        return showError("존재하지 않는 아이디입니다.");
      }

      if (data.message === "not_match_password_error") {
        return showError("잘못된 비밀번호입니다.");
      }

      return;
    }
    window.location.href = "/";
  } catch (error) {
    return alert(
      "예기치 못한 에러가 발생하였습니다. 잠시 후 다시 시도해주세요"
    );
  }
}
