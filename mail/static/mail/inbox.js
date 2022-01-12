document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#detail-view").style.display = "none";

  // Clear out composition fields
  const recipients = document.querySelector('#compose-recipients');
  recipients.value = '';
  const subject = document.querySelector('#compose-subject');
  subject.value = '';
  const body = document.querySelector('#compose-body');
  body.value = '';
  
  document.querySelector('form').onsubmit = function(event){
    event.preventDefault();
    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: recipients.value,
        subject: subject.value,
        body: body.value
      })
    })
    .then(response => response.json())
    .then(obj => console.log(obj));
    load_mailbox("sent");
  };
}

function load_mail(email) {
  //Hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#detail-view").style.display = "block";
  document.querySelector("#detail-view").innerHTML = "";
  let emailDiv = document.createElement("div");
  emailDiv.className = "container bg-light border"
  emailDiv.innerHTML = `
  <p>From: ${email["sender"]}</p>
  <p>To: ${email["recipients"]}</p>
  <p>Subject: ${email["subject"]}</p>
  <p>Date: ${email["timestamp"]}</p>
  <p>Message: ${email["body"]}</p>
  `;
  document.querySelector("#detail-view").append(emailDiv);
  fetch("emails/"+email["id"], {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  }).then(response => console.log(response));//response.text()).then(obj => console.log(obj));
}

function create_row(email, mailbox) {
  // console.log(email)
  let containerDiv = document.createElement("div");
  let bgColorClass = ""
  if (email["read"]) {
    bgColorClass = "bg-light";
  } else {
    bgColorClass = "bg-white";
  }
  containerDiv.className = "container my-1 border border-info " + bgColorClass;
  let rowDiv = document.createElement("div");
  rowDiv.className = "row py-3";
  containerDiv.append(rowDiv);
  let nameDiv = document.createElement("div");
  nameDiv.className = "col col-3 font-weight-bold";
  // nameDiv.className = "col w-25 font-weight-bold";
  let nameText = ""
  if (mailbox == "sent") {
    nameText = "To: " + email["sender"];
  } else {
    nameText = "From: " + email["sender"];
  }
  nameDiv.innerHTML = nameText;
  rowDiv.append(nameDiv);

  let subjectDiv = document.createElement("div");
  subjectDiv.className = "col col-6 ";
  subjectDiv.innerHTML = email["subject"];
  rowDiv.append(subjectDiv);

  let dateDiv = document.createElement("div");
  dateDiv.className = "col col-3 text-right";
  // dateDiv.innerHTML = email["timestamp"];
  dateDiv.innerHTML = `<small class="text-muted"> ${email["timestamp"]} </small>`;
  rowDiv.append(dateDiv);
  containerDiv.onclick = function(){
    console.log(email);
    load_mail(email);
  };
  return containerDiv;
}

function show_emails(emails, mailbox) {
  for(i=0;i<emails.length;i++) {
    containerDiv = create_row(emails[i], mailbox);
    document.querySelector("#emails-view").append(containerDiv);
  };
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#detail-view").style.display = "none";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch("emails/"+mailbox)
  .then(response => response.json())
  .then(emails => show_emails(emails, mailbox));
}