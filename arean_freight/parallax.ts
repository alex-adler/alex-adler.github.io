let stars = document.getElementById('stars');
let moon = document.getElementById('moon');
let mountains_behind = document.getElementById('mountains_behind');
let mountains_front = document.getElementById('mountains_front');
let title = document.getElementById('title');
let btn = document.getElementById('btn');

console.log(stars);

window.addEventListener('scroll', function () {
    let value = window.scrollY;
    stars.style.left = value * .25 + 'px';
    moon.style.top = value * 1.05 + 'px';
    mountains_behind.style.top = value * .5 + 'px';
    mountains_front.style.top = value * 0 + 'px';
    title.style.marginRight = value * 3 + 'px';
    // btn.style.marginTop = value * 1.05 + 'px';
})