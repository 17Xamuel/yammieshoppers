  function logout(){
    let logout=document.getElementById("alg");
    logout.addEventListener("click",(e)=>{
        localStorage.removeItem("admin/yammie");
        window.location.assign("index.html");
    });
}
logout();

let admin=JSON.parse(localStorage.getItem("admin/yammie"));
  document.getElementById("user").innerHTML=admin[0];
  document.getElementById("am").innerHTML=admin[0];
  document.getElementById("ae").innerHTML=admin[3];
  document.getElementById("at").innerHTML=admin[2];
  document.getElementById("aphn").innerHTML=admin[1];