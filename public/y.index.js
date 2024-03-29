function ctg_storage(c, url) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let _c = JSON.parse(xhr.responseText),
        group = "";
      _c.forEach((item) => {
        group += `
             <a class="item -ct-item" href="./item?item=${item.id}">
                      <div class="-d">
                        ${
                          item.discount != 0 && item.discount !== null
                            ? "-" + item.discount + "%"
                            : ""
                        }
                      </div>
                      <div class="_image">
                        <img
                          src="./resources/placeholder.png"
                          data-src="${JSON.parse(item.images)[0]}"
                          alt="${item.product}"
                          width="100%"
                          height="100%"
                          class="_ctg-image-load-rv"
                          style="object-fit: cover"
                        />
                      </div>
                      <div class="-i-dtl">
                        <div class="it-nm">
                          ${item.product} - ${item.description}
                        </div>
                        <div class="it-pr pr price-current">${
                          "UGX " +
                          (item.discount
                            ? (item.price * (100 - item.discount)) / 100
                            : item.price)
                        }</div>
                         <div class="pre-it-pr pr price-prev">${
                           item.discount ? "UGX " + item.price : ""
                         }</div>
                      </div>
                    </a>
                    
            `;
      });
      c.innerHTML += group;
      document.querySelectorAll(".-d").forEach((item) => {
        if (item.innerText == "") item.style.display = "none";
      });
      let images = document.images;
      for (let i = 0; i < images.length; i++) {
        if (images[i].className == "_ctg-image-load-rv") {
          _load(images[i], images[i].dataset.src);
        }
      }
      function _load(i, d) {
        let image_true = new Image();
        image_true.onload = function () {
          i.src = this.src;
        };
        image_true.src = d;
      }
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

function _rv() {
  if (
    localStorage.getItem("_rv") &&
    document.querySelector(".-ct-recentlyviewed")
  ) {
    let _rv = JSON.parse(localStorage.getItem("_rv"));
    document.querySelector(".-ct-recentlyviewed").innerHTML = "";
    _rv.forEach((item) => {
      ctg_storage(
        document.querySelector(".-ct-recentlyviewed"),
        `/api/user/product/ct/${item}`
      );
    });
  }
}
if (!localStorage.getItem("_rv") && document.querySelector(".rv-ctr") != null) {
  document.querySelector(".rv-ctr").style.display = "none";
}
_rv();
