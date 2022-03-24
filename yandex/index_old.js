ymaps.ready(init);

function init() {
    const apiKey = "473cef25-daab-4424-b636-ea91fd45eac7";

    var geolocation = ymaps.geolocation,
        myMap = new ymaps.Map('map', {
            center: [55.75399400, 37.62209300],
            zoom: 10,
            controls: ['geolocationControl']
        }, {
            searchControlProvider: 'yandex#search'
        });

    // Сравним положение, вычисленное по ip пользователя и
    // положение, вычисленное средствами браузера.
    geolocation.get({
        provider: 'yandex',
        mapStateAutoApply: true
    }).then(function(result) {
        console.log('ip result ->', result.geoObjects.position);

        const [long, lat] = result.geoObjects.position;

        geocode(long, lat);

        axios.get(`https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=${lat},${long}&results=1`).then(res => {
            console.log('axios: ', res.data.response);

            document.getElementById('ip').innerHTML = JSON.stringify(res.data);
        })

        // Красным цветом пометим положение, вычисленное через ip.
        result.geoObjects.options.set('preset', 'islands#redCircleIcon');
        result.geoObjects.get(0).properties.set({
            balloonContentBody: 'Мое местоположение по IP'
        });

        myMap.geoObjects.add(result.geoObjects);
    });

    geolocation.get({
        provider: 'browser',
        mapStateAutoApply: true
    }).then(function(result) {
        console.log('browser result ->', result);

        const [long, lat] = result.geoObjects.position;

        geocode(long, lat);

        axios.get(`https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=${lat},${long}&results=1`).then(res => {
            console.log('axios: ', res.data.response);

            document.getElementById('browser').innerHTML = JSON.stringify(res.data);
        })

        // Синим цветом пометим положение, полученное через браузер.
        // Если браузер не поддерживает эту функциональность, метка не будет добавлена на карту.
        result.geoObjects.options.set('preset', 'islands#blueCircleIcon');
        result.geoObjects.get(0).properties.set({
            balloonContentBody: 'Мое местоположение из браузера'
        });

        myMap.geoObjects.add(result.geoObjects);
    });

    const geocode = (long, lat) => {
        // Поиск по координатам.
        ymaps.geocode(`${long},${lat}`, {
            /**
             * Опции запроса
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/geocode.xml
             */
            // Сортировка результатов от центра окна карты.
            // boundedBy: myMap.getBounds(),
            // strictBounds: true,
            // Вместе с опцией boundedBy будет искать строго внутри области, указанной в boundedBy.
            // Если нужен только один результат, экономим трафик пользователей.
            results: 1
        }).then(function(res) {
            // Выбираем первый результат геокодирования.
            const firstGeoObject = res.geoObjects.get(0);
            // Координаты геообъекта.
            const coords = firstGeoObject.geometry.getCoordinates();
            // Область видимости геообъекта.
            const bounds = firstGeoObject.properties.get('boundedBy');

            // Задаем изображение для иконок меток.
            firstGeoObject.options.set('preset', 'islands#darkBlueDotIconWithCaption');

            // Получаем строку с адресом и выводим в иконке геообъекта.
            firstGeoObject.properties.set('iconCaption', firstGeoObject.getAddressLine());

            // Добавляем первый найденный геообъект на карту.
            myMap.geoObjects.add(firstGeoObject);

            // Масштабируем карту на область видимости геообъекта.
            myMap.setBounds(bounds, {
                // Проверяем наличие тайлов на данном масштабе.
                checkZoomRange: true
            });

            /**
             * Все данные в виде javascript-объекта.
             */
            console.log('Все данные геообъекта: ', firstGeoObject.properties.getAll());

            /**
             * Метаданные запроса и ответа геокодера.
             * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderResponseMetaData.xml
             */
            console.log('Метаданные ответа геокодера: ', res.metaData);

            /**
             * Метаданные геокодера, возвращаемые для найденного объекта.
             * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/GeocoderMetaData.xml
             */
            console.log('Метаданные геокодера: ', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData'));

            /**
             * Точность ответа (precision) возвращается только для домов.
             * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/precision.xml
             */
            console.log('precision', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.precision'));

            /**
             * Тип найденного объекта (kind).
             * @see https://api.yandex.ru/maps/doc/geocoder/desc/reference/kind.xml
             */
            console.log('Тип геообъекта: %s', firstGeoObject.properties.get('metaDataProperty.GeocoderMetaData.kind'));
            console.log('Название объекта: %s', firstGeoObject.properties.get('name'));
            console.log('Описание объекта: %s', firstGeoObject.properties.get('description'));
            console.log('Полное описание объекта: %s', firstGeoObject.properties.get('text'));

            /**
             * Прямые методы для работы с результатами геокодирования.
             * @see https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeocodeResult-docpage/#getAddressLine
             */
            console.log('\nГосударство: %s', firstGeoObject.getCountry());
            console.log('Населенный пункт: %s', firstGeoObject.getLocalities().join(', '));
            console.log('Адрес объекта: %s', firstGeoObject.getAddressLine());
            console.log('Наименование здания: %s', firstGeoObject.getPremise() || '-');
            console.log('Номер здания: %s', firstGeoObject.getPremiseNumber() || '-');
        });
    }

}