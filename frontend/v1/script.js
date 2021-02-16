//here goes the script for the html page


/* Gestisce l'aggiunta di un file(immagine)
*/
function myFunction() {
    var x = document.getElementById("myFile");
    var txt = "";
    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select one or more files.";
        } else {
            for (var i = 0; i < x.files.length; i++) {
                txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
                var file = x.files[i];
                if ((file.name.indexOf("jpg") != -1) || (file.name.indexOf("png") != -1) || (file.name.indexOf("jpeg") != -1) || (file.name.indexOf("JPG") != -1)) {

                    if ('name' in file) {
                        txt += "name: " + file.name + "<br>";
                    }
                    if ('size' in file) {
                        txt += "size: " + file.size + " bytes <br>";
                    }
                } else {
                    txt = "Formato non supportato! Inserire solo file .jpg, .jpeg o .png o .JPG";
                }
            }
        }
    } else {
        if (x.value == "") {
            txt += "Select one or more files.";
        } else {
            txt += "The files property is not supported by your browser!";
            txt += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead.
        }
    }
    document.getElementById("demo").innerHTML = txt;

    if (txt == "Formato non supportato! Inserire solo file .jpg, .jpeg o .png o .JPG") {
        x.value = "";
    }
}


/**
 * Aggiunge una location
 */
function addLocation() {

    //Creo array Raggiungibilità
    var a = new Array();
    for (var i = 0; i < 4; i++) {
        var b = document.getElementById(`ragg[${i}]`);
        if (b.checked) {
            a.push(b.value);
        }
    }
    console.log(a);

    //Importo inserimenti da form HTML
    var nameLoc = document.getElementById("nome").value;
    var addressLoc = document.getElementById("posizione").value;
    var cityLoc = document.getElementById("città").value;
    var descLoc = document.getElementById("descrizione").value;
    var catLoc = document.getElementById("categoria").value;
    var raggiungibilitaLoc = Array.from(a);
    //Codice funzionante per la select
    //var raggiungibilitaLoc = Array.from(document.getElementById("ragg").selectedOptions).map(el => el.value);
    var imgLoc = document.getElementById("myFile").files[0];
    var photoDescLoc = document.getElementById("photoDescription").value;
    var oraLoc = document.getElementById("orario").value;
    var dataLoc = document.getElementById("data").value;
    var likesLoc = 0;

    //Creo un oggetto FormData e ci aggiungo i parametri chiave-valore
    const formData = new FormData();
    formData.append('name', nameLoc);
    formData.append('address', addressLoc);
    formData.append('city', cityLoc);
    formData.append('description', descLoc);
    formData.append('category', catLoc);
    formData.append('raggiungibilita', raggiungibilitaLoc);
    formData.append('locationImage', imgLoc);
    formData.append('photoDesc', photoDescLoc);
    formData.append('hour', oraLoc);
    formData.append('date', dataLoc);

    fetch('../locations', { //Se non specificato header creato da browser, in questo caso form-data
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getCookie('token'),
        },
        body: formData
    })
        .then((resp) => resp.json())
        .then((resp) => {
            let mes = resp.message;
            if (mes.localeCompare('Location created') == 0) {
                /*window.alert("Location aggiunta con successo!");
                window.open(`location.html?id=${resp.createdLocation._id}`, '_self');*/
                //console.log(resp);
                document.write(`<head><link rel="stylesheet" type="text/css" href="stylesheet.css">
            </head><div id='center'><h1>Location aggiunta con successo!</h1><br><a href="location.html?id=${resp.createdLocation._id}">Vai alla location</a></div>`);
            } else {
                window.alert("Errore inserimento location, ricontrollare i campi");
            }
        })
        .catch(error => {
            console.error(error);
            window.alert("Errore inserimento location, ricontrollare i campi");
        }); // If there is any error you will catch them here

}


/**
 * Trova le città attualmente presenti nel database
 */
function findCity() {
    const select = document.getElementById("citta");
    var a = new Set();
    fetch('/locations')
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {

            return data.locations.map(function (location) { // Map through the results and for each run the code below
                if (!a.has(location.city)) {
                    a.add(location.city);
                    console.log(location.city);
                    let option = document.createElement('option');
                    option.value = location.city;
                    option.text = location.city;
                    select.appendChild(option);
                }
            })
        })
        .catch(error => console.error(error));
};

