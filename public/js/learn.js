$(document).ready(() => {
    $('#btn-save-all').on('click', (e) => {
        e.preventDefault()

        $terms = $('.term')
        $classes = $('.class-name')

        let data = []
        $terms.each((i, v) => {
            data.push({
                term: $(v).text().trim(),
                className: $classes.eq(i).val()
            })
        })

        $('.preloader').show()

        // Выполнение процедуры подбора команды проекта.
        fetch('/learn', {
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