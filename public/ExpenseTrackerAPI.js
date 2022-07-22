const myForm = document.querySelector('#my-form')
const expenseamountInput = document.querySelector('#expenseamount');
const descriptionInput = document.querySelector('#description');
const categoryInput = document.querySelector('#category')
const msg = document.querySelector('.msg');
myForm.addEventListener('submit', onSubmit);
document.addEventListener('DOMContentLoaded', displayPage(currentPage))
let token = localStorage.getItem('token')

var currentPage = 1;

const paginationc = document.getElementById('pagination')
var paginationItems = document.getElementsByClassName("pagination")[0];

let rank=0;
var LeaderboardItems = document.querySelector('#premium');

axios.get("http://3.101.24.227:3000/premiumUserOrNOt/"+`${token}`)
.then((resStatus) => { const premiumUser = resStatus.data;
  if(premiumUser)
{
  document.body.style.backgroundColor = "black";
  document.body.style.color = "white";
  LeaderboardItems.innerHTML='<h2>LeaderBoard</h2>';
  axios.get("http://3.101.24.227:3000/TotalExpense").then((res) => { sorting(res.data)})
}}).catch((err) => console.log(err))


function sorting(expenseDetails)
{
expenseDetails.sort((a, b) => b.expense-a.expense );
expenseDetails.forEach((e) => {displayLeaderboard(e.name,e.expense);} )
}

function displayLeaderboard(name,expense)
{
    rank=rank+1
    let UserExpenseBox = document.createElement("div")
    UserExpenseBox.classList.add('user-expense-box')
    UserExpenseBox.innerHTML = `<div class="user-expense-box">${rank}) ${expense} : ${name}</div>`;
    LeaderboardItems.append(UserExpenseBox)
}


function DisplayExpenses()
{
  token = localStorage.getItem('token')
  axios.get("http://3.101.24.227:3000/expense",{ headers: {"Authorization":token}})
  .then((res) => { 
  var html = ""
  for(var i=0;i<res.data.length;i++)
  {
    html+='<li>' + res.data[i].expenseamount +" - " + res.data[i].description +" - " + res.data[i].category + ' <button onclick="deleteRow('+i+')"> Delete Expense </button>' + ' <button onclick="editRow('+i+')"> Edit Expense </button>' + '</li>'  
  }
  document.getElementById("output").innerHTML = html   
  }).catch((err) => console.log(err))
}

function onSubmit(e) 
{
  e.preventDefault();
  if(expenseamountInput.value === '' || descriptionInput.value === '' || categoryInput.value === '') 
  {
    msg.innerHTML = 'Please enter all fields*';
    msg.style.color = 'red'
    setTimeout(() => msg.remove(), 5000);
  } 
  else 
  {
    token = localStorage.getItem('token')
    let myNewObj={expenseamount:expenseamountInput.value,description:descriptionInput.value,category:categoryInput.value}
    axios.post("http://3.101.24.227:3000/expense",myNewObj, { headers: {"Authorization":token}}).then( (res) => {displayPage(currentPage)}).catch( err => console.log(err))
    expenseamountInput.value = '';
    descriptionInput.value = '';
    categoryInput.value = ''; 
   // DisplayExpenses()  
  }
}


function deleteRow(i)
{
  axios.get("http://3.101.24.227:3000/expense",{ headers: {"Authorization":token}}).then((res) => {
    let url = "http://3.101.24.227:3000/deletExpense/"+res.data[i].id;
    //console.log(res.data[i].id)
    axios.delete(url,{ headers: {"Authorization" : token} }).then( res => displayPage(currentPage)).catch( err => console.log(err))
    }).catch(err => console.log(err))
}

function editRow(i)
{
  axios.get("http://3.101.24.227:3000/expense",{ headers: {"Authorization":token}}).then( res => {
    expenseamountInput.value = res.data[i].expenseamount;
    descriptionInput.value = res.data[i].description;
    categoryInput.value = res.data[i].category;
    deleteRow(i);
    displayPage(currentPage)
  }).catch( err => console.log(err))
}


