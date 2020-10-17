//tooltip
$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

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
