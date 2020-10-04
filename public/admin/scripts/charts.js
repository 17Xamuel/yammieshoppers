//Income
let myearnings = document.getElementById("earnings").getContext("2d");
let Earning = new Chart(myearnings, {
  type: "line",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Losses",
        backgroundColor: "rgba(3,88,106,0.3)",
        borderColor: "rgba(3,88,106,0.7)",
        pointBorderColor: "rgba(3,88,106,0.7)",
        pointHoverBorderColor: "rgba(151,187,205,1)",
        pointBackgroundColor: "rgba(3,88,106,0.7)",
        pointHoverBackgroundColor: "#fff",
        pointBoderWidth: 1,
        data: [78, 45, 23, 67, 95, 87, 43, 54, 60, 13, 19, 34],
      },
      {
        label: "Profit",
        backgroundColor: "rgba(38,185,154,0.31)",
        borderColor: "rgba(38,185,154,0.7)",
        pointBorderColor: "rgba(38,185,154,0.7)",
        pointHoverBackgroundColor: "rgba(38,185,154,0.7)",
        pointHoverBorderColor: "#fff",
        borderWitdh: 1,
        data: [45, 78, 56, 23, 67, 89, 95, 12, 45, 35, 54, 25],
      },
    ],
  },
});

//Budget
let mybudget = document.getElementById("budget").getContext("2d");
let Budget = new Chart(mybudget, {
  type: "bar",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Income",
        backgroundColor: "rgba(38,185,154,0.31)",
        borderColor: "rgba(38,185,154,0.7)",
        hoverBorderColor: "#fff",
        borderWitdh: 1,
        data: [78, 45, 23, 67, 95, 87, 43, 54, 60, 13, 19, 34],
      },
      {
        label: "Expenses",
        backgroundColor: "rgba(3,88,106,0.3)",
        borderColor: "rgba(3,88,106,0.7)",
        hoverBorderColor: "#fff",
        borderWitdh: 1,
        data: [85, 56, 12, 46, 33, 89, 12, 28, 98, 12, 65, 74],
      },
    ],
  },
});

//Monetisation

let mymoney = document.getElementById("monetisation").getContext("2d");
let Monetisation = new Chart(mymoney, {
  type: "line",
  data: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Sales",
        backgroundColor: "rgba(38,185,154,0.31)",
        borderColor: "rgba(38,185,154,0.7)",
        hoverBorderColor: "#fff",
        borderWitdh: 1,
        data: [45, 23, 63, 89, 12, 54, 33, 52, 29, 15, 49, 79],
      },
      {
        label: "Orders",
        backgroundColor: "rgba(3,88,106,0.3)",
        borderColor: "rgba(3,88,106,0.7)",
        hoverBorderColor: "#fff",
        borderWitdh: 1,
        data: [20, 68, 45, 96, 19, 73, 84, 54, 46, 41, 92, 32],
      },
    ],
  },
});
//Application Usage
let myapplication = document
  .getElementById("applicationUsage")
  .getContext("2d");
let inputs = {
  datasets: [
    {
      data: [120, 50, 140, 180],
      backgroundColor: ["#455C73", "#9B59B6", "#BDC3C7", "#26B99A"],
      label: "Usage",
    },
  ],
  labels: ["Visitors", "Customers", "Sellers", "Items"],
};

let Application = new Chart(myapplication, {
  type: "doughnut",
  data: inputs,
});
