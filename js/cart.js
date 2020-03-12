frank_global.SUM = 0;


/*****************
    Function
*************** */
// get DOM elements
function get(querySelector,boolean) {
    let element;
    if (boolean) {
        element = document.querySelectorAll(querySelector);
    } else {
        element = document.querySelector(querySelector);
    }
    return element;
}
// create DOM elements with className or id
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
// append DOM child elements in batch
function appendBatch(targe,...theArgs) {
    for (let args of theArgs) {
        targe.appendChild(args);
    }
}
// creat cart list item
function createCartListItem(imgSrc,title,id,colorTitle,size,qty,stock,price,code) {
    for (let args of arguments) {
        if (args === undefined) {
            return null;
        }
    }
    let carListItem = create('div','cartListItem');
    // add identify code
    carListItem.dataset.code = code;
    let productDetail = create('div','inlineBlock productDetail');
    let imgBox = create('div','imgBox');
    let img = create('img');
    img.src = imgSrc;
    imgBox.appendChild(img);
    
    let productSpec = create('ul','inlineBlock productSpec');
    let productSpec_title = create('li','productSpec_title');
    productSpec_title.innerText = title;
    let productSpec_id = create('li','productSpec_id');
    productSpec_id.innerText = id;
    let productSpec_colorTitle = create('li','productSpec_colorTitle');
    productSpec_colorTitle.innerText = `顏色｜ ${colorTitle}`;
    let productSpec_size = create('li','productSpec_size');
    productSpec_size.innerText = `尺寸｜ ${size}`;
    appendBatch(productSpec,productSpec_title,productSpec_id,productSpec_colorTitle,productSpec_size);
    appendBatch(productDetail,imgBox,productSpec);

    let infoPart = create('div','infoPart');
    let qtyDiv = create('div','inlineBlock');
    let itemQty = create('select','itemQty');
    let targetQty;

    let infoPartTitle = create('div','infoPartTitle');
    let span1 = create('span');
    span1.innerText = '數量';
    let span2 = create('span');
    span2.innerText = '單價';
    let span3 = create('span');
    span3.innerText = '小計';
    appendBatch(infoPartTitle,span1,span2,span3);

    itemQty.name = "qty";
    for (let i=1;i<=stock;i++) {
        let option = create('option');
        option.value = i;
        option.innerText = i;
        if (option.value == qty) {
            option.setAttribute('selected','selected');
            itemQty.dataset.qty = option.value;
            targetQty = option.value;
        }
        itemQty.appendChild(option);
    }
    
    qtyDiv.appendChild(itemQty);
    let priceDiv = create('div','inlineBlock');
    priceDiv.innerText = `NT. ${price}`;
    let sumDiv = create('div','inlineBlock totalItem');

    sumDiv.innerText = targetQty? price*targetQty: 0;
    let removeItem = create('img',['removeItem inlineBlock']);
    removeItem.src = "./img/trash_can.svg"
    appendBatch(infoPart,qtyDiv,priceDiv,sumDiv,removeItem);
    appendBatch(carListItem,productDetail,infoPartTitle,infoPart);

    let data = JSON.parse(localStorage.getItem('www.stylish.com_orderData'));
        
    /*** when change number of product */
    itemQty.addEventListener('change',function (e) {
        targetQty = e.target.value;
        itemQty.dataset.qty = targetQty;
        sumDiv.innerText = price*targetQty;
        updateQty();
        updateSUM();

        // updata the qty of product
        function updateQty() {
            let data = JSON.parse( localStorage.getItem('www.stylish.com_orderData') );
            let list = data.order.list;
            let cartListItemArray = get('.cartListItem',true);
            for (i=0; i<cartListItemArray.length; i++) {
                for (let item of list) {
                    if (cartListItemArray[i].dataset.code === item.code) {
                        item.qty = get('.itemQty',true)[i].dataset.qty;
                    }
                }
            }
            localStorage.setItem('www.stylish.com_orderData',JSON.stringify(data));
        }
    })
    /*** when remove products */
    removeItem.addEventListener('click',function (e) {
        carListItem.remove();
        let orderData = JSON.parse( localStorage.getItem('www.stylish.com_orderData') );
        for (i=0; i<orderData.order.list.length; i++) {
            if (orderData.order.list[i].id===id&&orderData.order.list[i].color.name===colorTitle&&orderData.order.list[i].size===size) {
                orderData.order.list.splice(i,1);
            }
        }
        localStorage.setItem('www.stylish.com_orderData',JSON.stringify( orderData ));
        updateSUM();
        updateCartToBuyNum(orderData.order.list);
    })

    return carListItem;
}
// update cart showing number
function updateCartToBuyNum(list){
    let cartValue = get('.cartBtn .num',true);
    let tableTitleNum = get('#tableTitle > span');

    cartValue[0].innerText = list.length;
    cartValue[1].innerText = list.length;
    tableTitleNum.innerText = `購物車（${list.length}）`;

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

    if (list.length===0) {
        let noItem = create('div','Msg_noItem');
        noItem.innerText = "目前尚未購買任何商品，快去逛逛吧～";
        get('#cartListTable').innerHTML = '';
        get('#cartListTable').appendChild(noItem);
    }
}
// update the sum value
function updateSUM() {
    frank_global.SUM = 0; //set initial value is 0
    // get sum of products
    let totalArray = get('.totalItem',true);
    // charge 判斷
    let shipmentCharge = totalArray.length==0? 0: 30;
    for (let total of totalArray) {
        frank_global.SUM+=parseInt(total.innerText);
    }
    // get sum of all
    let sumNeedToPay = frank_global.SUM + shipmentCharge;
    get('#totalMoney').innerText = `NT. ${frank_global.SUM}`;
    get('#shippingCost').innerText = `NT. ${shipmentCharge}`;
    get('#sumNeedToPay').innerText = `NT. ${sumNeedToPay}`;
}
function render() {
    let data = JSON.parse(localStorage.getItem('www.stylish.com_orderData'));
    let list = data.order.list;
    /**
    createCartListItem(imgSrc,title,id,colorTitle,size,qty,stock,price) 
     */
    let cartListTable = get('#cartListTable');
    for (let item of list) {
        cartListTable.appendChild(createCartListItem(item.picture,item.name,item.id,item.color.name,item.size,item.qty,item.stock,item.price,item.code));
    }
    if (Object.keys(data.order.recipient).length>0) {
        get('#deliverInfoName').value = data.order.recipient.name;
        get('#deliverInfoTel').value = data.order.recipient.phone;
        get('#deliverInfoEmail').value = data.order.recipient.email;
        get('#deliverInfoAddress').value = data.order.recipient.address;
    }

    updateSUM();
    updateCartToBuyNum(list);
}
// load tap pay SDK 
function TapPay() {
    TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');
    let statusTable = {
        '0': '欄位已填好，並且沒有問題',
        '1': '欄位還沒有填寫',
        '2': '欄位有錯誤，此時在 CardView 裡面會用顯示 errorColor',
        '3': '使用者正在輸入中',
    }
    TPDirect.card.setup({
        fields: {
            number: {
                // css selector
                element: '#card-number',
                placeholder: '**** **** **** ****'
            },
            expirationDate: {
                // DOM object
                element: document.getElementById('card-expiration-date'),
                placeholder: 'MM / YY'
            },
            ccv: {
                element: '#card-ccv',
                placeholder: '後三碼'
            },
        },
        styles: {
            // Style all elements
            'input': {
                'color': 'gray'
            },
            // Styling ccv field
            'input.cvc': {
                // 'font-size': '16px'
            },
            // Styling expiration-date field
            'input.expiration-date': {
                // 'font-size': '16px'
            },
            // Styling card-number field
            'input.card-number': {
                // 'font-size': '16px'
            },
            // style focus state
            ':focus': {
                'color': 'black'
            },
            // style valid state
            '.valid': {
                'color': 'green'
            },
            // style invalid state
            '.invalid': {
                'color': 'red'
            },
            // Media queries
            // Note that these apply to the iframe, not the root window.
            '@media screen and (max-width: 400px)': {
                'input': {
                    'color': 'orange'
                }
            }
        }
    })

    TPDirect.card.onUpdate(function (update) {
        let message = document.querySelector('#Message');
        message.value = `
            卡號: ${statusTable[update.status.number]} \n
            有效日期: ${statusTable[update.status.expiry]} \n
        `.replace(/    /g, '')
        if (update.hasError) {
            message.classList.add('error')
            message.classList.remove('info')
        } else {
            message.classList.remove('error')
            message.classList.add('info')
        }
    });
}
/********************
    Event Listener
*********************/ 
/** click button to pay the bill */
get('div.payTheBill').addEventListener('click',(e) => {
    //check all the information is filled
    let data = JSON.parse( localStorage.getItem('www.stylish.com_orderData') );
    let inputs = get('.receiverInfo > li > input',true);
    if (data.order.list.length === 0) {
        alert('尚未購買任何商品！請勿玩弄我');
    } else if (inputs[0].value.length === 0) {
        alert('請填寫收件人');
    } else if (inputs[1].value.length === 0) {
        alert('請填寫收件人手機');
    } else if (inputs[2].value.length === 0) {
        alert('請填寫Email');
    } else if (inputs[3].value.length === 0) {
        alert('請填寫收件地址');
    } else {
        // the delivery info update and get prime
        data.order.subtotal = get('#totalMoney').innerText.match(/\d+/)[0];
        data.order.freight = get('#shippingCost').innerText.match(/\d+/)[0];
        data.order.total = get('#sumNeedToPay').innerText.match(/\d+/)[0];
        data.order.recipient.name = get('#deliverInfoName').value;
        data.order.recipient.phone = get('#deliverInfoTel').value;
        data.order.recipient.email = get('#deliverInfoEmail').value;
        data.order.recipient.address = get('#deliverInfoAddress').value;

        function getCheckedOpt(radio) {
            for (let option of radio) {
                if (option.hasAttribute('checked')) {
                    return option;
                }
            }
        }
        data.order.recipient.time = getCheckedOpt(get('#deliverTimePrefer > input',true)).value;
        localStorage.setItem('www.stylish.com_orderData',JSON.stringify(data));

        TPDirect.card.getPrime(function(result) {
            if (result.status !== 0) {
                alert(`信用卡資訊錯誤，請核對是否輸入正確\ngetPrime error: \n${result.msg}`);
            } else {
                data.prime = result.card.prime;
                fetch ('https://api.appworks-school.tw/api/1.0/order/checkout',{
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers:{
                        'Content-Type': 'application/json'
                    } ,
                    // mode: 'cors'
                })
                .catch(function (e) {
                    console.log(e);
                })
                .then(function (res) {
                    window.alert("付款成功，已經收到訂單，商品正在準備中");
                    let data = JSON.parse(localStorage.getItem('www.stylish.com_orderData'));
                    data.order.list = [];
                    localStorage.setItem('www.stylish.com_orderData',JSON.stringify(data));
                    return res.json();
                })
                .catch(function (e) {
                    console.log(e);
                })
                .then(function (obj) {
                    location.href = `./thankyou.html?orderNumber=${obj.data.number}`;
                })
            }
        });
        
    }
}) /*** End event listenr */

/** change radio input's attribute */
get('#deliverTimePrefer').addEventListener('change',function (e) {
    for (let radio of get('#deliverTimePrefer > input',true)) {
        radio.removeAttribute('checked')
    }
    e.target.setAttribute('checked','checked');
})

/*****************
       Main
*************** */
render();
TapPay();