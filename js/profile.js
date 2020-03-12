renderProfile();


/****************
     function
*****************/ 
/** get and create DOM elements */
function get(querySelector,boolean) {
    let element;
    if (boolean) {
        element = document.querySelectorAll(querySelector);
    } else {
        element = document.querySelector(querySelector);
    }
    return element;
}
function create(type,className,id) {
    let element = document.createElement(type);
    if (className) {
        element.className = className;
    }
    if (id) {
        element.id = id;
    }
    return element;
}
function renderProfile() {
    let userName = create('span','userName');
    let userImg = create('img','userImg');
    let userEmail = create('span','userEmail');
    get('main').append(userName,userImg,userEmail);
    let userData = JSON.parse(localStorage.getItem('www.stylish.com_userData'));
    if (Object.keys(userData.authResponse_FB).length > 0) {
        let userID = userData.authResponse_FB.userID;
        let accessToken = userData.authResponse_FB.accessToken;
        /*** get user FB data */
        fetch(`https://graph.facebook.com/${userID}?fields=name,picture,email&access_token=${accessToken}`)
        .then((res) => {
            return res.json();
        })
        .catch((e) => {
            console.log(e);
        })
        .then((json) => {
            userName.innerText = json.name;
            userImg.src = json.picture.data.url;
            userEmail.innerText = json.email;
        })
    }
}