/**
 * Carica l'elenco completo delle locations
 */
function loadLocations() {
    var url = '../locations?';

    //FILTRI E ORDINAMENTO messi come parametri nel URL
    var order = document.getElementById("ordine").value;
    var category = document.getElementById("categoria").value;
    var city = document.getElementById("citta").value;
    var raggiungibilita = document.getElementById("raggiung").value;
    if (order != "null") {
        url = url + "order=" + order;
    }
    if (category != "null") {
        if (order != "null") { url = url + "&"; }
        url = url + "category=" + category;
    }
    if (city != "null") {
        if (order != "null" || category != "null") { url = url + "&"; }
        url = url + "city=" + city;
    }
    if (raggiungibilita != "null") {
        if (order != "null" || category != "null" || city != "null") { url = url + "&"; }
        url = url + "raggiungibilita=" + raggiungibilita;
    }
    console.log(url);

    const div = document.getElementById("locations");
    div.innerHTML = '';

    fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) { // Here you get the data to modify as you please

            // console.log(data);

            return data.locations.map(function (location) { // Map through the results and for each run the code below

                let div2 = document.createElement('div');
                div2.className = "loc";
                //div2.addEventListener('click', window.open(`location.html?id=${location._id}`));
                div2.innerHTML = `<a href="location.html?id=${location._id}">${location.name}</a>`;
                div.appendChild(div2);
            })
        })
        .catch(error => console.error(error));// If there is any error you will catch them here
}

/**
 * Si occupa della gestione del bottone dei preferiti nella pagina di una location
 */
function setButtonState(id) {
    favDiv = document.getElementById("favourite");

    fetch("/lib/favourites/", {
        headers: new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('token')
        })
    })
        .then(res => {
            if (res.status == 404) {
                console.log("404");
                favDiv.innerHTML = `<button type="button" id="favButton" class="registerbtn" onclick="addFavourite('${id}')">Aggiungi ai preferiti</button>`;
                return "";
            } else {
                return res.json();
            }
        })
        .then(data => {
            if (data != "") {
                if (data.favourites.includes(id)) {
                    favDiv.innerHTML = `<button type="button" id="favButton" class="registerbtn" onclick="removeFavourite('${id}')">Rimuovi dai preferiti</button>`;
                } else {
                    favDiv.innerHTML = `<button type="button" id="favButton" class="registerbtn" onclick="addFavourite('${id}')">Aggiungi ai preferiti</button>`;
                }
                console.log(id, data);
            }
        })
        .catch(err => {
            console.log(err);
        });
};

/**
 * Carica una specifica location
 */
