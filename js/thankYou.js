
/********************
        Main
*********************/ 
get('#mainDiv > div').innerText = `\n訂單號碼：${location.search.match(/\d+/)}`