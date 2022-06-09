// Set these for each customer demo...
const CUSTOMER_NAME = "";
const CUSTOMER_IMAGE = "";


// Set this stuff once and Fuggedaboutit...
const WXCC_TELEPHONE_NUMBER = "";
const IMI_SMS_WEBHOOK = "";
const IMI_CALLBACK_WEBHOOK = "";
const demoToolboxUserId = "";
const AGENT_IMAGE = "";


//-----------------------------------------//
// Dont change anything below this line
//-----------------------------------------//


// Set title & image for the customer name
document.title = CUSTOMER_NAME;
document.getElementById("bgImage").src = CUSTOMER_IMAGE;

// Set Agent Image link
document.getElementById("agent").src = AGENT_IMAGE;

// Set telephone number in Call Us Modal
const telephone = document.getElementById('telephone');
telephone.href = "tel:+" + WXCC_TELEPHONE_NUMBER;
telephone.text = formatPhoneNumber(WXCC_TELEPHONE_NUMBER);


// Get references to Bootstrap components
// Ignore the errors/red circles below
// Bootstrap class is defined the the bootstrap.js
const bsContactMenu = new bootstrap.Offcanvas('#contactMenu');
const bsCallModal = new bootstrap.Modal('#callModal');
const bsCallbackModal = new bootstrap.Modal('#callbackModal');
const bsEmailModal = new bootstrap.Modal('#emailModal');
const bsSmsModal = new bootstrap.Modal('#smsModal');
const bsSuccessModal = new bootstrap.Modal('#successModal');
const bsFailureModal = new bootstrap.Modal('#failureModal');

// Get reference to HTML elements
const successMessage = document.getElementById('successMessage');
const smsName = document.getElementById('smsName');
const smsNumber = document.getElementById('smsNumber');
const callbackName = document.getElementById('callbackName');
const callbackNumber = document.getElementById('callbackNumber');
const callbackDepartment = document.getElementById('callbackDepartment');
const callbackReason = document.getElementById('callbackReason');
const emailName = document.getElementById('emailName');
const emailAddress = document.getElementById('emailAddress');
const emailSubject = document.getElementById('emailSubject');
const emailMessage = document.getElementById('emailMessage');
const callbackForm = document.getElementById('callbackForm');
const emailForm = document.getElementById('emailForm');
const smsForm = document.getElementById('smsForm');

// Get reference to IMI Web Chat div
const imiWebChat = document.getElementById('divicw');


// Add Event Listeners for Contact Menu Items
document.getElementById('callLink').addEventListener('click', function () {
    bsToggle(bsCallModal);
    bsToggle(bsContactMenu);
});

document.getElementById('callbackLink').addEventListener('click', function () {
    bsToggle(bsCallbackModal);
    bsToggle(bsContactMenu);
});

document.getElementById('emailLink').addEventListener('click', function () {
    bsToggle(bsEmailModal);
    bsToggle(bsContactMenu);
});

document.getElementById('smsLink').addEventListener('click', function () {
    bsToggle(bsSmsModal);
    bsToggle(bsContactMenu);
});

// Hide imi when the Contact Menu is open
document.getElementById('contactMenu').addEventListener('shown.bs.offcanvas', () => {
    imiWebChat.hidden = true;
});

// Show imi when the Contact Menu is closed
document.getElementById('contactMenu').addEventListener('hidden.bs.offcanvas', () => {
    imiWebChat.hidden = false;
});

// Format phone to +E164
function formatPhoneNumber(phoneNumber) {
  const phoneNumberString = phoneNumber.toString();
  const match = phoneNumberString.match(/[1]?(\d{3})(\d{3})(\d{4})$/);
  return `+1(${match[1]})${match[2]}-${match[3]}`
}

// Toggles a bootstrap component
function bsToggle(bsComponent) {
    bsComponent.toggle();
}

// Gets the callback delay from the callback modal
function getCallbackDelay() {
  const immediateCallback = document.getElementById('immediateCallback');
  const delayCallbackMinutes = document.getElementById('delayCallbackMinutes');
  
  if (immediateCallback.checked ) {
    return 0
  } else {
    return delayCallbackMinutes.value * 60
  }
}


