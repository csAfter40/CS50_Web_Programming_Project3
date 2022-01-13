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

function toggle_email_archived(id){
  //Sends a request to server in order to toggle email.archive property(True or False).
  //First get the email.archive  property value
  fetch("emails/"+id).then(response => response.json()).then(object => {
    console.log(object);
    return object.archived
  }).then(bool => {
    fetch("emails/"+id, {
      method: "PUT",
      body: JSON.stringify({
        archived: !bool //Toggle archive property
      })
    }).then(response => {
      //If email.archive property is toggled successfully, toggle the appearance of archive button in DOM.
      console.log(response)
      if (response["status"] == "204") {
        toggle_archive_button();
      }
    });
  })
  
  
}

function make_button_archive(button){
  // const button = document.querySelector("#archive");
  button.innerHTML = "Archive";
  button.classList.remove("btn-outline-danger");
  button.classList.add("btn-outline-primary");
}

function make_button_unarchive(button){
  // const button = document.querySelector("#archive");
  button.innerHTML = "Unarchive";
  button.classList.remove("btn-outline-primary");
  button.classList.add("btn-outline-danger");
}

function toggle_archive_button(){
  // Toggles the archive button between "archive" and unarchive
  const button = document.querySelector("#archive");
  if (button.classList.contains("btn-outline-danger")){
    make_button_archive(button);
    // button.innerHTML = "Archive";
    // button.classList.remove("btn-outline-danger");
    // button.classList.add("btn-outline-primary");
  } else {
    make_button_unarchive(button);
    // button.innerHTML = "Unarchive";
    // button.classList.remove("btn-outline-primary");
    // button.classList.add("btn-outline-danger");
  }
}

function load_mail(email) {
  //Hide email and compose views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  // Display detail view
  detailDiv = document.querySelector("#detail-view");
  detailDiv.style.display = "block";
  // Fill email data
  document.querySelector("#sender").innerHTML = email["sender"];
  document.querySelector("#recipients").innerHTML = email["recipients"];
  document.querySelector("#subject").innerHTML = email["subject"];
  document.querySelector("#timestamp").innerHTML = email["timestamp"];
  document.querySelector("#email-body").innerHTML = email["body"];
  archiveButton = document.querySelector("#archive");
  if (email["archived"]) {
    make_button_unarchive(archiveButton);
  } else {
    make_button_archive(archiveButton);
  }
  archiveButton.onclick = function(){
    toggle_email_archived(email["id"]);
  };

  fetch("emails/"+email["id"], {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  });
}

function create_row(email, mailbox) {
  // console.log(email)
  const containerDiv = document.createElement("div");
  let bgColorClass = ""
  if (email["read"]) {
    bgColorClass = "bg-light";
  } else {
    bgColorClass = "bg-white";
  }
  containerDiv.className = "container my-1 border border-info " + bgColorClass;
  const rowDiv = document.createElement("div");
  rowDiv.className = "row py-3";
  containerDiv.append(rowDiv);
  const nameDiv = document.createElement("div");
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

  const subjectDiv = document.createElement("div");
  subjectDiv.className = "col col-6 ";
  subjectDiv.innerHTML = email["subject"];
  rowDiv.append(subjectDiv);

  const dateDiv = document.createElement("div");
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