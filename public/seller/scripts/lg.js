      function lg() {
        let lg = document.getElementById("slg");
        lg.addEventListener("click", (e) => {
          localStorage.removeItem("yammie/useLocalstorage/storage");
          window.location.assign("index.html");
        });
      }
      lg();

      
      function ref() {
        let page = document.getElementById("air");
        page.addEventListener("click", (e) => {
          window.location.reload("add-item.html");
        });
      }
      ref();