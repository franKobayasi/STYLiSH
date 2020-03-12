frank_global.product = {
    searchID: `${window.location.search}`,
    fetchUrl: '',
    category: '',
    id: '',
    name: '',
    picture: '',
    price: '' ,
    variants:{},
    currentStock: '',
    currentSize: '',
    currentColor: { 
        code: '',
        name: '',
        },
    currentNumber: '',
}
/****************
    function
*****************/ 
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
function getIndexOf(targetArray,element) {
   return Array.prototype.indexOf.call( targetArray, element);
}

function renderProduct(product) {
    get('.imgBox > img').src = product.picture;
    get('.contentBox h3').innerText = product.name;
    get('#productID').innerText = product.id;
    get('#productPrice').innerText = `TWD ${product.price}`;
    get('.noteOfProduct').innerText = product.note;
    get('.textureOfProduct').innerText = `${product.texture}\n${product.description}\n${product.wash}`;
    get('.placeOfProduct').innerText = `產地：${product.place}`;
    renderSpecOption(product.colors,product.sizes);
    renderDetailPart(product.story,product.images);
    setFontSepia();
}
function renderSpecOption(colors,sizes) {
    /******Color */
    for (color of colors) {
        let border = create('div');
        let colorValue = create('div',"colorValue");
        colorValue.style.backgroundColor = `#${color.code}`;
        colorValue.dataset.color_code = color.code
        colorValue.dataset.name = `${color.name}`;
        border.appendChild(colorValue);
        productColor.appendChild(border);
    }
    /******Size */
    for (size of sizes) {
        let sizeDiv = create('div');
        sizeDiv.innerText = size;
        productSize .appendChild(sizeDiv);
    }
}
function renderDetailPart(story,imgs) {
    /******Stroy and Images */
    for (url of imgs) {
        let storyDiv = create('div','storyOfProduct');
        let img = create('img','storyImgOfProduct');
        storyDiv.innerText = story;
        img.src = url;
        get('.productMore').appendChild(storyDiv);
        get('.productMore').appendChild(img);
    }
}
/*** set NAV title text color */
function setFontSepia() {
    function rmStyle() {
        for (let el of get(".mainNavTitles > span",true)){
            el.style = "";
        }
        for (let el of get(".secondNavTitles > span",true)){
            el.style = "";
        }
    }
    rmStyle();
    if (frank_global.product.category==="women"){
        get(".mainNavTitles span:nth-of-type(1)").style = "color:#8b572a";
        get(".secondNavTitles span:nth-of-type(1)").style = "color:#fff";
    }else if (frank_global.product.category==="men"){
        get(".mainNavTitles span:nth-of-type(2)").style = "color:#8b572a";
        get(".secondNavTitles span:nth-of-type(2)").style = "color:#fff";
    }else {
        get(".mainNavTitles span:nth-of-type(3)").style = "color:#8b572a";
        get(".secondNavTitles span:nth-of-type(3)").style = "color:#fff";
    }
}

