$(document).ready(() => {
    const words = JSON.parse($('#input-words').val())

    // При клике на теги-элементы удаляем их и удаляем их выделение в тексте.
    $('#recog-result .badge').on('click', (e) => {
        clearBadges(e, words)
    })

    $('#doc-box').on('contextmenu', function(e) {
        const top = e.pageY - 10;
        const left = e.pageX - 10;
        $('#context-menu').css({
            display: 'block',
            top: top,
            left: left
        }).addClass('show');
        return false; //blocks default Webbrowser right click menu
    }).on('click', function() {
        $('#context-menu').removeClass('show').hide();
    });

    $('#context-menu a').on('click', function(e) {
        e.preventDefault()

        const selection = getSelectedText()
        // Если что-то выделено, то вызываем контекстное меню.
        if (selection) {
            const action = $(this).attr('data-type')
            let match = searchWord(selection, words)
            match = match ? match.norm : selection // если выделенное – фраза, то сохраняем как есть.

            const cls = { 'management': 'badge-primary', 'skills': 'badge-warning', 'subject': 'badge-success' }
            switch (action) {
                case 'management': {
                    inputNewBadge($('#employees'), cls.management, match, words)
                    underscoreWords($('#doc-box'), cls.management, selection)
                    break
                }
                case 'skill': {
                    inputNewBadge($('#skills'), cls.skills, match, words)
                    underscoreWords($('#doc-box'), cls.skills, selection)
                    break
                }
                case 'subject': {
                    inputNewBadge($('#subjects'), cls.subject, match, words)
                    underscoreWords($('#doc-box'), cls.subject, selection)
                    break
                }
                default: {
                    break
                }
            }
        }
        $(this).parent().removeClass('show').hide();
    });
})

const getSelectedText = () => {
    if (window.getSelection) {
        return window.getSelection().toString().trim();
    } else if (document.selection) {
        return document.selection.createRange().text.trim();
    }
    return '';
}

const searchWord = (selection, words) => {
    for(let i = 0; i < words.length; i++) {
        if (selection.toLowerCase() === words[i].raw.toLowerCase()) {
            return words[i]
        }
    }
    return undefined
}

const inputNewBadge = (where, cls, text, words) => {
    $(where).append(
        '<a href="#" class="badge ' + cls + '"' + '>' + text + '</a>'
    )

    // Вешаем ивент на новые элементы.
    $(where).children().on('click', (e) => {
        clearBadges(e, words)
    })
}

const clearBadges = (e, words) => {
    let cls = $(e.target).attr('class')
    let txt = $(e.target).text()
    removeUnderscore($('#doc-box'), cls, txt, words)
    $(e.target).remove()
}

const underscoreWords = (where, cls, selection) => {
    let text = $(where).html()
    const span = '<span class="badge ' + cls + '">' + selection + '</span>'
    $(where).html(text.replace(selection, span))
}

const removeUnderscore = (where, cls, seek_text, words) => {
    const id_class = cls.split(' ')
                        .filter((v) => v.includes('-'))[0]
    
    // 1. Проверяем, есть ли среди слов выбранный нами текст.
    const match = searchWord(seek_text, words)
    let rm = []
    if (match) {
        rm.push(match.norm)
        rm.push(match.raw)
    }
    rm.push(seek_text)

    // 2. Находим все вхождения данного текста в html-документе.
    $found = $(where).find('.' + id_class)
    for(let i = 0; i < $found.length; i++) {
        console.log($found[i])
    }
}