///Premium Payment
document.getElementById('rzp-button1').onclick = async function (e) {
  const response  = await axios.get('http://3.101.24.227:3000/premiummembership', { headers: {"Authorization" : token} });
  var options =
  {
   "key": response.data.key_id, // Enter the Key ID generated from the Dashboard
   "name": "Test Company",
   "order_id": response.data.order.id, 
   "prefill": {"name": "Tester","email": "tester@gmail.com", "contact": "7700063"},"theme": {"color": "#3399cc"},
   "handler": function (response) {
      axios.post('http://3.101.24.227:3000/updatetransactionstatus',
      { order_id: options.order_id,payment_id: response.razorpay_payment_id,}, 
      { headers: {"Authorization" : token} })
      .then(() => {setUserAsPremium();alert('You are a Premium User Now');})
      .catch(() => {alert('Something went wrong. Try Again!!!')})
   },
};
const rzp1 = new Razorpay(options);
rzp1.open();
e.preventDefault();

rzp1.on('payment.failed', function (response){
alert(response.error.code);
alert(response.error.description);
alert(response.error.source);
alert(response.error.step);
alert(response.error.reason);
alert(response.error.metadata.order_id);
alert(response.error.metadata.payment_id);
});
}


function setUserAsPremium()
{
token = localStorage.getItem('token')
axios.post("http://3.101.24.227:3000/premiumUserOrNOt/"+`${token}`)
}


function downloadFile()
{
  axios.get('http://3.101.24.227:3000/user/downloadFile', { headers: {"Authorization" : token} })
  .then((response) => {
    if(response.status === 201)
    {
      var a = document.createElement("a");
      a.href = response.data.fileUrl;
      a.download = 'myExpense.csv';
      a.click();
    } 
    else { throw new Error(response.data.message) }   })
  .catch((err) => {console.log(err)});
}


paginationc.addEventListener('click',(e)=>{
  if(e.target.className=='pagination-btn')
  {
      const pageNumber = `${e.target.id.slice(3)}`
      currentPage = pageNumber
      displayPage(pageNumber)
      
  }
})



async function displayPage(pno = 1)
{
  let rowSize = localStorage.getItem('ITEMS_PER_PAGE')
  await axios.get("http://3.101.24.227:3000/setITEMS_PER_PAGE/"+rowSize)
  token = localStorage.getItem('token')
  let url = "http://3.101.24.227:3000/?page="+`${pno}`+"&token="+`${token}`;
  axios.get(url).then((res)=>{
      var html = ""
      paginationItems.innerHTML=''
      for(var i=0;i<res.data.expenses.length;i++)
      {
        html+='<li>' + res.data.expenses[i].expenseamount +" - " + res.data.expenses[i].description +" - " + res.data.expenses[i].category + ' <button onclick="deleteRow('+i+')"> Delete Expense </button>' + ' <button onclick="editRow('+i+')"> Edit Expense </button>' + '</li>'  
      }
      document.getElementById("output").innerHTML = html   
        if(res.data.currentPage!==1 && res.data.previousPage!==1 )
        pagination(1)
        if(res.data.hasPreviousPage)
            pagination(res.data.previousPage)
        pagination(res.data.currentPage)
        if(res.data.hasNextPage)
            pagination(res.data.nextPage)       
    })
}

function pagination(pageNumber)
{
    var paginationBox = document.createElement("div")
    paginationBox.innerHTML = `<button class="pagination-btn" id="pno${pageNumber}">${pageNumber}</button>`;
    paginationItems.append(paginationBox)       
}


async function getValue(option) {
  localStorage.setItem('ITEMS_PER_PAGE',option.value)
  await axios.get("http://3.101.24.227:3000/setITEMS_PER_PAGE/"+option.value)
  displayPage(currentPage)
}


