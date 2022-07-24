const myForm = document.querySelector('#signup-form')
const msg = document.querySelector('.msg');
myForm.addEventListener('submit', onSubmit);

function onSubmit(e) 
{
  const nam = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pNumber = document.getElementById("pNumber").value;
  const password = document.getElementById("password").value;
  //e.preventDefault();
  if(nam === '' || email === '' || pNumber === '' || password === '') 
  {
    msg.innerHTML = 'Please enter all fields*';
    msg.style.color = 'red'
    setTimeout(() => msg.remove(), 5000);
  } 
  else 
  {
    axios.post("http://3.101.24.227:3000/signup",{ name:nam,email:email,pNumber:pNumber,password:password}).then(result =>{
      if(result.data.success)
      {
        alert("Successfuly signed up")
      }
      else
      {
        alert("User already exists, Please Login")
      }
      if(result.data.success)
      {
        window.location.replace("http://3.101.24.227:3000/signin.html");
      }
      //window.location.replace("http://127.0.0.1:5500/frontend/signin.html");
      }).catch(err => console.log(err))
  }
}

