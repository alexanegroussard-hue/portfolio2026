document.addEventListener('DOMContentLoaded', () => {
  fetch('./includes/header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
      
      const burger = document.getElementById('burger');
      const navRight = document.getElementById('nav-right');
      
      if (!burger || !navRight) return;
      
      burger.addEventListener('click', (e) => {
        e.preventDefault();
        burger.classList.toggle('open');
        navRight.classList.toggle('open');
      });
    })
    .catch(error => console.error('Erreur: ' + error));
});