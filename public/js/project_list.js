$(document).ready(() => {
    $('.btn-add-vac').on('click', (e) => {
        const html = document.querySelector('#vac-template').outerHTML
        $(e.target).parent().parent().parent().prepend(html)

        // Так плохо делать!
        $('.btn-vac-delete').on('click', (e) => {
            $(e.target).parent().parent().remove()
        })
    })

    $('.btn-vac-delete').on('click', (e) => {
        $(e.target).parent().parent().remove()
    })
    
    // Создание нового проекта.
    $('#btn-add-new-project').on('click', (e) => {
        e.preventDefault()

        // Выделение данных.
        const name = $('#prj-name').val()
        const desc = $('#prj-desc').val()

        const vacs = []

        const $vacNames = $('#vac-template .vac-name')
        const $vacVals = $('#vac-template .vac-value')

        $vacNames.each((i, v) => {
            vacs.push({
                name: $(v).val(),
                value: $vacVals.eq(i).val()
            })
        })

        data = {
            name: name, 
            description: desc,
            vacancies: vacs
        }

        fetch('/projects/add', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json'}
        }).then((res) => {
            $('.alert-success').show()
        }).catch((err) => {
            $('.alert-danger').show()
        }).finally(() => {
            $('.preloader').hide()
            setTimeout(() => {
                location.reload() // тупо релоадим, чтобы обновить страницу.
            }, 1000)
        })
    })

    // Сохранение существующего проекта.
    $('.btn-save-project').on('click', (e) => {
        const id = $(e.target).data('id')

        // Выделение данных.
        const name = $('#prj-name-' + id).val()
        const desc = $('#prj-desc-' + id).val()

        const vacs = []

        const $vacNames = $('#vacancies-group-' + id + ' .vac-name')
        const $vacVals = $('#vacancies-group-' + id + ' .vac-value')

        $vacNames.each((i, v) => {
            vacs.push({
                name: $(v).val(),
                value: $vacVals.eq(i).val()
            })
        })

        data = {
            id: id,
            name: name, 
            description: desc,
            vacancies: vacs
        }

        fetch('/projects/update', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json'}
        }).then((res) => {
            $('.alert-success').show()
        }).catch((err) => {
            $('.alert-danger').show()
        }).finally(() => {
            $('.preloader').hide()
            setTimeout(() => {
                $('.alert-success').hide()
                $('.alert-danger').hide()
            }, 1000)
        })
    })
})