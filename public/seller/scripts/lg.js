      function lg() {
        let lg = document.getElementById("slg");
        lg.addEventListener("click", (e) => {
          localStorage.removeItem("yammie/useLocalstorage/storage");
          window.location.assign("index.html");
        });
      }
      lg();