function search() {
    const search_input = document.getElementById("search_input").value;

    if(search_input.trim() === ""){
        return alert ("검색어를 입력해주세요.");
    }
    return window.location.href="/search/?query=" + search_input;
}