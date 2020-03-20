
/****************
     全域變數
*****************/ 
const frank_global = {
    prefix : "https://api.appworks-school.tw",
    infiniteScrollLocker : false,
    onSearch : false,
    searchKeyword: "",
    category : ["all","women", "men","accessories"],
    cateIndex : 0,
    pagging : 0,
    nextPage: " ",
    /**********DOM */
    DOM: {
        webLogo : get('img.btn_logo01'),
        queryBox : get('.queryBox'),
        queryBox_btn : get('.queryBox > img'),
        mainNavTitles : get(".mainNavTitles"),
        secondNavTitles : get(".secondNavTitles"),
        banner : get(".banner"),
        bannerText : get(".bannerText"),
        bannerText1 : get('.bannerText span',true)[0],
        bannerText2 : get('.bannerText span',true)[1],
        productArea: get('.productArea'),
        productBox : get('.productBox'),
        footer : get('footer'),
        bannerSwitch : get('.bannerSwitch')
    }
}


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
/** check cart value */
function checkCartValue() {
    let cartValue = get('.cartBtn .num',true);
    cartValue[0].innerText = JSON.parse(localStorage.getItem('www.stylish.com_orderData')).order.list.length;
    cartValue[1].innerText = JSON.parse(localStorage.getItem('www.stylish.com_orderData')).order.list.length;
    if (cartValue[0].innerText >0 ) {
        cartValue[0].style.display = "block";
    } else {
        cartValue[0].style.display = "none";
    }
    if (cartValue[1].innerText >0 ) {
        cartValue[1].style.display = "block";
    } else {
        cartValue[1].style.display = "none";
    }
}
function userSingIn() {

}
function userSingUp() {
    
}
/** check login state */
function checkFBLoginState() {
    FB.getLoginStatus( (res) => {
        console.log(res.status);
        if (res.status === 'unknown'|| res.status === 'not_authorized') {
            console.log('not yet login facebook, please login first');
        } else if (res.status === 'connected') {
            console.log('FB login!',res.authResponse);
            changeUserData(true,res.authResponse);
            checkLoginState();
        }
    });
}
/** show login box */
function checkLoginState() {
    let userData = JSON.parse(localStorage.getItem('www.stylish.com_userData'));
    if (!userData.isLogin) {
        get('#loginBox').style.display =  'block';
    } else {
        get('#loginBox').style.display =  'none';
    }
}
function changeUserData(isLogin, authResponse) {
    let userData = JSON.parse(localStorage.getItem('www.stylish.com_userData'));
    userData.isLogin = isLogin;
    userData.authResponse_FB = authResponse;
    console.log(userData);
    localStorage.setItem('www.stylish.com_userData',JSON.stringify(userData));
    console.log(localStorage.getItem('www.stylish.com_userData'))
    console.log(JSON.stringify(userData));
}

/********************
    Event Listener
*********************/ 
/** Control: 1#checkout category 2#go to cart page*/  
get('header').addEventListener('click',(e) => {
    let isCatagoBtn = Array.prototype.includes.call(get('.catagoBtn > span',true),e.target);
    let isCartBtn = Array.prototype.includes.call(get('.cartBtn',true),e.target);
    let isProfileBtn = Array.prototype.includes.call(get('.profileBtn',true),e.target);
    if (isCatagoBtn || e.target === get('.btn_logo01')) { // 1#go back to main page 
        /*** reset category index, page number to zero, turn search mode and infinite lock off  */ 
        let target = e.target;
        let cateIndex;
        if (target === get('.btn_logo01')) {
            cateIndex = 0;
        } else if (Array.prototype.indexOf.call(get('.mainNavTitles > span',true),target) >= 0) {
            cateIndex = Array.prototype.indexOf.call(get('.mainNavTitles > span',true),target)+1;
        } else if (Array.prototype.indexOf.call(get('.secondNavTitles > span',true),target) >= 0) {
            cateIndex = Array.prototype.indexOf.call(get('.secondNavTitles > span',true),target)+1;
        }
        location.href = `./index.html?cateIndex=${cateIndex}`
        
        // change NavText Color according to the cateIndex
        function setFontSepia() {
            function rmStyle() {
                for (let el of get(".mainNavTitles > span",true)){ el.style = ""; }
                for (let el of get(".secondNavTitles > span",true)){ el.style = "";}
            }
            rmStyle();
            if (parseInt(frank_global.cateIndex) != 0) {
                get(`.mainNavTitles span:nth-of-type(${frank_global.cateIndex})`).style = "color:#8b572a";
                get(`.secondNavTitles span:nth-of-type(${frank_global.cateIndex})`).style = "color:#fff";
            }
        }
    }
    if (isCartBtn) { // go to Cart Page
        window.location.href = './cart.html';
        console.log('click');
    }
    if (isProfileBtn) { // go to Profile Page
        location.href = './profile.html';
    }
});
/** Control: Search Box Layout Switch */
get('.queryBox > img').addEventListener('click',(e) => { // show Search Box
    get('.queryBox').style = `border: 1px solid #979797; position:absolute; top: -8px; right:5%; width:90%; text-align:center; background:#fff; height:50px;`;
    get('.queryBox > input').style = `display:inline-block; width: 80vw; line-height:45px;`;
    get('.queryBox > img').style = 'display:none'
    get('.queryBox > input').focus();
});
get('.queryBox > input').addEventListener('focusout',(e) => { // hide Search Box
    get('.queryBox').style = ``;
    get('.queryBox > input').style = ``;
    get('.queryBox > img').style = '';
});
/**  go to Search Page */
get('.queryBox > input').addEventListener('keypress', (e) => {
    if (e.code==="Enter") {
        let searchText = get('.queryBox > input').value;
        console.log(`搜尋：${searchText}`);
        if (!searchText) {
            alert("你好～搜尋內容不能為空歐 ^.<");
        } else {
            location.href = `./index.html?keyword=${searchText}`;
        }
    }
},false);
/** sign up and sign in btn */
get('.signUp_btn').addEventListener('click', (e) => {

});
get('.signIn_btn').addEventListener('click', (e) => {
    let account = get('#loginBox input',true)[0].value;
    let password = get('#loginBox input',true)[1].value;
});



/********************
       Set Up
*********************/ 
/** 
        IF there is no local order data, initialize it.
*/
if (!localStorage.getItem('www.stylish.com_orderData')) {
    console.log('create new orderData');
    let orderData = {
        prime: `[Prime Key from TapPay]`,
        order: {
            shipping: "delivery",
            payment: "credit_card",
            subtotal: `[Price excluded Freight Fee]`,
            freight: `[Freight Fee]`,
            total: `[Final Price]`,
            recipient: {},
            list:[],
        },   
    }
    localStorage.setItem('www.stylish.com_orderData',JSON.stringify(orderData)); 
}
if (!localStorage.getItem('www.stylish.com_userData')) {
    console.log('create new userData');
    let userData = {
        isLogin: false,
        authResponse_FB: {},
        accountID: '',
        password: '',
    }
    localStorage.setItem('www.stylish.com_userData',JSON.stringify(userData));
}

/** FB SDK setup */
window.fbAsyncInit = function() {
    FB.init({
            appId            : '756508484870054', //756508484870054 online  //2907197079299920 local
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v5.0',
            status           : true,
        });
    console.log('Facebook initialized')
    // checkFBLoginState();
};
(function(d, s, id) {                      // Load the SDK asynchronously
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

// checkLoginState();