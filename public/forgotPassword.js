const myForm = document.querySelector('#forgotPassword-form')
const msg = document.querySelector('.msg');
myForm.addEventListener('submit', onSubmit);

function onSubmit(e) 
{
  const email = document.getElementById("email").value;
  e.preventDefault();
  if(email === '') 
  {
    msg.innerHTML = 'Please enter Email id';
    msg.style.color = 'red'
    setTimeout(() => msg.remove(), 5000);
  } 
  else 
  {
    axios.post("http://3.101.24.227:3000/password/forgotpassword",{email:email}).then((ResetLink) => {console.log(ResetLink.data)}).catch(err => console.log(err))
  }
}