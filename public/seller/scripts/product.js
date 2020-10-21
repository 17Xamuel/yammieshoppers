const [seller] = JSON.parse(
  localStorage.getItem("yammie/useLocalstorage/storage")
);
document.getElementById("User").innerHTML = seller.username;

const xhr = new XMLHttpRequest();
const sellerId = seller.id;
xhr.onreadystatechange = () => {
  if (xhr.status == 200 && xhr.readyState == 4) {
    let PendingProducts = JSON.parse(xhr.responseText);
    let row = "";
    PendingProducts.forEach((PendingProduct) => {
      let images = JSON.parse(PendingProduct.images);
      row += `<tr>
                      <td>
                        <img
                          src="/${images[0]}"
                          width="50"
                          height="50"
                          class="rounded-circle"
                        />
                      </td>
                      <td>${PendingProduct.product}</td>
                      <td>${PendingProduct.quantity}</td>
                      <td>${PendingProduct.price}</td>
                      <td>
                        <span class="badge badge-danger w-75 py-2">Pending</span>
                      </td>
                      <td><a href="productdetails.html?pendingProduct=${PendingProduct.id}">
                      <button type="button" class="btn btn-info btn-sm">Details</button>
                      </a></td>
                    </tr>`;
    });
    document.querySelector(".sellerProducts").innerHTML = row;


  }
};
xhr.open("GET", `/api/sellers/getPendingProducts/${sellerId}`, true);
xhr.send();




