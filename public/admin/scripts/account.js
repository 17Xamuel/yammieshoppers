function logout() {
  let logout = document.getElementById("alg");
  logout.addEventListener("click", (e) => {
    localStorage.removeItem("admin/yammie");
    window.location.assign("index");
  });
}
logout();

let admin = JSON.parse(localStorage.getItem("admin/yammie"));
document.getElementById("user").innerHTML = admin[0];

document.getElementById("year").innerHTML = new Date().getFullYear();
