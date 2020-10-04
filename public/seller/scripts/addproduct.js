let productForm = document.getElementById("productForm");
productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let Product = document.getElementById("productname").value;
  let Price = document.getElementById("price").value;
  let Description = document.getElementById("description").value;
  let Brand = document.getElementById("productBrand").value;
  let Category = document.getElementById("category").value;
  let Subcategory = document.getElementById("subcategory").value;
  let Discount = document.getElementById("discount").value;
  let ImageList = document.querySelector("[name=images]").files;

  const formData = new FormData();
  formData.append("Product", Product);
  formData.append("Price", Price);
  formData.append("Description", Description);
  formData.append("Brand", Brand);
  formData.append("Category", Category);
  formData.append("Subcategory", Subcategory);
  formData.append("Discount", Discount);

  for (var i = 0; i < ImageList.length; i++) {
    formData.append(`Image${i}`, ImageList[i]);
  }

  let productData = {};
  for (var key of formData.keys()) {
    productData[key] = formData.get(key);
  }

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      document.getElementById("messages").innerHTML = xhr.responseText;
    }
  };

  let productInfo = JSON.stringify(productData);

  xhr.open("POST", "http://localhost:3000/api/sellers/addProduct", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(productInfo);
});
