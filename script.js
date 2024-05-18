
function share_txt(){
const shareData = {
  title: 'MDN',
  text: 'Learn web development on MDN!',
  url: 'https://developer.mozilla.org',
}

const btn = document.querySelector('button');
const resultPara = document.querySelector('.result');

// Must be triggered some kind of "user activation"
btn.addEventListener('click', async () => {
  try {
    await navigator.share(shareData)
    resultPara.textContent = 'MDN shared successfully'
  } catch(err) {
    resultPara.textContent = 'Error: ' + err
  }
});
}


//notifications

function notifyMe() {
// Let's check if the browser supports notifications
if (!("Notification" in window)) {
  alert("This browser does not support desktop notification");
}

// Let's check whether notification permissions have already been granted
else if (Notification.permission === "granted") {
  // If it's okay let's create a notification
  var notification = new Notification("Hi there!");
}

// Otherwise, we need to ask the user for permission
else if (Notification.permission !== "denied") {
  Notification.requestPermission().then(function (permission) {
    // If the user accepts, let's create a notification
    if (permission === "granted") {
      var notification = new Notification("Hi there!");
    }
  });
}

// At last, if the user has denied notifications, and you
// want to be respectful there is no need to bother them any more.
}
//notifications


//cut functions

function fct_cut(){
	var overlayme = document.getElementById("dialog-container");
	overlayme.style.display = "block";
document.getElementById('id_confrmdiv').style.display="block"; //this is the replace of this line
document.getElementById('id_truebtn').onclick = function(){
     /* Get the text field */
  var DelText = document.getElementById("textbox_id_1");
  /* Select the text field */
  DelText.select();
  DelText.setSelectionRange(0, 99999); /*For mobile devices*/
  /* Copy the text inside the text field */
  document.execCommand("delete");
  /* Alert the copied text 
  alert("Copied the text: " + copyText.value);*/
    /* alert('true'); */ 
	document.getElementById('id_confrmdiv').style.display = "none";
	    overlayme.style.display = "none";
	return false;
};
document.getElementById('id_falsebtn').onclick = function(){
    /* alert('false'); */
document.getElementById('id_confrmdiv').style.display = "none"; 
    overlayme.style.display = "none";
   return false;
};
}
//cut functions
