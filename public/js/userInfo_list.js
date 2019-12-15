$(document).ready(() => {
    // Удаление строк из таблиц.
    $('.rm-btn').on('click', (e) => {
        e.preventDefault()
        $(e.target).parent().parent().remove()
    })

    // Кнопка "Сохранить"
    $('#save-users-btn').on('click', (e) => {
        $('.preloader').show()

        // Подготовка данных.
        $rows = $('.row-user')

        data = []

        for (let i = 0; i < $rows.length; i++) {
            const id = $rows.eq(i).data('id')
            
            // retrieve subjects.
            $keysSubjects = $('#tb-subjects-' + id + ' input[type="text"]')
            $valuesSubjects = $('#tb-subjects-' + id + ' input[type="range"]')
            
            subjects = []

            $keysSubjects.each((i, v) => {
                subjects.push({
                    name: $(v).val(),
                    value: $valuesSubjects.eq(i).val()
                })
            })

            // retrieve skills.
            $keysSkills = $('#tb-skills-' + id + ' input[type="text"]')
            $valuesSkills = $('#tb-skills-' + id + ' input[type="range"]')

            skills = []

            $keysSkills.each((i, v) => {
                skills.push({
                    name: $(v).val(),
                    value: $valuesSkills.eq(i).val()
                })
            })

            data.push({
                id, skills, subjects
            })
        }

        // Выполнение процедуры сохранения данных.
        fetch('/userInfo/list', {
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
            }, 3000)
        })
    })
})