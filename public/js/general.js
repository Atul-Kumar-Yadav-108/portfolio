const cursorCircle = document.querySelector(".cursor-circle");
document.addEventListener("mousemove",(e)=>{
    console.log("aaya main")
        cursorCircle.style.left = e.clientX + "px";
        cursorCircle.style.top = e.clientY + "px";
})

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




