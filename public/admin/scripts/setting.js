const request = new XMLHttpRequest();
request.onreadystatechange = () => {
  if (request.readyState == 4 && request.status == 200) {
    let pendingSellers = JSON.parse(request.responseText);
    let row = "";
    pendingSellers.forEach((pendingSeller) => {
      row += ` <tr>
                      <td>${pendingSeller.firstname}</td>
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
            if ((request.responseText = "Deleted")) {
            }
          }
        };
        request.open(
          "GET",
          `http://localhost:3000/api/admin/deleteSeller/${deleteSeller}`,
          true
        );
        request.send();
      });
    });
    let confirmButtons = document.querySelectorAll(".-c-seller ");
    confirmButtons.forEach((confirmButton) => {
      confirmButton.addEventListener("click", (e) => {
        let confirmSeller = e.target.dataset.id;
        request.onreadystatechange = () => {
          if (request.readyState == 4 && request.status == 200) {
            if ((request.responseText = "Confirmed")) {
            }
          }
        };
        request.open(
          "GET",
          `http://localhost:3000/api/admin/confirmseller/${confirmSeller}`,
          true
        );
        request.send();
      });
    });
  }
};
request.open("GET", "http://localhost:3000/api/admin/sellerRequests", true);
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
                        <button type="submit" class="btn btn-danger btn-sm -a-product"
                        data-id="${pendingProduct.id}">
                          Accept
                        </button>
                      </td>
                      <td><button type="submit" class="btn btn-info btn-sm -d-product"
                      data-id="${pendingProduct.id}">
                        Delete
                      </button></td>
                    </tr>`;
    });
    document.getElementById("pendingProducts").innerHTML = rows;
    document.getElementById("ppn").textContent = `(${pendingProducts.length})`;
    let deleteProducts = document.querySelectorAll(".-d-product");
    deleteProducts.forEach((deleteProduct) => {
      deleteProduct.addEventListener("click", (e) => {
        let deleteSellerProduct = e.target.dataset.id;
        request.onreadystatechange = () => {
          if (request.readyState == 4 && request.status == 200) {
          }
        };
        request.open(
          "GET",
          `http://localhost:3000/api/admin/deleteProduct/${deleteSellerProduct}`,
          true
        );
        request.send();
      });
    });
    let acceptButtons = document.querySelectorAll(".-a-product");
    acceptButtons.forEach((acceptButton) => {
      acceptButton.addEventListener("click", (e) => {
        let acceptProduct = e.target.dataset.id;
        xhr.onreadystatechange = () => {
          if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
          }
        };
        xhr.open(
          "GET",
          `http://localhost:3000/api/admin/confirmProduct/${acceptProduct}`,
          true
        );
        xhr.send();
      });
    });
  }
};
xhr.open("GET", "http://localhost:3000/api/admin/pendingProduct", true);
xhr.send();
