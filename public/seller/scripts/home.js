const [seller] = JSON.parse(
  localStorage.getItem("yammie/useLocalstorage/storage")
);
document.getElementById("User").innerHTML = seller.lastname;
const sellerId = seller.id;
const request = new XMLHttpRequest();
request.onreadystatechange = () => {
  if (request.status == 200 && request.readyState == 4) {
    document.getElementById("items").innerHTML = request.responseText;
  }
};
request.open(
  "GET",
  `http://localhost:3000/api/sellers/items/${sellerId}`,
  true
);
request.send();