function loadLocation(url_string) {
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    fetch('../locations/' + id)
        //.then(res => res.formData())
        .then(res => res.json())
        .then(res => {
            console.log(res.location);

            //Funzione per convertire il buffer dell'immagine in stringa base64
            function toBase64(arr) {
                arr = new Uint8Array(arr);
                return btoa(
                    arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
            }
            const buffer = toBase64(res.file.img.data.data);
            const type = res.file.img.contentType;


            document.getElementById("name").innerHTML = res.location.name;
            document.getElementById("address").innerHTML = res.location.address;
            document.getElementById("city").innerHTML = res.location.city;
            document.getElementById("description").innerHTML = res.location.description;
            document.getElementById("category").innerHTML = res.location.category;
            document.getElementById("raggiungibilita").innerHTML = res.location.raggiungibilita;
            document.getElementById("locationImage").innerHTML = `<img src="data:${type};base64,${buffer}" width="900" height="600"></img>`;
            document.getElementById("photoDesc").innerHTML = res.location.photoDesc;
            document.getElementById("hour").innerHTML = res.location.hour;
            document.getElementById("date").innerHTML = res.location.date;
            document.getElementById("likes").innerHTML = res.location.likes;
            let mail = getCookie('email');
            if (mail != null) {
                setButtonState(id);
            }
        })
        .catch(err => {
            console.log(err);
        });
}

/**
 * Aggiunge un luogo dai Preferiti
 */
function addFavourite(id) {
    //var url = new URL(url);
    //var id = url.searchParams.get("id");

    fetch('/lib/favourites/add/' + id, {
        method: 'PATCH',
        headers: new Headers({
            'Content-type': 'application/json',
            'Authorization': "Bearer " + getCookie("token")
        })
    })
        .then(res => {
            if (res.ok) {
                document.getElementById("favourite").innerHTML = `<button type="button" class="registerbtn" id="favButton" onclick="removeFavourite('${id}')">Rimuovi dai preferiti</button>`;
            }

        })
        .catch(error => console.error(error));
}

/**
 * Rimuove un luogo dai Preferiti
 */
function removeFavourite(id) {

    fetch('/lib/favourites/remove/' + id, {
        method: 'PATCH',
        headers: new Headers({
            'Content-type': 'application/json',
            'Authorization': "Bearer " + getCookie("token")
        })
    })
        .then(res => {
            if (res.ok) {
                document.getElementById("favourite").innerHTML = `<button class=registerbtn type="button" id="favButton" onclick="addFavourite('${id}')">Aggiungi ai preferiti</button>`;
            }

        })
        .catch(error => console.error(error));
}

/**
 * Gestitsce la funzione del bottone 'mi è stato utile'
 */
async function upvote(url_string) {
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    var upvotes = 1;
    await fetch('../locations/' + id)
        .then(res => res.json())
        .then(res => {
            console.log(res.location);
            if (res.location.likes) {
                upvotes = res.location.likes + 1;
            } else {
                upvotes = 1;
            }
            document.getElementById('likes').innerHTML = upvotes;
        });

    fetch('../locations/' + id, {
        headers: {
            "Content-type": 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify([{
            propName: "likes",
            value: upvotes
        }])
    })
        .then(res =>
            res.json()
        )
        .then(res => {
            console.log(res);
            document.getElementById("likeButton").disabled = true;
        })
        .catch(err => {
            console.log(err);
        });
}

/**
 * Registra un nuovo utente
 */
function registration() {

    //get the form object
    var user_name = document.getElementById("regUser").value;
    var emailuser = document.getElementById("regEmail").value;
    var passworduser = document.getElementById("regPd").value;
    var password2 = document.getElementById("regPdConf").value;
    fetch('../user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: emailuser,
            password: passworduser
        })
    })
        .then((resp) => resp.json())
        .then(function (data) {
            let mes = data.message;
            if (mes.localeCompare("User created") == 0) {
                document.write(`<link rel="stylesheet" type="text/css" href="stylesheet.css"> <div id='center'><h1>Registrazione avvenuta con successo!</h1><br><h3>Ora prova a fare log In!</h3><br><a href='login.html'> <button style=" float: left"class="locationbtn"onclick="window.location.href='login.html';"> Torna al login</button></a></div>"`);
            } else if (mes.localeCompare("user already exist") == 0) {
                document.write("<div id='center'><h1>Utente già esistente!</h1><br><a href='registration.html'>Torna alla registrazione</a></div>");
            } else {
                document.write(`<link rel="stylesheet" type="text/css" href="stylesheet.css"> <div id='center'><h1>Errore nella fase di registrazione!</h1><br><a href='registration.html'><button style=" float: left"class="locationbtn"onclick="window.location.href='registration.html';"> Torna al signup</button></a></div>`);
            }
            console.log(mes);
        });
}

/**
 * Gestisce il popup del form per compilare un report
 */
function Popup(url_location) {
    var url = new URL(url_location);
    var id = url.searchParams.get("id");
    var stili = "top=100, left=300, width=500, height=450, status=no, menubar=no, toolbar=no scrollbars=no";
    window.open("popupReport.html?id=" + id, "", stili);
}

