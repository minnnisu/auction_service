async function checkId() {
  const id = document.getElementById("id").value;
  if (id.trim() === "") {
    return alert("아이디를 입력해야합니다.");
  }

  try {
    const response = await fetch(
      "http://localhost:8081/api/auth/local/id/check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      if (data.message === "not_logout_status_access_error") {
        return alert(
          "로그인을 한 상태에서는 아이디 중복확인을 할 수 없습니다."
        );
      }

      if (data.message === "id_duplication_error") {
        return alert("중복된 아이디입니다.");
      }

      return alert(
        "예기치 못한 에러가 발생하였습니다. 잠시 후 다시 시도해주세요"
      );
    }

    return alert("사용가능한 아이디입니다.");
  } catch (error) {
    return alert(
      "예기치 못한 에러가 발생하였습니다. 잠시 후 다시 시도해주세요"
    );
  }
}

function signup(params) {
  const id = document;
  if (!checkId(id)) {
    return alert("중복된 아이디 입니다.");
  }
}
