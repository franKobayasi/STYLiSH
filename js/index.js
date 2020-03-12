
/****************
     function
*****************/ 

/** 
    set each page's category, paging number, 
    search mode and srollLocker toggle back to default
*/
function reset() {
    frank_global.cateIndex = 0;
    frank_global.pagging = 0;
    frank_global.onSearch = false;
    frank_global.infiniteScrollLocker = false;
}
/** render Page trigger renderBanner and renderProducts */
function renderPage(url){
    let xhttp = new XMLHttpRequest();
    xhttp.addEventListener('load', function () {
        //形成商品櫥窗
        let res = JSON.parse(this.response);
        let data = res.data;
        frank_global.nextPage = res.next_paging; 
        renderProducts(data);
    });
    xhttp.open('GET', url);
    xhttp.send();
}
/** renderBanner */
function renderBanner(bannerData){
    let bannerSwitch = create('div','bannerSwitch'); /***** create banner switcher */
    get('.bannerContainer').appendChild(bannerSwitch);
    for (let data of bannerData) {
        let dot = create('div'); 
        bannerSwitch.appendChild(dot); /***** add three banner circle divs */
        let banner = create('div','banner'); /***** add three banners */
        banner.dataset.product_id = data.product_id;
        banner.style = `background-image:url(${frank_global.prefix+data.picture});`
        let bannerText = create('div','bannerText');
        let span1 = create('span');
        let span2 = create('span');
        let storyHtml = data.story;
        while (storyHtml.includes('\r\n')) {
            storyHtml = storyHtml.replace('\r\n','<br/>');
        }
        span1.innerHTML = storyHtml.match(/.+。/)[0];
        span2.innerHTML = storyHtml.match(/。.+/)[0].replace('。','');
        bannerText.append(span1,span2);
        banner.appendChild(bannerText);
        get('.bannerContainer').appendChild(banner);
    }
    checkOutBanner(0);
}
/** render products(targets, clear all product box before render) */
function renderProducts(products,clearOrnot){
    let producctArea = get(".productArea");
    // set up clearOrnot 
    clearOrnot = clearOrnot===undefined||(typeof clearOrnot !== "boolean")? true: clearOrnot;
    if (clearOrnot) {
        producctArea.innerHTML=' ';
    }
    if (products.length===0 && frank_global.pagging===0){
        let div = create('div');
        let target = get(".productArea");
        div.innerHTML = "沒有搜尋到任何相關的產品哦！";
        div.style = "text-align:center;"
        target.appendChild(div);
    }
    for(let product of products){
        let productBox = create('div','productBox');
        productBox.dataset.id = product.id;
        let productImg = create('img','productImg');
        productImg.src = product.main_image;
        productImg.dataset.id = product.id;
        productBox.appendChild(productImg);
        // add the div of colors
        for(let color of product.colors){
            let productColor = create('div','productColor');
            productColor.style.backgroundColor = '#'+color.code;
            productBox.appendChild(productColor);
        }
        let productTitle = create('div','productTitle');
        productTitle.innerText = product.title;
        productBox.appendChild(productTitle);
        let producctPrice = create('div','producctPrice');
        let dollar = create('span');
        dollar.innerText = "TWD. ";
        producctPrice.appendChild(dollar);
        producctPrice.append(product.price);
        productBox.appendChild(producctPrice);
        producctArea.appendChild(productBox);
    }    
}
function showSearch() {
    reset();
    frank_global.onSearch = true;
    let url = `${frank_global.prefix}/api/1.0/products/search${frank_global.searchKeyword}&paging=${frank_global.pagging}`;
    renderPage(url);
}
function showCategory() {
    setFontSepia();
    let url = `${frank_global.prefix}/api/1.0/products/${frank_global.category[frank_global.cateIndex]}?frank_global.pagging=${frank_global.pagging}`;
    renderPage(url);
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
function checkOutBanner(index,duration) {
    /** animition opacity */
    let bannerContainer = get('.bannerContainer');
    bannerContainer.style = `animation: ${duration/1000}s linear infinite transOpacity;`

    let banners = get('.banner',true);
    index %= banners.length;
    for (let banner of banners) {
        banner.style.display = '';
    }
    banners[index].style.display = 'block';
    let switchers = get('.bannerSwitch > div',true);
    for (let switcher of switchers) {
        switcher.style.backgroundColor = '';
    }
    switchers[index].style.backgroundColor = 'black';
}
function main() {
    /** 
        get Banner data, save it to bannerObj, 
        then start to render page. 
    */
    fetch("https://api.appworks-school.tw/api/1.0/marketing/campaigns")
        .then( function (res) {
            return res.json();
        })
        .catch( function (e) {
            console.log(e.stack);
        })
        .then( function (json) {
            renderBanner(json.data);
            checkCartValue(); // change cart number at first time loading.
            let bannerIndex = 0;
            bannerAnimation(bannerIndex,8000);
            function bannerAnimation(bannerIndex,duration) {
                setInterval(() => {
                    bannerIndex++;
                    bannerIndex %= json.data.length;
                    checkOutBanner(bannerIndex,duration)
                }, duration);
            }
        })
    
    /** 
        According URL to decide which mode to use 
        - showSearch()
        - showCategory()
    */
    let queryStr = decodeURI(window.location.search);
    if ( /\?keyword/.test(queryStr) ) {
        frank_global.searchKeyword = queryStr.match(/\?keyword=.+/)[0];
        frank_global.onSearch = true; // change to search mode.
        showSearch();
    } else if (/\?cateIndex/.test(queryStr) ) {
        frank_global.cateIndex = queryStr.match(/\d/)[0]; // otherwise search mode off,setting cateIndex;
        showCategory();
    } else {
        showCategory();
    }
}

/********************
    Event Listener
*********************/ 
/** Control: 1#checkout category 2#go to cart page*/  
get('header').addEventListener('click',(e) => {
    let isCatagoBtn = Array.prototype.includes.call(get('.catagoBtn > span',true),e.target);
    let isCartBtn = Array.prototype.includes.call(get('.cartBtn',true),e.target);
    if (isCatagoBtn || e.target === get('.btn_logo01')) { // 1#checkout category
        /*** reset category index, page number to zero, turn search mode and infinite lock off  */ 
        reset();
        let target = e.target;
        let cateIndex1 = Array.prototype.indexOf.call(get('.mainNavTitles > span',true),target);
        let cateIndex2 = Array.prototype.indexOf.call(get('.secondNavTitles > span',true),target);
        if (target === get('.btn_logo01')) {
            frank_global.cateIndex = 0;
        } else if (cateIndex1 >= 0) {
            frank_global.cateIndex = cateIndex1+1;
        } else if (cateIndex2 >= 0) {
            frank_global.cateIndex = cateIndex2+1;
        }
        showCategory();
    }
    if (isCartBtn) { // go to Cart Page
        window.location.href = './cart.html';
        console.log('click');
    }
});   
/** Control: triger searching */
get('.queryBox > input').addEventListener('keypress', (e) => {
    if (e.code==="Enter") {
        let searchText = get('.queryBox > input').value;
        console.log(`搜尋：${searchText}`);
        frank_global.searchKeyword = `?keyword=${searchText}`;
        if (!frank_global.searchKeyword) {
            alert("你好～搜尋內容不能為空歐 ^.<");
        } else {
            showSearch();
        }
    }
},false);
/** Control: Infinite Scroll */
window.addEventListener('scroll', function (e) {
    let footerRect = frank_global.DOM.footer.getBoundingClientRect();
    if (footerRect.y <  window.innerHeight) {
        if (!frank_global.infiniteScrollLocker) {
            frank_global.infiniteScrollLocker = true;
            getNextPaging();
        }else {
        }
    }
    // Infinite Scroll triger getting next page
    function getNextPaging() {
        if (frank_global.nextPage) {
            let url;
            if (frank_global.onSearch) {
                url = `https://api.appworks-school.tw/api/1.0/products/search?keyword=${frank_global.searchKeyword}&paging=${frank_global.nextPage}`
            }else {
                url = `https://api.appworks-school.tw/api/1.0/products/${frank_global.category[frank_global.cateIndex]}?paging=${frank_global.nextPage}`;   
            }  
            fetch(url)
            .then( function (res) {
                return res.json();
            })
            .catch(function (e) {
                console.log(e.stack)
            })
            .then( function (target) {
                let data = target.data;
                frank_global.pagging = frank_global.nextPage;
                frank_global.nextPage = target.next_paging;
                renderProducts(data,false);
                frank_global.infiniteScrollLocker = false;
            });
        }else {
            console.log("No more products");
        }
    }
})
/** Control: when click switchers change banner */
get('.bannerContainer').addEventListener('click',(e) => {
    let indexOfbannerSwitch = Array.prototype.indexOf.call( get('.bannerSwitch div',true), e.target );
    let indexOfbanner = Array.prototype.indexOf.call( get('.banner',true), e.target );
    let indexOfbannerText = Array.prototype.indexOf.call( get('.bannerText',true), e.target );
    if (indexOfbannerSwitch >= 0) {
        checkOutBanner(indexOfbannerSwitch);
    }
    if (indexOfbanner >= 0) {
        let id = get('.banner',true)[indexOfbanner].dataset.product_id;
        location.href = `./product.html?id=${id}`;
    }
    if (indexOfbannerText >= 0) {
        let id = get('.banner',true)[indexOfbannerText].dataset.product_id;
        location.href = `./product.html?id=${id}`;
    }

}) 
/** Control: get to product detail page */
get('.productArea').addEventListener('click',function (e) {
    let booleanValue = e.target.className==="productBox"||e.target.className==="productImg"||e.target.className==="productPrice"||e.target.className==="productTitle"||e.target.className==="productColor";
    if (booleanValue) {
        if (e.target.dataset.id) {
            let id = e.target.dataset.id;
            let url = `./product.html?id=${id}`
            window.location.href = url;
        }
    };
})

/********************
        START
*********************/ 
main();


