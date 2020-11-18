let sellerForm = document.getElementById("sellerForm");
sellerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let seller = {};
  seller.username = document.getElementById("name").value;
  seller.email = document.getElementById("email").value;
  seller.phonenumber = document.getElementById("phone").value;
  seller.location = document.getElementById("location").value;
  seller.password = document.getElementById("password").value;
  seller.businessname = document.getElementById("bname").value;
  seller.category = document.getElementById("category").value;
  seller.passwordConfirm = document.getElementById("pass-repeat").value;

  let sellerString = JSON.stringify(seller);

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      document.getElementById("outcome").innerHTML = xhr.responseText;
    }
  };
  xhr.open("POST", "/api/sellers/registerSeller", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(sellerString);
});
