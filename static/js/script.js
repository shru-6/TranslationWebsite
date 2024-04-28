// Toggle Dark Mode based on user preference or system settings
const userThemePreference = localStorage.getItem("darkModeEnabled");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isDarkModeEnabled = userThemePreference === "true" || (userThemePreference === null && prefersDarkMode);
const darkModeCheckbox = document.getElementById("dark-mode-btn");
if (isDarkModeEnabled) {
  document.body.classList.add("dark");
  darkModeCheckbox.checked = true;
}
darkModeCheckbox.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkModeCheckbox.checked);
  localStorage.setItem('darkModeEnabled', darkModeCheckbox.checked ? 'true' : 'false');
});

// Toggle responsive navbar menu
function myFunctionmenu() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
      x.className += "responsive";
  } else {
      x.className = "topnav";
  }
}

// Toggle pop-up visibility
function togglePopup(popupId, action) {
  const popup = document.getElementById(popupId);
  popup.style.display = action === 'show' ? 'block' : 'none';
}

// Unified handler for all pop-up related actions
function setupPopupHandlers() {
  document.addEventListener('click', (event) => {
    // Open pop-ups
    if (event.target.matches('#signInButton')) {
      togglePopup('signInPopup', 'show');
    } else if (event.target.matches('#faqLink')) {
      togglePopup('faqPopup', 'show');
    } else if (event.target.matches('#ppLink')) {
      togglePopup('ppPopup', 'show');
    } else if (event.target.matches('#crLink')) {
      togglePopup('crPopup', 'show');
    }
    // Close pop-ups
    else if (event.target.matches('#closePopup') || event.target.matches('#faqclosePopup') ||
             event.target.matches('#ppclosePopup') || event.target.matches('#crclosePopup') ||
             event.target === signInPopup || event.target === faqPopup || 
             event.target === ppPopup || event.target === crPopup) {
      togglePopup('signInPopup', 'hide');
      togglePopup('faqPopup', 'hide');
      togglePopup('ppPopup', 'hide');
      togglePopup('crPopup', 'hide');
    }
  });
}
document.addEventListener('DOMContentLoaded', setupPopupHandlers);

// Activate hero section on page load
document.addEventListener("DOMContentLoaded", function() {
  const hero = document.querySelector(".hero");
  setTimeout(() => {
      hero.classList.add("active");
  }, 200);
});

// Populate select elements with language options
function populateSelect(select, options) {
  select.innerHTML = "";
  options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.code;
      optionElement.textContent = option.name + " (" + option.native + ")";
      select.appendChild(optionElement);
  });
}

// Populate language selection for text cards
const inputLanguageDropdown = document.querySelector("#input-language select");
const outputLanguageDropdown = document.querySelector("#output-language select");
populateSelect(inputLanguageDropdown, languagesInput);
populateSelect(outputLanguageDropdown, languagesOutput);


// Populate language selection for audio cards
const inputLanguageDropdownnn = document.querySelector("#inputtt-language select");
const outputLanguageDropdownnn = document.querySelector("#outputtt-language select");
populateSelect(inputLanguageDropdownnn, languagesInput); 
populateSelect(outputLanguageDropdownnn, languagesOutput); 

// Populate language selection for image cards
const inputLanguageDropdownn = document.querySelector("#inputt-language select");
const outputLanguageDropdownn = document.querySelector("#outputt-language select");
populateSelect(inputLanguageDropdownn, languagesInput); 
populateSelect(outputLanguageDropdownn, languagesOutput); 

// Swap button
const swapBtn = document.querySelector(".swap-position");
const inputLanguage = inputLanguageDropdown.querySelector("option:checked");
const outputLanguage = outputLanguageDropdown.querySelector("option:checked");
const inputTextElem = document.querySelector("#input-text");
const outputTextElem = document.querySelector("#output-text");

swapBtn.addEventListener("click", (e) => {
  const tempInputValue = inputLanguage.value;
  inputLanguage.value = outputLanguage.value;
  outputLanguage.value = tempInputValue;

  const tempInputText = inputLanguage.textContent;
  inputLanguage.textContent = outputLanguage.textContent;
  outputLanguage.textContent = tempInputText;

  const tempInputTextValue = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputTextValue;
});

