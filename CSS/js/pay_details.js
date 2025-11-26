// your code goes here
const methods = document.querySelectorAll(".method");
const cardForm = document.getElementById("card-form");
const payBtn = document.getElementById("pay");
const modal = document.getElementById("modal");
const openUpi = document.getElementById("open-upi");
const closeUpi = document.getElementById("close-upi");

let selected = "upi";

methods.forEach((m) => {
  m.addEventListener("click", () => {
    methods.forEach((x) => x.classList.remove("selected"));
    m.classList.add("selected");
    selected = m.dataset.method;
    cardForm.classList.toggle("hidden", selected !== "card");
  });
});

payBtn.addEventListener("click", () => {
  if (selected === "upi") {
    modal.style.display = "flex";
  } else if (selected === "card") {
    alert("Card payment demo — integrate gateway SDK.");
  } else if (selected === "netbanking") {
    alert("Redirecting to Netbanking demo.");
  } else if (selected === "cod") {
    alert("Order placed successfully with COD!");
  }
});

closeUpi.addEventListener("click", () => {
  modal.style.display = "none";
});

openUpi.addEventListener("click", () => {
  window.location.href = "upi://pay?pa=merchant@upi&pn=Zaros&am=299&cu=INR";
});
