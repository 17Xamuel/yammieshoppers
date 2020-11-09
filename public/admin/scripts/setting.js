
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
