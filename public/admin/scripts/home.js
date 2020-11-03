const xhr1 = new XMLHttpRequest();
xhr1.onreadystatechange = ()=>{
  if(xhr1.readyState==4 && xhr1.status==200){
    if(xhr1.responseText==""){
      document.getElementById("products").innerHTML=0;
    }else {
      document.getElementById("products").innerHTML=xhr1.responseText;
    }
  }
};
xhr1.open("GET","/api/admin/allProducts",true);
xhr1.send();

//Number of Users
let xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
  if (xhr.status == 200 && xhr.readyState == 4) {
    if(xhr.responseText==""){
      document.getElementById("users-number").innerHTML=0;
    }else{
      document.getElementById("users-number").innerHTML = xhr.responseText;
    }
    
  }
};
xhr.open("GET", "/api/admin/customers", true);
xhr.send();

const orders = new XMLHttpRequest();
orders.onreadystatechange = () =>{
  if(orders.status==200 && orders.readyState==4){
     
     let pendingOrders=JSON.parse(orders.responseText);
     let row="";
     pendingOrders.forEach((order)=>{
         row+= `<tr>
       <td>${order.order_number}</td>
       <td>${order.order_amount}</td>
       <td>${order.order_delivery_method}</td>
       <td>
       <a href="order.html?order=${order.order_id}">
         <button type="button" class="btn btn-info btn-sm">
           Details
         </button></a>
       </td>
       <td>
         <button type="button" class="btn btn-success btn-sm">
           Finish
         </button>
       </td>
     </tr>`
     });
     document.getElementById("pendingOrders").innerHTML=row;

  }
}
orders.open("GET","/api/admin/pendingOrders",true);
orders.send();

const request = new XMLHttpRequest();
request.onreadystatechange = () => {
    if (request.status == 200 && request.readyState == 4) {
        if (request.responseText == "") {
            document.getElementById("orders").innerHTML = 0;
        } else {

            document.getElementById("orders").innerHTML = request.responseText;
        }
    }
}
request.open("GET", "/api/admin/orderNumber", true);
request.send();

//Showing Date
const currentdate = new Date();
day = currentdate.getDate();
month = currentdate.getMonth() + 1;
year = currentdate.getFullYear();
document.getElementById("showDate").innerHTML = day + "/" + month + "/" + year;

//showing time
const currentTime = new Date();
hours = currentTime.getHours();
minutes = currentTime.getMinutes();

if (minutes < 10) {
  minutes = "0" + minutes;
}
let suffix = "AM";
if (hours >= 12) {
  suffix = "PM";
  hours = hours - 12;
}
if (hours == 0) {
  hours = 12;
}
document.getElementById("showTime").innerHTML =
  hours + ":" + minutes + " " + suffix;