/** 
to find the choosed color and size then update the currentColor and currSize, 
then to decide the stock of product, should make the numberToBuy be 1 or 0 depend on the stock.
*/
function getCurrentSpec() {
    frank_global.product.current = {
        size: get('#productSize .sizeChoosed').innerText.trim(),
        color: {
            code: get('#productColor .colorChoosed').firstChild.dataset.color_code,
            name: get('#productColor .colorChoosed').firstChild.dataset.name
        },
    };
    frank_global.product.current.stock = (function (variants) {
        for (let v of variants) {
            let choosen = ( v.size === frank_global.product.current.size && frank_global.product.current.color.code === v.color_code);
            if (choosen) {
                frank_global.product.current.number = v.stock? 1: 0;
                get('#productNumValue').innerText = frank_global.product.current.number;
                /** set the initial numberToBuy is one */
                return v.stock;
            }
        }
        /** set the initial numberToBuy is zero if there is no stock */
        get('#productNumValue').innerText = frank_global.product.current.number;
        return 0;
    } (frank_global.product.product.variants))
}
/** check stack of particular spec */
function outOfStack () {
    if (!get('.colorChoosed')) {
        get("#productColor > div:nth-of-type(1)").className = "colorChoosed";
    } 
    
    let sizeDivs = get('#productSize > div',true);
    let variants = frank_global.product.product.variants;
    let targetColor = get('.colorChoosed').firstChild.dataset.color_code;
    let sizeHasNoStack = [];
    
    for (let variant of variants) {
        if (variant.color_code === targetColor && variant.stock ===0 ) {
            sizeHasNoStack.push(variant.size);
        }
    }
    for (let div of sizeDivs) { /** reset all size div to display */
        div.style.display = 'inline-block';
        for (let size of sizeHasNoStack) {
            if (size === div.innerText) {
                div.style.display = 'none';
                div.className = '';
            }
        }
    }  
    if (!get('.sizeChoosed') ) {
        getFirstOne: for (let div of sizeDivs) {
            if (div.style.display !== 'none') {
                div.className = 'sizeChoosed';
                break getFirstOne;
            }
        } 
    }
}
function main() {
    // check localStorage's 'www.stylish.com_orderData'
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

    frank_global.product.fetchUrl = `https://api.appworks-school.tw/api/1.0/products/details${frank_global.product.searchID}`;
    fetch(frank_global.product.fetchUrl)
        .then(function (res) {
            return res.json();
        })
        .catch(function (e) {
            console.log(e.stack,"\r\nSome things wrong, please check");
        })
        .then(function (dataObj) {
            /** get initial data */
            let data = dataObj.data;
            frank_global.product.category = data.category;
            frank_global.product.product = {
                id: data.id,
                name: data.title,
                description: data.description,
                price: data.price,
                texture: data.texture,
                wash: data.wash,
                note: data.note,
                story: data.story,
                place: data.place,
                picture: data.main_image,
                colors: data.colors,
                sizes: data.sizes,
                images: data.images,
                variants: data.variants
            }
            /*** render Product */
            renderProduct(frank_global.product.product);
            outOfStack(); /** Select the spec of product */
            getCurrentSpec();
        })
    checkCartValue();
}


/********************
    Event Listener
*********************/ 
/** Switch Color */
get('#productColor').addEventListener('click',(e) => {
    if (Array.prototype.indexOf.call( get('#productColor div',true), (e.target)) >=0 ) {
        for (let other of get('#productColor > div',true)) {
            other.className = '';
        }
        if (Array.prototype.indexOf.call( get('#productColor > div > .colorValue',true), (e.target)) >=0 ) {
            e.target.parentElement.className = 'colorChoosed';
        } else if (Array.prototype.indexOf.call( get('#productColor > div',true), (e.target)) >=0 ) {
            e.target.className = 'colorChoosed';
        }
    }
    outOfStack();
    getCurrentSpec();
})
/** Switch Size */
get('#productSize').addEventListener('click',(e) => {
    if (Array.prototype.indexOf.call( get('#productSize > div',true), (e.target)) >=0 ) {
        for (let other of get('#productSize > div',true)) {
            other.className = '';
        }
        e.target.className = 'sizeChoosed';
    }
    getCurrentSpec();
})
/** Change Number to Buy */
get('.numberOfProduct').addEventListener('click',(e) => {
    if (getIndexOf(get('.numberOfProduct > button',true),e.target)===0) {
        if (get('#productNumValue').innerText>=1) {
            frank_global.product.current.number = --get('#productNumValue').innerText;
        }
    } else if (getIndexOf(get('.numberOfProduct > button',true),e.target)===1) {
        if (get('#productNumValue').innerText<frank_global.product.current.stock) {
            frank_global.product.current.number = ++get('#productNumValue').innerText;
        }
    }
    console.log(frank_global.product.current);
})
/**  Add to cart update the list item */
get('#addToCart_Btn').addEventListener('click',(e) => {
    let product = { 
        id: frank_global.product.product.id,
        name: frank_global.product.product.name,
        price: frank_global.product.product.price,
        picture: frank_global.product.product.picture,
        color: frank_global.product.current.color,
        size: frank_global.product.current.size ,
        qty: frank_global.product.current.number,
        stock: frank_global.product.current.stock,
        code: `${frank_global.product.product.id}_${frank_global.product.current.color.code}_${frank_global.product.current.size}`
    };
    let orderData = JSON.parse(localStorage.getItem('www.stylish.com_orderData'));
    let list = orderData.order.list;
    for (let i of list) {
        if(i.id ===product.id &&i.size===product.size&&i.color.code===product.color.code) {
            alert('不能重複添加相同品項，如需修改購買數量，請至購物車...');
            return 0;
        }
    }
    list.push(product);
    get('.cartBtn .num',true)[0].innerText = list.length;
    get('.cartBtn .num',true)[1].innerText = list.length;
    localStorage.setItem('www.stylish.com_orderData',JSON.stringify(orderData));
    checkCartValue();
    alert('成功加入購入車'); 
});

/********************
        START
*********************/ 
main();


