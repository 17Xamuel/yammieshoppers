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
              window.location.reload(
                "http://127.0.0.1:5500/views/settings.html"
              );
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
              window.location.reload(
                "http://127.0.0.1:5500/views/settings.html"
              );
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