// Improved version of fetch() with a configurable timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 6000 } = options;  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {...options, signal: controller.signal});
  clearTimeout(id);
  return response;
}


// Send callback to imi
async function sendCallback() {
  try {
    const delay = getCallbackDelay();
    
    const response = await fetchWithTimeout(IMI_CALLBACK_WEBHOOK, {
      timeout: 6000,
      method: 'POST',
      body: JSON.stringify({
        name: callbackName.value,
        number: callbackNumber.value,
        department: callbackDepartment.value,
        reason: callbackReason.value,
        delay: delay,
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    console.log('Callback Status Code:', response.status);
    console.log('callback Response Data:', data);
    
    const number = callbackNumber.value;
    callbackName.value = "";
    callbackNumber.value = "";
    callbackDepartment.value = "";
    callbackReason.value = "";

    if (data.response[0].code == 1002) {
      successMessage.innerHTML = `We will call you at ${formatPhoneNumber(number)} shortly.`;
      bsToggle(bsSuccessModal);
    } else {
      bsToggle(bsFailureModal);
    }
  } catch (error) {
    bsToggle(bsFailureModal);
    console.log('Callback something went wrong!');
    console.log('Callback Error:', error);
  }
}


// Send Email to dCloud
async function sendEmail() {
  try {
    const response = await fetchWithTimeout('https://mm-brand.cxdemo.net/api/v1/email', {
      timeout: 6000, // six seconds
      method: 'POST',
      body: JSON.stringify({
        "name": emailName.value,
        "email": emailAddress.value,
        "subject": emailSubject.value,
        "body": emailMessage.value,
        "session": "custom",
        "datacenter": "webex",
        "userId": demoToolboxUserId,
        "demo": "webex-custom",
        "isUpstream": false,
        "isInstantDemo": true,
        "isSfdc": false
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    console.log('Email Status Code:', response.status);
    console.log('Email Response Data:', data);
    emailName.value = "";
    emailAddress.value = "";
    emailSubject.value = "";
    emailMessage.value = "";
    if (response.status == 202) {
      successMessage.innerHTML = `Thank you for your email.  We will respond shortly.`;
      bsToggle(bsSuccessModal);
    } else {
      bsToggle(bsFailureModal);
    }
  } catch (error) {
    bsToggle(bsFailureModal);
    console.log('Email something went wrong!');
    console.log('Email Error:', error);
  }
}


// Send SMS to imi
async function sendSMS() {
  try {
    const response = await fetchWithTimeout(IMI_SMS_WEBHOOK, {
      timeout: 6000,
      method: 'POST',
      body: JSON.stringify({
        name: smsName.value,
        number: smsNumber.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    console.log('SMS Status Code:', response.status);
    console.log('SMS Response Data:', data);
    
    const number = smsNumber.value;
    smsName.value = "";
    smsNumber.value = "";

    if (data.response[0].code == 1002) {
      successMessage.innerHTML = `We sent a SMS to your ${formatPhoneNumber(number)} number.`;
      bsToggle(bsSuccessModal);
    } else {
      bsToggle(bsFailureModal);
    }
  } catch (error) {
    bsToggle(bsFailureModal);
    console.log('SMS something went wrong!');
    console.log('SMS Error:', error);
  }
}


// Add event listener for Callback Modal Submit button
document.getElementById('sendCallbackBtn').addEventListener('click', () => {
  if (callbackForm.checkValidity()){
    callbackForm.classList.remove('was-validated');
    bsToggle(bsCallbackModal);
    sendCallback();
  } else callbackForm.classList.add('was-validated');
});


// Add event listener for Email Modal Submit button
document.getElementById('sendEmailBtn').addEventListener('click', () => {
  if (emailForm.checkValidity()){
    emailForm.classList.remove('was-validated');
    bsToggle(bsEmailModal);
    sendEmail();
  } else emailForm.classList.add('was-validated');
});


// Add event listener for SMS Modal Submit button
document.getElementById('sendSmsBtn').addEventListener('click', () => {
  if (smsForm.checkValidity()){
    smsForm.classList.remove('was-validated');
    bsToggle(bsSmsModal);
    sendSMS();
  } else smsForm.classList.add('was-validated');
});
