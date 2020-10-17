const [seller] = JSON.parse(
  localStorage.getItem("yammie/useLocalstorage/storage")
);
document.getElementById("User").innerHTML = seller.lastname;
const sellerId = seller.id;
const request = new XMLHttpRequest();
request.onreadystatechange = () => {
  if (request.status == 200 && request.readyState == 4) {
    
  let items=  document.querySelectorAll(".items");
  if(request.responseText=""){
    items.forEach((item)=>{
      item.innerHTML=0;
    })
  }else{
    items.forEach((item)=>{
      item.innerHTML=request.responseText;
    })
  }
    
  }
};
request.open(
  "GET",
  `/api/sellers/items/${sellerId}`,
  true
);
request.send();

const xhr=new XMLHttpRequest();
xhr.onreadystatechange=()=>{
if(xhr.status==200&&xhr.readyState==4){
  if(xhr.responseText=""){
    document.getElementById("pending").innerHTML=0;
  }
  else{
    document.getElementById("pending").innerHTML=xhr.responseText;
  }
  
}
}
xhr.open("GET",`/api/sellers/pending/${sellerId}`,true);
xhr.send();

const xhr1=new XMLHttpRequest();
xhr1.onreadystatechange=()=>{
  if(xhr1.status==200 && xhr1.readyState==4){
    if(xhr1.responseText=""){
      document.getElementById("total").innerHTML=0;
    }else{
      document.getElementById("total").innerHTML=xhr1.responseText;
    }
    
  }
}
xhr1.open("GET",`/api/sellers/totalProducts/${sellerId}`,true);
xhr1.send();