async function logout() {
    try {
        const response = await fetch( // 데이터를 가져오겠다는 뜻
          "http://localhost:8081/api/auth/logout", // api 명세서에 나와있는 링크로 보내면 됨
          {
            method: "POST", // POST 형식으로 보내겠다
          }
        );
        const data = await response.json();
        if (!response.ok) {
            if (data.message === "not_login_status_access_error") {
                return alert(
                  "로그인을 하지 않은 상태입니다."
                );
            }
            return alert(
                "예기치 못한 에러가 발생하였습니다. 잠시 후 다시 시도해주세요"
              );
        }
        window.location.href="/"
    }
    catch (error) {
        return alert(
          "예기치 못한 에러가 발생하였습니다. 잠시 후 다시 시도해주세요"
        );
      }
}