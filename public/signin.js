const myForm = document.querySelector('#signin-form')
const msg = document.querySelector('.msg');
myForm.addEventListener('submit', onSubmit);

function onSubmit(e) 
{
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  e.preventDefault();
  if(email === '' || password === '') 
  {
    msg.innerHTML = 'Please enter all fields*';
    msg.style.color = 'red'
    setTimeout(() => msg.remove(), 5000);
  } 
  else 
  {
    axios.post("http://3.101.24.227:3000/signin",{email:email,password:password}).then(result =>{
      if(result.data.success)
      {
        localStorage.setItem('token',result.data.token)
      }
      else
      {
        alert("Login failed")
      }


      if(result.data.success)
      {
        window.location.replace("http://3.101.24.227:3000/expenseTracker.html");
      }
      }).catch(err => console.log(err))
  }
}
