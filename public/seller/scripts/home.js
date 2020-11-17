const [seller] = JSON.parse(
  localStorage.getItem("yammie/useLocalstorage/storage")
);
document.getElementById("User").innerHTML = seller.username;

const sellerId = seller.id;
const request = new XMLHttpRequest();
request.onreadystatechange = () => {
  if (request.status == 200 && request.readyState == 4) {
    
  let items=  document.querySelectorAll(".items");
  if(request.responseText=""){
    items.forEach((item)=>{
      item.innerHTML=0;
    });
  }else{
    items.forEach((item)=>{
      item.innerHTML=request.responseText;
    });
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

const orders=new XMLHttpRequest();
orders.onreadystatechange=()=>{
  if(orders.status==200 && orders.readyState==4){
     if(orders.responseText=""){
       document.getElementById("approved").innerHTML=0;
     }else{
       document.getElementById("approved").innerHTML=orders.responseText;
     }
  }
};
orders.open("GET",`/api/sellers/doneOrdernumber/${sellerId}`,true);
orders.send();

const porders=new XMLHttpRequest();
porders.onreadystatechange=()=>{
  if(porders.status==200 && porders.readyState==4){
     if(porders.responseText=""){
       document.getElementById("opending").innerHTML=0;
     }else{
       document.getElementById("opending").innerHTML=porders.responseText;
     }
  }
};
porders.open("GET",`/api/sellers/pendingOrdernumber/${sellerId}`,true);
porders.send();

const totalOrders=new XMLHttpRequest();
totalOrders.onreadystatechange=()=>{
  if(totalOrders.status==200 && totalOrders.readyState==4){
    let orders=document.querySelectorAll("#ordernumber");
    if(totalOrders.responseText==""){
       orders.forEach((order)=>{
         order.innerHTML=0;
       });
    }else{
      orders.forEach((order)=>{
        order.innerHTML=totalOrders.responseText;
      });
    }
  }
};
totalOrders.open("GET",`/api/sellers/totalOrders/${sellerId}`,true);
totalOrders.send();

 const sales = new XMLHttpRequest();
      sales.onreadystatechange = () => {
        if (sales.readyState == 4 && sales.status == 200) {
          let [res]=JSON.parse(sales.responseText);
          if(!res.Sales){
            document.getElementById("sales").innerHTML="UGX "+0;
          }else{
            document.getElementById("sales").innerHTML="UGX "+res.Sales;
          }
        }
      };
      sales.open("GET", `/api/sellers/sales/${sellerId}`, true);
      sales.send();

      function lg() {
        let lg = document.getElementById("slg");
        lg.addEventListener("click", (e) => {
          localStorage.removeItem("yammie/useLocalstorage/storage");
          window.location.assign("index.html");
        });
      }
      lg();
