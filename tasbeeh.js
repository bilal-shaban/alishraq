let currentCount = parseInt(localStorage.getItem('eshraq_tasbeeh_count')) || 0;
let currentPhrase = localStorage.getItem('eshraq_tasbeeh_phrase') || 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tasbeeh-count').innerText = currentCount;
  document.getElementById('tasbeeh-phrase').innerText = currentPhrase;
});

function countTasbeeh() {
  currentCount++;
  document.getElementById('tasbeeh-count').innerText = currentCount;
  localStorage.setItem('eshraq_tasbeeh_count', currentCount);

  // هزة خفيفة للموبايل إذا كان يدعم الهزاز
  if (navigator.vibrate) {
    navigator.vibrate(40);
  }
}

function setTasbeehPhrase(phrase) {
  currentPhrase = phrase;
  document.getElementById('tasbeeh-phrase').innerText = currentPhrase;
  localStorage.setItem('eshraq_tasbeeh_phrase', currentPhrase);
  resetTasbeeh();
}

function resetTasbeeh() {
  currentCount = 0;
  document.getElementById('tasbeeh-count').innerText = 0;
  localStorage.setItem('eshraq_tasbeeh_count', 0);
}