const cursorCircle = document.querySelector(".cursor-circle");
document.addEventListener("mousemove",(e)=>{
    // console.log("aaya main")
        cursorCircle.style.left = e.clientX + "px";
        cursorCircle.style.top = e.clientY + "px";
})

document.addEventListener("DOMContentLoaded", (event) => {
  const toggleBtn = document.getElementById("themeToggle");
    const body = document.body;

    // Page load par theme check karo
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
    body.classList.add("dark");
    }

    // Button click par theme change
    toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
    });

});


// mobile touch move
document.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    cursorCircle.style.left = touch.clientX + "px";
    cursorCircle.style.top = touch.clientY + "px";
});


  var quill = new Quill('#editor', {
      theme: 'snow'
  });

  document.querySelector('form').addEventListener('submit', function() {
      document.querySelector('#introduction').value = quill.root.innerHTML;
  });
  document.querySelector('form').addEventListener('submit', function() {
      document.querySelector('#certifications').value = quill.root.innerHTML;
  });

  document.querySelector('form').addEventListener('submit', function() {
      document.querySelector('#academicprojects').value = quill.root.innerHTML;
  });


