let itemForms = document.querySelectorAll('#item_form')
let table = document.getElementById('cartTable')
let cartBtn = document.getElementById('cartButton')
cartBtn.style.visibility = 'hidden'
let logoutBtn = document.getElementById('logoutBtn')

let total = 0;
let cp = 0;

const getItems = () => new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()

    request.addEventListener('readystatechange', (e) => {
        if (e.target.readyState === 4 && e.target.status === 200) {
            const data = JSON.parse(e.target.responseText)
            resolve(data.todos)
        } else if (e.target.readyState === 4) {
            reject('An error has taken place')
        }
    })
    request.open('GET', `http://localhost:3000/cart`)
    request.send()
})

const deleteItem = (id) => new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    // console.log(id)
    request.addEventListener('readystatechange', (e) => {
        if (e.target.readyState === 4 && e.target.status === 200) {
            const data = JSON.parse(e.target.responseText)
            total -= data.pPrice
            for (let i = 1; i < table.rows.length; i++) {
                let rowData = table.rows[i].innerText.toString().replace(/\t/g, ',').split(',')
                if (rowData[0] === data.pId) {
                    table.deleteRow(i)
                    break;
                }
            }
            resolve()

        } else if (e.target.readyState === 4) {
            reject('An error has taken place')
        }
    })
    request.open("DELETE", `http://localhost:3000/cart/${id}`)
    request.send()
})

let saveItem = (e) => new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append('pId', e.target.elements.pId.value)
    formData.append('pName', e.target.elements.pName.value)
    formData.append('pQty', e.target.elements.pQty.value)
    formData.append('pPrice', e.target.elements.pQty.value * (e.target.elements.pPrice.value))

    getItems().then((items) => {
        items.forEach((item) => {
            if (item.pId == e.target.elements.pId.value) {
                deleteItem(item._id)
            }
        })
    })
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', (e) => {
        if (e.target.readyState === 4 && e.target.status === 200) {
            const data = JSON.parse(e.target.responseText)
            item = {
                objId: data._id,
                prdId: data.pId,
                prdName: data.pName,
                prdQty: data.pQty,
                prdPrice: data.pPrice
            }
            resolve(addToCart(item))
        } else if (e.target.readyState === 4) {
            reject('An error has taken place')
        }
    })
    xhr.open("POST", "http://localhost:3000/cart");
    xhr.send(formData);
})

function populateCart() {
    getItems().then((items) => {
        items.forEach((item) => {
            let temp = {
                objId: item._id,
                prdId: item.pId,
                prdName: item.pName,
                prdQty: item.pQty,
                prdPrice: item.pPrice,
            }
            addToCart(temp)
        })
    })
}
populateCart()
function getUserInfo() {
    const request = new XMLHttpRequest()
    request.addEventListener('readystatechange', (e) => {
        if (e.target.readyState === 4 && e.target.status === 200) {
            const data = JSON.parse(e.target.responseText)
            // console.log(data);

            $('#userName').text(data.email)

            const request = new XMLHttpRequest()
            request.addEventListener('readystatechange', (e) => {
                if (e.target.readyState === 4 && e.target.status === 200) {
                    const data = JSON.parse(e.target.responseText)
                    // console.log(data);

                    $('#accBalance').text(data[0].acBal)
                    $('#acFrom').val(data[0].acNum)

                } else if (e.target.readyState === 4) {
                    reject('An error has taken place')
                }
            })
            request.open('GET', `http://localhost:3000/account/${data.acNum}`)
            request.send()
        } else if (e.target.readyState === 4) {
            reject('An error has taken place')
        }
    })
    request.open('GET', `http://localhost:3000/users/me`)
    request.send()
}
getUserInfo()

itemForms.forEach(element => {
    element.addEventListener('submit', function (e) {
        e.preventDefault()
        saveItem(e)
    })
});

function addToCart(data) {
    cartBtn.style.visibility = 'visible'
    let row = table.insertRow();
    for (key in data) {
        if (key === 'objId') continue
        if (key === 'prdPrice') total += data[key]
        let cell = row.insertCell();
        let text = document.createTextNode(data[key]);
        cell.appendChild(text);
    }
    let button = document.createElement('input');
    button.setAttribute('id', data.objId);
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn btn-small btn-link');
    button.setAttribute('value', 'Remove');
    button.setAttribute('style', 'font-size: 75%;');
    button.setAttribute('onclick', `deleteItem(this.id)`);
    let cell = row.insertCell();
    cell.appendChild(button);
}

