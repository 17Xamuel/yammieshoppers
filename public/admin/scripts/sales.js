const request=new XMLHttpRequest();
request.onreadystatechange=()=>{
    if(request.status==200 && request.readyState==4){
        if (request.responseText=="") {
            document.getElementById("orders").innerHTML=0;
        } else {
            
            document.getElementById("orders").innerHTML=request.responseText;
        }
    }
}
request.open("GET","/api/admin/orderNumber",true);
request.send();