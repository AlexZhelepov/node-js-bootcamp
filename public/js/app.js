/*form-save file*/
$(document).ready(() => {
    // save document.
    $('#btn-save-doc').on('click', (e) => {
        e.preventDefault()
        
        const file_input = document.getElementById('file-uploader')

        if (!file_input.files[0]) {
            return alert('Пожалуйста загрузите файл!')
        }

        let data = new FormData()
        data.append('file', file_input.files[0])

        fetch('/doc/load', {
            method: 'POST',
            body: data,
        }).then((res) => {
            if (res.status === 200) {
                alert('Файл был сохранен!')
            }
        }).catch((err) => {
            alert('При загрузке файла произошла ошибка!')
        })
    })
})


/* === login === */
/* sign-in */
/*$('#btn-sign-in').on('click', (e) => {
    e.preventDefault()
    
    email = $('#in-email').val()
    password = $('#in-pass').val()

    // request-params.
    params = {
        email,
        password
    }
    
    $.ajax({
        url: '/users/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(params),
        success: (res) => {
            localStorage.setItem('tm-token', res.token)
        },
        error: (res) => {
            errorData = JSON.parse(res.responseText)
            console.log(errorData)
        } 
    })
})*/
/* sign-up */



