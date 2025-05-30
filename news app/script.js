const API_KEY = "d2864f9d1adb4cb2882fb00e66914bca";
const url = "https://newsapi.org/v2/everything?q=";

let currentQuery = "India";
let curSelectedNav = null;

window.addEventListener("load", () => fetchNews(currentQuery));

function reload() {
  window.location.reload();
}

function updateLastUpdated() {
  const el = document.getElementById("last-updated");
  const now = new Date();
  el.textContent = `Last updated at ${now.toLocaleTimeString()}`;
}

async function fetchNews(query) {
  currentQuery = query;
  try {
    const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
    const data = await res.json();
    bindData(data.articles);
    updateLastUpdated();
  } catch (err) {
    console.error("Error fetching news:", err);
  }
}

function bindData(articles) {
  const cardsContainer = document.getElementById("cards-container");
  const newsCardTemplate = document.getElementById("template-news-card");

  cardsContainer.innerHTML = "";

  articles.forEach((article) => {
    if (!article.urlToImage) return;
    const cardClone = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, article);
    cardsContainer.appendChild(cardClone);
  });

  attachSpeechEvents();
}

function fillDataInCard(cardClone, article) {
  const newsImg = cardClone.querySelector("#news-img");
  const newsTitle = cardClone.querySelector("#news-title");
  const newsSource = cardClone.querySelector("#news-source");
  const newsDesc = cardClone.querySelector("#news-desc");

  newsImg.src = article.urlToImage;
  newsTitle.innerHTML = article.title || "No Title Available";
  newsDesc.innerHTML = article.description || "No Description Available";

  const date = new Date(article.publishedAt).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  newsSource.innerHTML = `${article.source.name} · ${date}`;

  cardClone.firstElementChild.addEventListener("click", () => {
    window.open(article.url, "_blank");
  });
}

function attachSpeechEvents() {
  const speakButtons = document.querySelectorAll(".speak-button");

  let voices = [];
  function loadVoices() {
    voices = speechSynthesis.getVoices();
  }
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;

  speakButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return;
      }

      const card = button.closest(".card");
      const title = card.querySelector("#news-title").textContent;
      const desc = card.querySelector("#news-desc").textContent;

      const utterance = new SpeechSynthesisUtterance(`${title}. ${desc}`);
      utterance.lang = "en-US";

      const englishVoice = voices.find((v) => v.lang.includes("en"));
      if (englishVoice) utterance.voice = englishVoice;

      speechSynthesis.speak(utterance);
    });
  });
}

function onNavItemClick(id) {
  fetchNews(id);
  const navItem = document.getElementById(id);
  curSelectedNav?.classList.remove("active");
  curSelectedNav = navItem;
  curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
  const query = searchText.value.trim();
  if (!query) return;
  fetchNews(query);
  curSelectedNav?.classList.remove("active");
  curSelectedNav = null;
});
