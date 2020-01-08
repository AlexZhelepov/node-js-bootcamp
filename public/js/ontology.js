$(document).ready(() => {
    $('#btn-add-class').on('click', (e) => {
        e.preventDefault()

        // Добавляем новые элементы таблицы.
        const html = '<tr><td><input class="form-control class" type="text"></td><td><textarea class="form-control terms" placeholder="Ввод терминов осуществлять через ,"></textarea></td></tr>'
        $('#subject-body').append(html)
    })

    $('#btn-save-all').on('click', (e) => {
        e.preventDefault()

        // Собираем данные для отправки на сервер.
        $classes = $('.class')
        $terms = $('.terms')

        let data = []
        $classes.each((i, v) => {
            data.push({
                class: $(v).val(),
                terms: $terms.eq(i).val()
            })
        })

        $('.preloader').show()

        // Выполнение процедуры подбора команды проекта.
        fetch('/ontology', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }).then((res) => {
            console.log('Ok!')
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            $('.preloader').hide()
        })
    })
})