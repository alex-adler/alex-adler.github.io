// Generate a random number for the year
function yearGlitch() {
    var year = document.getElementById("year-glitch");
    var new_year = "2";
    for (let i = 0; i < 3; i++) {
        new_year += Math.floor(Math.random() * 10);
    }
    year.innerHTML = new_year;
    setTimeout(yearGlitch, 1000);
}

yearGlitch();