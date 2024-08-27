// navbar highlight indicator
const navLi = document.querySelectorAll("nav a");
const sections = document.querySelectorAll("section");

var isOpened = false;
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    let sectionTop = section.offsetTop;
    // + 50 to roundup
    if (scrollY + 50 >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  if (isOpened) {
    if (window.innerHeight + scrollY + 50 >= document.body.offsetHeight) {
      // remove navbar on bottom page
      document.querySelector("nav").classList.add("hidden");
    } else {
      document.querySelector("nav").classList.remove("hidden");
    }
  }

  // load message on hadiah section
  if (scrollY >= sections[3].offsetTop) {
    getMsg();
  }

  navLi.forEach((li) => {
    li.classList.remove("active");
    let linkElement = document.querySelector("nav a[href*= " + current + "]");
    if (linkElement) {
      linkElement.classList.add("active");
    }
  });
});

// Penerima
var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var receiver = urlParams.get("to");
if (receiver) {
  var kepada = `<span class="text-inherit font-medium">${receiver}</span><br><i class="text-[0.5rem] lg:text-sm">*Mohon maaf bila ada kesalahan pada penulisan nama/gelar</i><br>`;
  document.getElementById("penerima").innerHTML = kepada;
}

// sakura rain
var sakura = new Sakura("body", {
  maxSize: 20,
  minSize: 15,
  delay: 200,
});
sakura.stop(true);

const footerConst = document.querySelector("footer");

function elementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    (rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        ((window.innerHeight || document.documentElement.clientHeight) * 80) /
          100) ||
    (rect.bottom >
      (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom < footerConst.offsetTop &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth))
  );
}

// clean up stuck sakura on the bottom page manually
// sakura stuck when y location is less than window.innerHeight,
// dunno why sakura can have y position value less than window.innerHeight
setInterval(() => {
  let sakuraa = document.querySelectorAll(".sakura");
  sakuraa.forEach(function (a, i) {
    if (!elementInViewport(a)) {
      a.remove();
    }
  });
}, 7777);

// animate on scroll
AOS.init({
  offset: 200, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 800, // values from 0 to 3000, with step 50ms
  easing: "linear",
});

window.openModal = function (modalId) {
  let modal = document.getElementById(modalId);
  modal.style.display = "block";
  document.getElementsByTagName("body")[0].classList.add("overflow-y-hidden");
  document.querySelector("nav").classList.add("hidden");
  modal.classList.remove("opacity-0", "fade-out");
  modal.classList.add("opacity-100", "fade-in");
};

window.closeModal = function (modalId) {
  let modal = document.getElementById(modalId);
  document
    .getElementsByTagName("body")[0]
    .classList.remove("overflow-y-hidden");
  document.querySelector("nav").classList.remove("hidden");
  modal.classList.remove("opacity-100", "fade-in");
  modal.classList.add("opacity-0", "fade-out");

  setTimeout(function () {
    modal.style.display = "none";
  }, 500);
};

// Close all modals when press ESC
document.onkeydown = function (event) {
  if (event.code == "Escape" && isOpened) {
    let modals = document.getElementsByClassName("modal");
    Array.prototype.slice.call(modals).forEach((modal) => {
      document
        .getElementsByTagName("body")[0]
        .classList.remove("overflow-y-hidden");
      document.querySelector("nav").classList.remove("hidden");
      modal.classList.add("opacity-0", "fade-out");
      modal.style.display = "none";
    });
  }
};

function blinkOnce(element) {
  setTimeout(function () {
    element
      .querySelector("#tooltip-copied")
      .classList.remove("opacity-1", "fade-in");
    element
      .querySelector("#tooltip-copied")
      .classList.add("opacity-0", "fade-out");
  }, 1000);
}

var clipboard = new ClipboardJS(".copy");

clipboard.on("success", function (e) {
  e.trigger
    .querySelector("#tooltip-copied")
    .classList.remove("opacity-0", "fade-out");
  e.trigger
    .querySelector("#tooltip-copied")
    .classList.add("opacity-1", "fade-in");
  blinkOnce(e.trigger);

  e.clearSelection();
});

