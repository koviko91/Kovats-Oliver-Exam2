//Data itt elérhető
function done(data) {
    let movies = JSON.parse(data.responseText);
    movies = sortMovies(movies);
    editCategoryName(movies);
    createFilms(movies);
    $('.fixed').on('click', function () {
        clear();
    });
    $('span').on('click', function () {
        $('.search').css('width', '50vh');
        createSearch(movies);
    });


}

//Ajax 
function xhr(method, url, done) {
    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.onreadystatechange = function () {
        if (xmlHTTP.readyState == 4 && xmlHTTP.status == 200) {
            done(xmlHTTP);
        }
    }
    xmlHTTP.open(method, url);
    xmlHTTP.send();
}
//Ajax Meghívása
xhr('GET', '/json/movies.json', done);

function sortMovies(movies) {
    movies = movies.movies;
    movies.sort(function (a, b) {
        if (a.title > b.title) {
            return 1;
        }
        return -1;
    });
    return movies;
}

function editCategoryName(movies) {
    movies = movies.map(function (item) {
        for (let i in item.categories) {
            item.categories[i] = item.categories[i][0].toUpperCase() + item.categories[i].substr(1, item.categories[i].length - 1);
        }
        return item;
    })
}

function createFilms(movies) {
    for (let i in movies) {
        let title = generateImgName(movies[i].title);
        let cast = "<ul>";
        for (let j in movies[i].cast) {
            if (j < 3) {
                cast += ` <li>${movies[i].cast[j].name}</li>`;
            }
        }
        cast += '<li>...</li></ul>';
        $('.content').append(`
        <div class="movie" id=${i}>
            <div class="img">
                <img src="img/covers/${title}.jpg" alt="${title}">
            </div>
            <div class="text">
                <h3>${movies[i].title}</h3>
                <ul>
                    <li> Hossz: ${movies[i].timeInMinutes} perc</li>
                    <li>Premier: ${movies[i].premierYear} </li>
                    <li>Kategoria: ${movies[i].categories} </li>
                    <li>Rendező: ${movies[i].directors} </li>
                    <li>Szereprlők: 
                        ${cast}
                    </li>
                    
                </ul>
            </div>

        </div>
        `);
    }
    $('.content').append(`<button id="stats">Stats</button><button id="before">1990</button> `);
    $('#stats').on('click', function () {
        stat(movies);
    });
    $('#before').on('click', function () {
        deleteBefore(movies);
    });
    $('.movie').on('click', function () {
        showCharaters(movies, this.attributes.id.value);
    });


}

function generateImgName(title) {
    title = title.toLocaleLowerCase();

    var hunChars = {
        'á': 'a',
        'é': 'e',
        'í': 'i',
        'ó': 'o',
        'ö': 'o',
        'ő': 'o',
        'ú': 'u',
        'ü': 'u',
        'ű': 'u'
    }
    title = title.replace(/[\?:;,'\&\.\+\*]/g, '');
    title = title.replace(/[áéíóöőúüű]/g, match => hunChars[match]);
    title = title.replace(/ +/g, '-');
    title = title.replace(/-+/g, '-');
    return title;
}

function showCharaters(movies, index) {
    index = parseInt(index);
    let actor = {};
    $('.fixed').empty();
    for (let i in movies[index].cast) {
        actor = movies[index].cast[i];
        title = generateImgName(actor.name);
        console.log(actor, title);
        $('.fixed').append(`
             <div class="actor">
                 <div class="img">
                     <img src="img/actors/${title}.jpg" alt="${title}">
                 </div>
                 <div class="text">
                     <h4>${actor.name}(${actor.characterName})</h4>
                     <ul>
                         <li>${actor.birthYear}, ${actor.birthCountry}, ${actor.birthCity}</li>
                         <li>Premier:  </li>
                         <li>Kategoria:  </li>
                         <li>Rendező:  </li>
                         <li>Szereprlők: 
                         </li>
                         
                     </ul>
                 </div>

             </div>
             `);
    }

}

function clear() {
    $('.fixed').html('');
}

function createSearch(movies) {
    $('.search').empty();
    $('.search').append(`<h2>Search a Film</h2>
    <form>
        <input type="text">
        <br>
        <select name="type">
            <option value="title">Filmcím</option>
            <option value="director">Rendező</option>
            <option value="cast">Főszereplő</option>
        </select>
        <br>
        <button id="search" type="button">Search</button>
        <br>
        <button id="close" type="button">X</button>
    </form>`);
    document.querySelector("#search").addEventListener('click', function () {
        searchFilm(movies);
    });
    $('#close').on('click', function () {
        $('.search').css('width', '10vh');
        $('.search').empty();
        $('.search').append(`<span>?</span>`);
        $('span').on('click', function () {
            $('.search').css('width', '50vh');
            createSearch(movies);
        });
    });
}

function searchFilm(movies) {

    let text = document.querySelector('input[type="text"]').value.toLocaleLowerCase();
    let type = document.querySelector('select').value;
    if (type == "title") {
        movies = movies.filter(function (item) {
            if (item.title.toLocaleLowerCase().search(text) > -1) {
                return true;
            }
            return false;
        });
    }
    if (type == "director") {
        movies = movies.filter(function (item) {
            for (let i in item.directors) {
                let dir = item.directors[i].toLocaleLowerCase();
                if (dir.search(text) > -1) {
                    console.log(dir);
                    return true;
                }
            }
            return false;
        });
    }
    if (type == "cast") {
        movies = movies.filter(function (item) {
            for (let i in item.cast) {
                let name = item.cast[i].name.toLocaleLowerCase();
                if (name.indexOf(text) > -1) {
                    return true;
                }
            }
            return false;
        });
    }
    $('.content').empty();
    createFilms(movies);
}

function stat(movies) {
    let sum = 0;
    let actors = {};
    let cat = {};
    for (let i in movies) {
        sum += parseInt(movies[i].timeInMinutes);
        for (let j in movies[i].cast) {
            if (actors.hasOwnProperty(movies[i].cast[j].name)) {
                actors[movies[i].cast[j].name] += 1;
            } else {
                actors[movies[i].cast[j].name] = 1;
            }
        }
        for (let k in movies[i].categories) {
            if (cat.hasOwnProperty(movies[i].categories[k])) {
                cat[movies[i].categories[k]] += 1;
            } else {
                cat[movies[i].categories[k]] = 1;
            }
        }
    }
    let avg = (sum / 60 / movies.length).toFixed(2);
    sum = (sum / 60).toFixed(2);
    createStat(sum, avg, actors, cat);

}

function createStat(sum, avg, actors, cat) {
    $('.stat').empty();
    let category = '<ul>Katgóriák szerinti db:';
    let cast = '<ul>Színészenkénti db:';
    for (let i in actors) {
        cast += `<li>${i} ${actors[i]}</li>`;
    }
    for (let i in cat) {
        category += `<li>${i} ${cat[i]}</li>`;
    }
    category += '</ul>';
    cast += '</ul>';
    $('.stat').append(`
        <h3>Az összidő: ${sum}</h3>
        <h3>Az átlaghossz: ${avg}</h3>
        ${cast}${category}
    `);
}

function deleteBefore(movies) {
    movies = movies.filter(function (item) {
        if (parseInt(item.premierYear) >= 1990) {
            return true;
        }
        return false;
    });
    $('.content').empty();
    createFilms(movies);
}