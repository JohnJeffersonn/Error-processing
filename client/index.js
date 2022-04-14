const appContainer = document.querySelector('.appContainer'),
    errContainer = document.querySelector('.errContainer');
let connectionAttempts = 0;

function showError(mess) {
    const errBlock = document.createElement('div');
    errBlock.classList.add('mess');
    errBlock.textContent = mess;
    errContainer.append(errBlock);
    setTimeout(_ => errBlock.remove(), 3000);
}

function emptyList() {
    const errorTitle = document.createElement('h2');
    errorTitle.classList.add('text-center');
    errorTitle.textContent = 'Список товаров пуст';
    appContainer.after(errorTitle);
}
async function getData(url) {
    let request = await fetch(url);
    if (request.status === 500 && connectionAttempts < 2) {
        connectionAttempts++;
        return getData(url);
    }
    if (request.status === 500 && connectionAttempts === 2) {
        throw new Error('К сожалению, сервер недоступен. Попробуйте обновить страницу позже.');
    }
    let data = await request.json();
    if (request.status === 404 && data.products.length === 0) {
        let error = new Error();
        error.status = 404;
        throw error;
    }
    connectionAttempts = 0;
    return data;
}

function cardList(title, img, price) {
    const cardContainer = document.createElement('div');
    const infImg = document.createElement('img');
    const cardBody = document.createElement('div');
    const cardTitle = document.createElement('h5');
    const cardPrice = document.createElement('p');


    cardContainer.classList.add('card', 'mb-5');
    infImg.classList.add('card-img-top');
    cardBody.classList.add('card-body');
    cardTitle.classList.add('card-title');
    cardPrice.classList.add('card-text');


    cardContainer.setAttribute('style', 'width:18rem');
    infImg.setAttribute('src', img);
    infImg.setAttribute('alt', title);


    cardTitle.textContent = title;
    cardPrice.textContent = `Price ${price} rub`

    cardContainer.append(infImg)
    cardContainer.append(cardBody)

    cardBody.append(cardTitle, cardPrice)

    appContainer.append(cardContainer)
}
async function createItem() {
    try {
        let response = await getData('/api/products');
        for (const good of response.products) {
            cardList(good.name, good.image, good.price)
        }
    } catch (error) {
        if (error.name === 'SyntaxError') {
            showError('Получена информация в неправильном формате. Попробуйте обновить страницу позже');
        } else if (error.status === 404) {
            emptyList();
        } else {
            showError(error.message);
        }
    }

}
window.navigator.onLine ? createItem() : showError('Сеть не найдена. Проверьте подключение к интернету.')
