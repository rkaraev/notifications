// Вызываем общую функцию для обновления. В JS можно вызвать функцию до объявления благодаря особенности языка.
update()

// Навешиваем обработчик события click на кнопку добавления уведомлений.
document.querySelector('.notification__form button').addEventListener('click', () => {
    // Создаем переменную для времени уведомления.
    let time = document.querySelector('.notification__form input').value;
    // Создаем переменную для сообщения уведомления.
    let message = document.querySelector('.notification__form textarea').value;
    // Создаем переменную для элемента с информ сообщениями.
    let info = document.querySelector('.notification__info');

    // Проверяем, что заполнены обе переменные: время, сообщение. Если хоть одна из них пустая, то добавляем сообщение в info и выводим/скрываем его с зажержкой меняя прозрачность, а функция при этом завершается т.к. натыкается на пустой return т.е. ничего не вернет.
    if (!time || !message) {
        info.textContent = 'Укажите время и сообщение!';
        info.style.opacity = 1;
        setTimeout(() => {
            info.style.opacity = 0;
        }, 2000)
        setTimeout(() => {
            info.textContent = '';
        }, 3000)
        return
    }

    // Если же обе переменные: time, message - заполнены, то добавляем эти данные в локальное хранилище с помощью метода setItem(key, value).
    localStorage.setItem(time, message);
    // Вызываем общую функцию для обновления.
    update()
})

// Навешиваем обработчик события click на кнопку очистки уведомлений.
document.querySelector('.notification__list > button').addEventListener('click', () => {
    // Если локальное хранилище пустое - функция прерывается и выводится уведомление.
    if (!localStorage.length) {
        alert('Уведомлений нет!');
        return;
    }
    // Если confirm возвращает false т.е. пользователь нажимает "отмена" - функция прерывается.
    if (!confirm('Очистить список уведомлений?')) {
        return;
    }
    // В остальных случаях локальное хранилище очищается.
    localStorage.clear();
    // Вызываем общую функцию для обновления.
    update()
    // Элемент со списком уведомлений скрывается за ненадобностью.
    document.querySelector('.notification__list').hidden = true;
})

// Функция для сортировки времени Object.keys(localStorage).
function sortTime(time1, time2) {
    let [time1Hs, time1Ms] = time1.split(':').map(Number);
    let [time2Hs, time2Ms] = time2.split(':').map(Number);

    if (time1Hs != time2Hs) {
        return time1Hs - time2Hs;
    } else {
        return time1Ms - time2Ms;
    }
}

// Создаем общую функцию для обновлений приложения.
function update() {
    // Если локальное хранилище пустое.
    if (!localStorage.length) {
        // Скрываем элемент со списком уведомлений.
        document.querySelector('.notification__list').hidden = true;
    } else {
        // В противном случае - открываем его.
        document.querySelector('.notification__list').hidden = false;
    }

    // Переопределяем содержимое контейнера с уведомлениями и выставляем пустую строку.
    document.querySelector('.notification__list > div').innerHTML = '';
    // Переопределяем текст контейнера с уведомлениями и выставляем пустую строку.
    document.querySelector('.notification__info').textContent = '';

    // В цикле проходим по всем ключам локального хранилища с применением функции сортировки т.е. уведомления будут выстраиваться по времени.
    for (let key of Object.keys(localStorage).sort(sortTime)) {
        // Через метод insertAdjacentHTML добавляем в контейнер с уведомлениями дочерние <div> с кодом уведомлений.
        document.querySelector('.notification__list > div').insertAdjacentHTML('beforeend', 
        `<div class="notification__item">
            <div>${key} - ${localStorage.getItem(key)}</div>
            <button data-time="${key}">&times;</button>
        </div>`
        )
    }

    // При обновлении очищаем элементы input и textarea, в которых вводится время и текст уведомления.
    document.querySelector('.notification__form input').value = '';
    document.querySelector('.notification__form textarea').value = '';

    // Если есть элемент с классом audioAlert, то удаляем его (это наше звуковое уведомление).
    if (document.querySelector('.audioAlert')) {
        document.querySelector('.audioAlert').remove();
    }
}

// Навешиваем обработчик событий для всего элемента notification__list и с помощью делегирования будем ловить событие click именно с нужных элементов.
document.querySelector('.notification__list').addEventListener('click', (event) => {
    // Если элемент в событии не содержит dataset.time т.е. у него нет (data-time=""), то прерываем функцию.
    if (!event.target.dataset.time) {
        return;
    }
    // В противном случае мы имеем дело с нужным элементом т.е. button-крестик для удаления каждого уведомления. Методом removeItem удаляем эту запись из локального хранилища по ключу, которые берем из (data-time="").
    localStorage.removeItem(event.target.dataset.time);
    // Вызываем общую функцию для обновления.
    update()
})

// Создаем функцию, которая с помощью setInterval будет срабатывать каждую секунду и сверять текущее время с временем уведомлений.
setInterval(() => {

    // Заводим переменную текущего времени.
    let currentDate = new Date();

    // Вытаскиваем из текущего времени в отдельную переменную часы и при необходимости добавлям вначале числа 0 т.е: 06:29, 07:12 и т.д.
    let currentHour = currentDate.getHours();
    if (currentHour < 10) {
        currentHour = '0' + currentHour;
    }

    // Та же логика, что и с часами выше.
    let currentMinute = currentDate.getMinutes();
    if (currentMinute < 10) {
        currentMinute = '0' + currentMinute;
    }

    // Создаем отдельно переменную, в которой будет значение времени в таком же формате, что и ключи у записей локального хранилища.
    let currentTime = `${currentHour}:${currentMinute}`;

    // В цикле for снова перебираем все записи хранилища.
    for (let key of Object.keys(localStorage)) {
        // С помощью split и индексов получаем отдельно часы и минуты.
        let keyHour = key.split(':')[0];
        let keyMinute = key.split(':')[1];

        // Условие для сверки времени.
        if (key == currentTime || (keyHour == currentHour && keyMinute < currentMinute)) {

            // Здесь добавляем элементу уведомления класс warning, чтобы сработавшее уведомление имело другой стиль.
            document.querySelector(`button[data-time="${key}"]`).closest('.notification__item').classList.add('notification__warning');

            // Дальше остается добавить звуковой сигнал.
            if (!document.querySelector('.audioAlert')) {

                // Добавляем html элемент звукового уведомления и проигрываем его с помощью метода play().
                document.querySelector('body').insertAdjacentHTML('afterbegin', '<audio loop class="audioAlert"><source src="../source/alert.mp3" type="audio/mpeg"></audio>');
                document.querySelector('.audioAlert').play();
            }
        }
    }
}, 1000)