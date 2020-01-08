$(document).ready(() => {
    const id = $('#project-id').val()

    $('#btn-form-team').on('click', (e) => {
        e.preventDefault()
        const settings = readGeneticSettings()

        $('.preloader').show()

        // Выполнение процедуры подбора команды проекта.
        fetch('/projects/form/' + id, {
            method: 'POST',
            body: JSON.stringify(settings),
            headers: { 'Content-Type': 'application/json' }
        }).then((res) => {
            console.log('Ok!')
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            $('.preloader').hide()
            location.reload()
        })
    })
})

const readGeneticSettings = () => {
    const teamCount = $('#team-count').val()
    const mutCount = $('#mut-count').val()
    const eliteCount = $('#elite-count').val()
    const epochCount = $('#epoch-count').val()

    return {
        teamCount, mutCount, eliteCount, epochCount
    }
}