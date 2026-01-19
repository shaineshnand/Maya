const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const autoSpeakToggle = document.getElementById("autoSpeak");
const checkinsToggle = document.getElementById("gentleCheckins");
const voiceInputToggle = document.getElementById("voiceInput");
const micButton = document.getElementById("micButton");
const statusText = document.getElementById("statusText");

const systemPrompt = {
  role: "system",
  content:
    "You are Maya, a warm, supportive anime-inspired companion. You speak with empathy, gentle encouragement, and brief affirmations. You ask thoughtful questions and keep replies concise (2-4 sentences). You avoid giving medical or legal advice, and instead suggest reaching out to trusted people if someone is in crisis."
};

const chatHistory = [systemPrompt];
let checkInTimer = null;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const speechRecognizer = SpeechRecognition ? new SpeechRecognition() : null;
let isListening = false;

if (speechRecognizer) {
  speechRecognizer.lang = "en-US";
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;
}

const safeSpeak = (text) => {
  if (!autoSpeakToggle.checked || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.02;
  utterance.pitch = 1.1;
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
};

const appendMessage = (role, text) => {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
};

const setStatus = (text) => {
  statusText.textContent = text;
};

const fetchReply = async () => {
  setStatus("Maya is thinking...");
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages: chatHistory })
  });

  if (!response.ok) {
    setStatus("Maya needs a moment. Please try again.");
    return null;
  }

  const data = await response.json();
  return data.reply;
};

const addCheckIn = async () => {
  if (!checkinsToggle.checked) {
    return;
  }

  chatHistory.push({
    role: "user",
    content: "Check in with me gently and ask how I am feeling right now."
  });

  const reply = await fetchReply();
  if (!reply) {
    return;
  }

  chatHistory.push({ role: "assistant", content: reply });
  appendMessage("maya", reply);
  safeSpeak(reply);
};

const restartCheckInTimer = () => {
  if (checkInTimer) {
    clearTimeout(checkInTimer);
  }

  if (!checkinsToggle.checked) {
    return;
  }

  checkInTimer = setTimeout(addCheckIn, 70000);
};

const sendMessage = async (content) => {
  appendMessage("user", content);
  chatHistory.push({ role: "user", content });

  const reply = await fetchReply();
  if (!reply) {
    return;
  }

  chatHistory.push({ role: "assistant", content: reply });
  appendMessage("maya", reply);
  safeSpeak(reply);
  setStatus("Maya is listening.");
  restartCheckInTimer();
};

const setListeningState = (listening) => {
  isListening = listening;
  if (listening) {
    micButton.classList.add("listening");
    micButton.textContent = "Listening...";
    setStatus("Listening for your voice...");
  } else {
    micButton.classList.remove("listening");
    micButton.textContent = "Hold to talk";
    setStatus("Maya is listening.");
  }
};

const startListening = () => {
  if (!speechRecognizer || !voiceInputToggle.checked) {
    setStatus("Voice input is unavailable in this browser.");
    return;
  }

  if (isListening) {
    return;
  }

  setListeningState(true);
  speechRecognizer.start();
};

const stopListening = () => {
  if (!speechRecognizer || !isListening) {
    return;
  }

  speechRecognizer.stop();
  setListeningState(false);
};

if (!speechRecognizer) {
  voiceInputToggle.checked = false;
  voiceInputToggle.disabled = true;
  micButton.disabled = true;
  micButton.textContent = "Voice unavailable";
}

if (speechRecognizer) {
  speechRecognizer.addEventListener("result", (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();

    if (transcript) {
      userInput.value = transcript;
      sendMessage(transcript);
    }
  });

  speechRecognizer.addEventListener("error", () => {
    setStatus("I couldn't hear you. Please try again.");
    setListeningState(false);
  });

  speechRecognizer.addEventListener("end", () => {
    setListeningState(false);
  });
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = userInput.value.trim();
  if (!content) {
    return;
  }

  userInput.value = "";
  await sendMessage(content);
});

micButton.addEventListener("mousedown", startListening);
micButton.addEventListener("touchstart", startListening);
micButton.addEventListener("mouseup", stopListening);
micButton.addEventListener("mouseleave", stopListening);
micButton.addEventListener("touchend", stopListening);
micButton.addEventListener("touchcancel", stopListening);

checkinsToggle.addEventListener("change", restartCheckInTimer);

appendMessage(
  "maya",
  "Hi! I'm Maya. I'm here to listen and support you. What's on your mind today?"
);
restartCheckInTimer();
