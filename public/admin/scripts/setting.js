const request = new XMLHttpRequest();
request.onreadystatechange = () => {
  if (request.readyState == 4 && request.status == 200) {
    let pendingSellers = JSON.parse(request.responseText);
    let row = "";
    pendingSellers.forEach((pendingSeller) => {
      row += ` <tr>
                      <td>${pendingSeller.username}</td>
                      <td>${pendingSeller.email}</td>
                      <td>${pendingSeller.location}</td>
                      <td>${pendingSeller.phonenumber}</td>
                      <td>
                        <button type="button" class="btn btn-primary btn-sm
                        -c-seller" data-id="${pendingSeller.id}" id="confirmed">
                          Confirm
                        </button>
                      </td>
                      <td><button type="button" class="btn btn-danger btn-sm -d-seller" 
                      data-id="${pendingSeller.id}" id="deleted">Delete</button></td>
                    </tr>`;
    });
    document.getElementById("sellerRequests").innerHTML = row;
    document.getElementById("psn").textContent = `(${pendingSellers.length})`;
    let deleteButtons = document.querySelectorAll(".-d-seller");
    deleteButtons.forEach((deleteButton) => {
      deleteButton.addEventListener("click", (e) => {
        let deleteSeller = e.target.dataset.id;
        request.onreadystatechange = () => {
          if (request.readyState == 4 && request.status == 200) {
          }
        };
        request.open("GET", `/api/admin/deleteSeller/${deleteSeller}`, true);
        request.send();
      });
    });
    let confirmButtons = document.querySelectorAll(".-c-seller ");
    confirmButtons.forEach((confirmButton) => {
      confirmButton.addEventListener("click", (e) => {
        let confirmSeller = e.target.dataset.id;
        request.onreadystatechange = () => {
          if (request.readyState == 4 && request.status == 200) {
            if (request.responseText == "Confirmed") {
              window.location.reload();
            }
          }
        };
        request.open("GET", `/api/admin/confirmSeller/${confirmSeller}`);
        request.send();
      });
    });
  }
};
request.open("GET", "/api/admin/sellerRequests", true);
request.send();

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    let pendingProducts = JSON.parse(xhr.responseText);

    let rows = "";
    pendingProducts.forEach((pendingProduct) => {
      let images = JSON.parse(pendingProduct.images);

      rows += ` <tr>
                      <td>
                        <img
                          src="/${images[0]}"
                          width="50"
                          height="50"
                          class="rounded-circle"
                        />
                      </td>
                      <td>${pendingProduct.product}</td>
                      <td>${pendingProduct.price}</td>
                      <td>${pendingProduct.description}</td>
                      <td>
                      <a href="product-details.html?item=${pendingProduct.id}">
                      <button type="submit" class="btn btn-info btn-sm"
                        data-id="${pendingProduct.id}">
                          Details
                        </button>
                        </a>
                        </td>
                      <td>
                      <button 
                      type="submit" 
                      class="btn btn-danger btn-sm -d-product" 
                      data-id="${pendingProduct.id}"
                      data-images="${pendingProduct.images}">
                        Delete
                      </button></td>
                    </tr>`;
    });
    document.getElementById("pendingProducts").innerHTML = rows;
    document.getElementById("ppn").textContent = `(${pendingProducts.length})`;
    let deleteButtons = document.querySelectorAll(".-d-product");
    deleteButtons.forEach((deleteButton) => {
      deleteButton.addEventListener("click", (e) => {
        let deleteProduct = e.target.dataset.id;
        xhr.onreadystatechange = () => {
          if (xhr.readyState == 4 && xhr.status == 200) {
            if (xhr.responseText == "Deleted") {
              window.location.reload();
            } else {
              console.log("Error");
            }
          }
        };
        xhr.open("DELETE", `/deleteProduct/${deleteProduct}`, true);
        xhr.send({});
      });
    });
  }
};

xhr.open("GET", "/api/admin/pendingProduct", true);
xhr.send();