clipboard.on("error", function (e) {
  console.error("Action:", e.action);
  console.error("Trigger:", e.trigger);
});

var modelConfirm = document.getElementById("modelConfirm");

window.onclick = function (event) {
  if (event.target == modelConfirm) {
    document
      .getElementsByTagName("body")[0]
      .classList.remove("overflow-y-hidden");
    document.querySelector("nav").classList.remove("hidden");
    let modals = document.getElementsByClassName("modal");
    Array.prototype.slice.call(modals).forEach((i) => {
      i.style.display = "none";
    });
  }
};

var isPopulated = false;

const commentContainer = document.querySelector("#commentContainer");

function generateComment(name, timestamp, message) {
  let comment = `
    <div class="flex flex-row p-3 odd:bg-rose-50 even:bg-rose-100">
        <img src="https://ilham-openbeta.sirv.com/web/avatar.webp" class="w-8 h-8">
        <div class="w-full text-left ml-3">
            <div class="font-bold">${name}<span class="font-light text-xs">&nbsp;${timestamp}</span></div>
            <div>${message}</div>
        </div>
    </div>
    `;
  commentContainer.insertAdjacentHTML("beforeend", comment);
}

// ucapan
function getMsg() {
  if (isPopulated === false) {
    const loaderId = document.querySelector("#loadingMessage");
    displayLoading(loaderId);
    fetch("https://guest-book-api-taupe.vercel.app/message")
      .then((response) => response.json())
      .then((result) => {
        hideLoading(loaderId);
        for (let row of result) {
          generateComment(row.name, row.createdAt, row.message);
        }
      })
      .catch((error) => {
        console.error(error);
        hideLoading(loaderId);
        commentContainer.insertAdjacentHTML(
          "beforeend",
          "Gagal mengambil pesan"
        );
      });
  }
  isPopulated = true;
}

document.querySelector("#form-ucapan").addEventListener("submit", (e) => {
  e.preventDefault();
  const loaderId = document.querySelector("#loading");
  displayLoading(loaderId);
  const formData = new FormData(e.target);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    contact: formData.get("contact"),
    name: formData.get("name"),
    message: formData.get("message"),
    status: formData.get("attendance"),
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const formatedTimestamp = () => {
    const d = new Date();
    const date = d.toISOString().split("T")[0];
    const time = d.toTimeString().split(" ")[0];
    return `${date} ${time}`;
  };

  fetch("https://guest-book-api-taupe.vercel.app/message", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      hideLoading(loaderId);
      openModal("modalUcapanSukses");
      generateComment(
        formData.get("name"),
        formatedTimestamp(),
        formData.get("message")
      );
    })
    .catch((error) => {
      console.log(error);
      hideLoading(loaderId);
      openModal("modalUcapanGagal");
    });
});

// showing loading
function displayLoading(loaderId) {
  loaderId.classList.remove("hidden");
  loaderId.classList.add("inline-block");
}

// hiding loading
function hideLoading(loaderId) {
  loaderId.classList.add("hidden");
  loaderId.classList.remove("inline-block");
}

// audio js
var initialAudioOn = true;

const playerButton = document.querySelector(".player-button"),
  audio = document.querySelector("audio"),
  pauseIcon = `<button class="w-10 h-10 cursor-pointer rounded-full text-rose-600  bg-white">
                <span class="icon-sound-on"></span>
            </button>`,
  playIcon = `<button class="w-10 h-10 cursor-pointer rounded-full text-gray-500 bg-rose-200 bg-opacity-50">
                <span class="icon-sound-off"></span>
            </button>`;

function toggleAudio() {
  if (audio.paused) {
    audio.play();
    playerButton.innerHTML = pauseIcon;
  } else {
    audio.pause();
    playerButton.innerHTML = playIcon;
    initialAudioOn = false;
  }
}

if (playerButton) {
  playerButton.addEventListener("click", toggleAudio);
}

function openInvitation() {
  closeModal("modalHome");
  sakura.start();
  if (initialAudioOn && playerButton) audio.play();
  isOpened = true;
}