function clearCart() {
    return new Promise((resolve, reject) => {
        return getItems().then((items) => {
            let promises = []
            let promises2 = []
            items.forEach(item => {
                total += item.pPrice
                promises.push(deleteItem(item._id))
                promises2.push(updateProducts(item))
            })
            Promise.all(promises).then(() => {
                setTimeout(() => {
                    resolve(
                        Promise.all(promises2)
                    )
                }, 3000)
            })

        })
    })
}

function checkStock() {
    return new Promise((resolve, reject) => {
        return getItems().then((items) => {
            let promises = []
            items.forEach(item => {
                promises.push(checkProducts(item))
            })
            setTimeout(() => {
                resolve(
                    Promise.all(promises)
                )
            }, 3000)
        })
    })
}

function checkProducts(item) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', (e) => {
            if (e.target.readyState === 4 && e.target.status === 200) {
                const data = JSON.parse(e.target.responseText)
                if (data[0].pQty > item.pQty) resolve()
                else {
                    alert('Quantitiy/Product Out of Stock')
                    reject()
                }

            } else if (e.target.readyState === 4) {
                console.log('An error has taken place')
            }
        })
        xhr.open("GET", `http://localhost:3000/store/${item.pId}`);
        xhr.send();
    })
}

function updateProducts(item) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', (e) => {
            if (e.target.readyState === 4 && e.target.status === 200) {
                const data = JSON.parse(e.target.responseText)
                cp = data.price * item.pQty;
                // console.log(data)
                if (data.message === 'failed') reject()
                else resolve(cp)
            } else if (e.target.readyState === 4 || e.target.status === 404) {
                console.log('An error has taken place')
            }
        })
        xhr.open("GET", `http://localhost:3000/store/${item.pId}/${item.pQty}`);
        xhr.send();
    })
}

function makePayment(formData) {
    // console.log(formData);

    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', (e) => {
            if (e.target.readyState === 4 && e.target.status === 200) {
                const data = JSON.parse(e.target.responseText)
                // console.log(data)
                if (data.message === 'failed') {
                    alert(`There was an Error: Payment Failed, Please check PIN and Balance`)
                    reject()
                }
                else {
                    setTimeout(() => {
                        resolve()
                    }, 3000)
                }
            } else if (e.target.readyState === 4 || e.target.status === 404) {
                console.log('An error has taken place')
            }
        })
        xhr.open("GET", `http://localhost:3000/account/${formData.acFrom}/${formData.acTo}/${formData.acPin}/${formData.amt}`);
        xhr.send();
    })
}

$('#exampleModalCenter').on('shown.bs.modal', function () {
    $("#progressDiv").hide()
    $('#acPin').trigger('focus')
    $('#acPin').prop('required', true);
    $('#amt').val(total)
})
$('#paymentForm').submit((e) => {
    e.preventDefault()
    $("#progressDiv").show()
    let formData = {
        'acFrom': e.target.elements.acFrom.value,
        'acTo': e.target.elements.acTo.value,
        'amt': total,
        'acPin': e.target.elements.acPin.value,
        'txnRef': Math.floor(Math.random() * 10000) * 9999
    }
    $('#progBar').text('Stock Check')
    $('#progBar').css('width', 20 + '%').attr('aria-valuenow', 20);
    console.log('Check Stock');
    checkStock()
        .then(() => {
            $('#progBar').text('User Payment')
            $('#progBar').css('width', 40 + '%').attr('aria-valuenow', 40);
            console.log('User Payment: ', formData)
            makePayment(formData)
                .then(() => {
                    $('#progBar').text('Placing Order')
                    $('#progBar').css('width', 60 + '%').attr('aria-valuenow', 60);
                    console.log('clear Cart and Update stock');
                    clearCart()
                        .then((cpList) => {
                            console.log('Cp: ', cpList);
                            cp = cpList.reduce((total, num) => total + num)
                            console.log('Cp: ', cp);

                            let formData2 = {
                                'acFrom': '112200',
                                'acTo': '113300',
                                'amt': cp,
                                'acPin': '12345',
                                'txnRef': Math.floor(Math.random() * 10000) * 9999
                            }
                            cp = 0;
                            $('#progBar').text('Confirming Order')
                            $('#progBar').css('width', 80 + '%').attr('aria-valuenow', 80);
                            console.log('mySales Payment: ', formData2)
                            // makePayment(formData2)
                            $('#progBar').text('Shipping')
                            $('#progBar').css('width', 100 + '%').attr('aria-valuenow', 100);
                            setTimeout(() => {
                                $("#exampleModalCenter .close").click()
                            }, 3000)
                        })
                })
        }).catch((e) => {
            console.log('Error');
            $("#exampleModalCenter .close").click()
        })
})