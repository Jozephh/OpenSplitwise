let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

document.getElementById("expense-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const payer = document.getElementById("payer").value;
  const split = document.getElementById("split").value;

  const expense = {
    desc,
    amount,
    payer,
    split,
    date: new Date().toISOString()
  };

  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  this.reset();
  render();
});

function render() {
  const list = document.getElementById("expense-list");
  list.innerHTML = "";
  let joeTotal = 0, caitlinTotal = 0;

  expenses.forEach((e) => {
    const li = document.createElement("li");
    li.textContent = `${e.date.split("T")[0]} - ${e.payer} paid £${e.amount.toFixed(2)} for ${e.desc} (${e.split})`;
    list.appendChild(li);

    let share = e.amount / 2;
    switch (e.split) {
      case "50":
        if (e.payer === "Joe") caitlinTotal += share;
        else joeTotal += share;
        break;
      case "joe":
        if (e.payer === "Joe") caitlinTotal += e.amount;
        break;
      case "caitlin":
        if (e.payer === "Caitlin") joeTotal += e.amount;
        break;
    }
  });

  const net = joeTotal - caitlinTotal;
  const output = document.getElementById("balance-output");
  if (net > 0) output.textContent = `Caitlin owes Joe £${net.toFixed(2)}`;
  else if (net < 0) output.textContent = `Joe owes Caitlin £${Math.abs(net).toFixed(2)}`;
  else output.textContent = `You’re even! 🎉`;
}

function settleUp() {
  expenses.push({
    desc: "Settlement",
    amount: 0,
    payer: "System",
    split: "50",
    date: new Date().toISOString()
  });
  localStorage.setItem("expenses", JSON.stringify([]));
  expenses = [];
  render();
}

function exportCSV() {
  let csv = "Date,Description,Amount,Payer,Split\n";
  expenses.forEach(e => {
    csv += `${e.date},${e.desc},${e.amount},${e.payer},${e.split}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "budget.csv";
  link.click();
}

render();
