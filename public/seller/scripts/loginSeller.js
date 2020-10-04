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
        document.getElementById("messages").innerHTML = xhr.responseText;
      } else if (xhr.responseText == "User not Found") {
        document.getElementById("messages").innerHTML = xhr.responseText;
      } else {
        let [loggedSeller] = JSON.parse(xhr.responseText);
        localStorage.setItem("Auth", loggedSeller.id);
        localStorage.setItem("Name", loggedSeller.firstname);
        localStorage.setItem("User1", loggedSeller.lastname);
        localStorage.setItem("Email", loggedSeller.email);
        localStorage.setItem("Location", loggedSeller.location);
        localStorage.setItem("Contact", loggedSeller.phonenumber);
        window.location.assign("http://127.0.0.1:5501/home/index.html");
      }
    }
  };
  let sellerString = JSON.stringify(seller);
  xhr.open("POST", "http://localhost:3000/api/sellers/loginSeller", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(sellerString);
});