/**
 * Funzine per gestire i report
*/
function Report() {
    var choice;

    var radios = document.getElementsByName('reports');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {

            choice = radios[i].value;

            break;
        }
    }
    var url = new URL(window.location.href);
    var id = url.searchParams.get("id");
    console.log(choice);
    let tok = getCookie("token");
    var obj = {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_picture: id,
            report: choice
        })
    };
    fetch('../report', obj)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) { // Here you get the data to modify as you please
            let mes = data.message;
            if (mes.localeCompare("Report created") == 0) {
                document.write("<html><head><link rel='stylesheet' type='text/css' href='stylesheet.css'></head><body><div id='center'><h2>Report inviato con sucesso!</h2><br><br><button class=registerbtn onclick='Close()'>Chiudi</button></div></body></html>");
            } else {
                document.write("<html><head><link rel='stylesheet' type='text/css' href='stylesheet.css'></head><body><div id='center'><h2>Errore!</h2><br><br><button class=registerbtn onclick='Close()'>Chiudi</button></div></body></html>");
            }
        });

}
//to close the pop up
function Close() {
    window.close();
}

/**
 * Log In
 */
function login() {

    let logemail = document.getElementById("loginEmail").value;
    let logpassword = document.getElementById("loginPd").value;

    fetch('../user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: logemail,
            password: logpassword
        }),
    })
        .then((resp) => resp.json())
        .then(function (data) {
            let mes = data.message;
            if (mes.localeCompare("Auth successful") == 0) {
                document.write("<html><head><link rel='stylesheet' type='text/css' href='stylesheet.css'></head><body><div id='center' class='popup'><h1>Log in avvenuto con successo!</h1><form action='index.html'><button class= 'registerbtn' type='submit'> Torna alla home page </button></form> </body></html>");
                setCookie("token", data.token, 1);
                setCookie("email", logemail, 1);
            } else if (mes.localeCompare("Auth failed") == 0) {
                document.write("<html><head><link rel='stylesheet' type='text/css' href='stylesheet.css'></head><body><div id='center'><h1>Log in non riuscito!</h1><br><form action='login.html'><button class= 'registerbtn' type='submit'>Torna al LogIn</button></div></body></html>");
            } else {
                document.write("<html><head><link rel='stylesheet' type='text/css' href='stylesheet.css'></head><body><div id='center'><h1>Errore!</h1><br><form action='login.html'><button class= 'registerbtn' type='submit'>Torna al LogIn</body></div></body></html>");
            }
            console.log(mes);

        });

}

/**
 * Log Out
 */
function Logout() {
    eraseCookie('token');
    eraseCookie('email');
    location.reload();
}

// Part for the cookies if ever needed-----------
function setCookie(name, value, hours) {
    var expires = "";
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
// ---------------------

/**
 * Carica l'elenco completo dei Reports
 */
function loadReports() {

    const div = document.getElementById("reports");
    div.innerHTML = '';

    fetch('../checkReports')
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) { // Here you get the data to modify as you please

            console.log(data);

            return data.reports.map(function (report) { // Map through the results and for each run the code below

                let div2 = document.createElement('div');
                div2.className = "rep";
                //div2.addEventListener('click', window.open(`location.html?id=${location._id}`));
                div2.innerHTML = `Email: ${report.email}<br>Report: ${report.text}<br>Picture Id: <a href='location.html?id=${report.id_picture}' style='color: dodgerblue'> ${report.id_picture}</a><br><br>`;
                div.appendChild(div2);
            })
        })
        .catch(error => console.error(error));// If there is any error you will catch them here
}

/**
 * Controlla, in base a chi si è loggato, quali risorse della home gli sono visibili
 */
function loadButtons() {
    let mail = getCookie('email');
    if (mail != null) {
        document.getElementById("logoutButton").style.display = 'block'; // show logout button
        document.getElementById("addLocButton").style.display = 'block'; //show add location button
        document.getElementById("prefButton").style.display = 'block'; //show favorites button
        document.getElementById("logButton").style.display = 'none'; //hide login button
        document.getElementById("regButton").style.display = 'none'; //hide login button


        if (mail.localeCompare("manager@hotmail.it") == 0) {
            document.getElementById('reportListButton').style.display = 'block'; //show report list button only to manager account
        }
    } else {
        document.getElementById("logButton").style.display = 'block'; //show login button
        document.getElementById("regButton").style.display = 'block'; //show login button
    }

}
