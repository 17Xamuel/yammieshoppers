const [seller] = JSON.parse(
  localStorage.getItem("yammie/useLocalstorage/storage")
);
document.getElementById("User").innerHTML = seller.lastname;

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
                    </tr>`;
    });
    document.querySelector(".sellerProducts").innerHTML = row;
  }
};
xhr.open("GET", `/api/sellers/getPendingProducts/${sellerId}`, true);
xhr.send();

const req = new XMLHttpRequest();

req.onreadystatechange = () => {
  if (req.status == 200 && req.readyState == 4) {
    let approvedProducts = JSON.parse(req.responseText);
    let rows = "";
    approvedProducts.forEach((approvedProduct) => {
      let image = JSON.parse(approvedProduct.images);
      rows += `<tr>
                      <td>
                        <img
                          src="/${image[0]}"
                          width="50"
                          height="50"
                          class="rounded-circle"
                        />
                      </td>
                      <td>${approvedProduct.product}</td>
                      <td>${approvedProduct.quantity}</td>
                      <td>${approvedProduct.price}</td>
                      <td>
                        <span class="badge badge-success w-75 py-2">Approved</span>
                      </td>
                    </tr>`;
    });
    document.getElementById("products").innerHTML = rows;
  }
};
req.open(
  "GET",
  `/api/sellers/getApprovedProducts/${sellerId}`,
  true
);
req.send();
