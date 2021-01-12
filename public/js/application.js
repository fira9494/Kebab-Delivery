const forms = document.getElementsByName("orderForm");
forms.forEach((element) => {
  element.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { id } = event.target;
    const response = await fetch(event.target.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (result.session) {
      event.target.parentElement.classList = [];
      event.target.parentElement.innerHTML = "";
    } else {
      alert("SignUp or Login by Client");
    }
  });
});

// Инициализаци модалки
document.addEventListener("DOMContentLoaded", () => {
  const elems = document.querySelectorAll(".modal");
  const instances = M.Modal.init(elems);
});

//Инициализация select
document.addEventListener("DOMContentLoaded", () => {
  const elems = document.querySelectorAll("select");
  const instances = M.FormSelect.init(elems);
});