// Upload doc
const uploadDocument = document.querySelector("#upload-document");
const uploadTitle = document.querySelector("#upload-title");
uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file.type === "text/plain" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/pdf") {
      uploadTitle.innerHTML = file.name;
  } else {
      alert("Please upload a valid file");
  }
});

//extracted text from doc to input-text textarea
uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file.type === "text/plain" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/pdf") {
      uploadTitle.innerHTML = file.name;
      const formData = new FormData();
      formData.append("file", file);
      fetch("/extract", {
              method: "POST",
              body: formData,
          })
          .then(response => response.json())
          .then(data => {
              inputTextElem.value = data.extracted_text;
          })
          .catch(error => {
              console.error("Error:", error);
          });
  } else {
      alert("Please upload a valid file");
  }
});

//char count in input text
const inputChars = document.querySelector("#input-chars");
inputTextElem.addEventListener("input", (e) => {
  inputChars.innerHTML = inputTextElem.value.length;
});

//output text
function translateText() {
  const formData = new FormData(document.getElementById('form'));
  fetch('/translate', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('output-text').value = data.output;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
document.getElementById('tbtn').addEventListener('click', function(event) {
  event.preventDefault();
  translateText();
});

//download pdf button
const downloadBtnpdf = document.querySelector("#download-btn-pdf");
downloadBtnpdf.addEventListener("click", (e) => {
  const outputText = outputTextElem.value;
  const outputLanguage =
      outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
      const blob = new Blob([outputText], {
          type: "text/plain"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `translated-to-${outputLanguage}.txt`;
      a.href = url;
      a.click();
  }
});

// convert to pdf and dowload it
$(document).ready(function() {
  $("#download-btn-pdf").click(function() {
      var text = $("#output-text").val();
      $.ajax({
          type: "POST",
          url: "/convert_to_pdf",
          data: {
              "output-text": text
          },
          success: function() {
              window.location.href = "/download_pdf";
          },
          error: function() {
              alert("Error occurred while converting to PDF.");
          }
      });
  });
});

//audio record
const startRecordButton = document.getElementById('startRecord');
const stopRecordButton = document.getElementById('stopRecord');
const audioPlayer = document.getElementById('audioPlayer');
let mediaRecorder;
let audioChunks = [];
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
  });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
          audioChunks.push(event.data);
      }
  };
  mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, {
          type: 'audio/webm'
      });
      audioPlayer.src = URL.createObjectURL(audioBlob);
  };
  mediaRecorder.start();
  startRecordButton.disabled = true;
  stopRecordButton.disabled = false;
}
function stopRecording() {
  mediaRecorder.stop();
  startRecordButton.disabled = false;
  stopRecordButton.disabled = true;
}
startRecordButton.addEventListener('click', startRecording);
stopRecordButton.addEventListener('click', stopRecording);

//audio upload
const uploadAudio = document.querySelector("#upload-audio");
const audioTitle = document.querySelector("#audio-title");
uploadAudio.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (
    file.type === "audio/mpeg" ||
    file.type === "audio/wav" ||
    file.type === "audio/ogg"
  ) {
    // Handle supported audio file types
    audioTitle.innerHTML = file.name;
  } else {
    alert("Please upload a valid audio file (MP3, WAV, or OGG).");
  }
});

// audio preview
uploadAudio.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const audioURL = URL.createObjectURL(file);
    audioPlayer.src = audioURL;
    audioPlayer.controls = true;
  } else {
    audioPlayer.src = "";
    audioPlayer.controls = false;
  }
});

// image input and preview
const uploadImageInput = document.querySelector("#upload-image");
const imagePreview = document.querySelector("#image-preview");
const uploadImageTitle = document.querySelector("#upload-image-title");
uploadImageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
      if (file.type.startsWith("image/")) {
          uploadImageTitle.innerHTML = file.name;
          const reader = new FileReader();
          reader.onload = function(e) {
              imagePreview.src = e.target.result;
              imagePreview.style.display = "block";
          };
          reader.readAsDataURL(file);
      } else {
          alert("Please upload a valid image file.");
      }
  } else {
      alert("Please select an image to upload.");
  }
});

