var stars = document.getElementById('stars');
var moon = document.getElementById('moon');
var mountains_behind = document.getElementById('mountains_behind');
var mountains_front = document.getElementById('mountains_front');
var title = document.getElementById('title');
var btn = document.getElementById('btn');
console.log(stars);
window.addEventListener('scroll', function () {
    var value = window.scrollY;
    stars.style.left = value * .25 + 'px';
    moon.style.top = value * 1.05 + 'px';
    mountains_behind.style.top = value * .5 + 'px';
    mountains_front.style.top = value * 0 + 'px';
    title.style.marginRight = value * 3 + 'px';
    // btn.style.marginTop = value * 1.05 + 'px';
});
