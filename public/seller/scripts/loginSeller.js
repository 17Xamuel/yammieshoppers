const login = document.getElementById("loginForm");
login.addEventListener("submit", (e) => {
  e.preventDefault();
  let seller = {};
  seller.email = document.getElementById("email").value;
  seller.password = document.getElementById("password").value;

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (xhr.responseText == "Incorrect Email or Password") {
        document.getElementById("message").innerHTML = xhr.responseText;
      } else if (xhr.responseText == "User not Found") {
        document.getElementById("message").innerHTML = xhr.responseText;
      } else {
        localStorage.setItem(
          "yammie/useLocalstorage/storage",
          xhr.responseText
        );

        window.location.assign("./home.html");
      }
    }
  };
  let sellerString = JSON.stringify(seller);
  xhr.open("POST", "/api/sellers/loginSeller", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(sellerString);
});