//image processing and output preview
$(document).ready(function () {
  function processAndTranslateImage() {
    console.log("Entering processAndTranslateImage");
    var inputImage = $("#upload-image")[0].files[0];
    if (!inputImage) {
      alert("Please select an image.");
      console.log("No input image selected");
      return;
    }
    console.log("Input image selected:", inputImage);
    var formData = new FormData();
    formData.append("file", inputImage);
    console.log("FormData created:", formData);
    $.ajax({
      url: "/process_image",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        console.log("AJAX for image translation request successful");
        if (response) {
          const imgElement = document.getElementById("image-preview1"); 
          imgElement.src = response;
          console.log("Image preview updated with processed image");
        } else {
          $("#image-preview1").text("Processing/Translation failed.");
          console.log("Processing/Translation failed");
        }
        // Hide the loading timer on success
        $("#loading-timer").hide();
      },
      error: function () {
        console.log("AJAX request failed");
        $("#image-preview1").text("Error occurred during processing/translation.");
        console.log("Error occurred during processing/translation");
        // Hide the loading timer on error
        $("#loading-timer").hide();
      }
    });
  }
  
  $("#form").submit(function (event) {
    event.preventDefault();
    console.log("Form submitted");
    processAndTranslateImage();
  });
  $("#tbtnn").click(function (event) {
    console.log("Translate Text button clicked");
    event.preventDefault();
    processAndTranslateImage();
  });
});

//loading timer
document.getElementById('tbtnn').addEventListener('click', function() {
  const loadingTimer = document.getElementById('loading-timer');
  loadingTimer.style.display = 'block';
  processAndTranslateImage();
});

//download image button
const downloadBtnimg = document.querySelector("#download-btn-img");
downloadBtnimg.addEventListener("click", (e) => {
  const outputText = outputTextElem.value;
  const outputLanguage =
      outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
      const blob = new Blob([outputText], {
          type: "text/plain"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `translated-to-${outputLanguage}.txt`;
      a.href = url;
      a.click();
  }
});

// audio translation

// Add event listener to handle form submission and send the recorded audio
document.getElementById('tbtnnn').addEventListener('click', function(event) {
  event.preventDefault();

  var inputAudio = document.getElementById("audioPlayer").src;
  console.log("Audio source URL:", inputAudio);

  if (!inputAudio) {
      alert("Please record an audio file first.");
      return;
  }

  fetch(inputAudio)
      .then(response => {
          console.log("Fetched audio for blob conversion:", response);
          return response.blob();
      })
      .then(blob => {
          console.log("Blob created from audio source:", blob);
          const formData = new FormData();
          formData.append("audioPlayer", blob, "recorded_audio.webm");
          formData.append("input_lang", document.getElementById("inputtt-language").querySelector("select").value);
          formData.append("target_lang", document.getElementById("outputtt-language").querySelector("select").value);

          return fetch("/translate_audio", {
              method: "POST",
              body: formData
          });
      })
      .then(response => {
          console.log("Response from translate_audio endpoint:", response);
          if (!response.ok) throw new Error('Response not OK');
          return response.blob();
      })
      .then(blob => {
          console.log("Blob received from server:", blob);
          const url = window.URL.createObjectURL(blob);
          document.getElementById('audioSource').src = url;
          document.getElementById('outputAudio').load();
      })
      .catch(error => {
          console.error('Error during fetch operation:', error.message);
          alert("Error occurred during the translation process.");
      });
});


// Add event listener to the button for downloading the translated audio
document.getElementById('download-btn-audio').addEventListener('click', function() {
  // Get the source URL of the translated audio
  const audioSource = document.getElementById('audioSource').src;
  if (audioSource) {
      // Create an anchor element for initiating a download
      const a = document.createElement("a");
      a.style.display = "none"; // Hide the anchor element
      a.href = audioSource; // Set the href to the audio source URL
      a.download = "translated_audio.mp3"; // Set the filename for the download
      document.body.appendChild(a); // Append the anchor to the body
      a.click(); // Trigger a click on the anchor to start the download
      document.body.removeChild(a); // Remove the anchor from the body after the download is initiated
  } else {
      alert("No translated audio available for download."); // Alert the user if no translated audio is available
  }
});