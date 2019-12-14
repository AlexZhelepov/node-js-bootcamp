const cls = { 'management': 'badge-primary', 'skills': 'badge-warning', 'subject': 'badge-success' }

$(document).ready(() => {
    saveFirstPhase()
    saveSecondPhase()

    const words = JSON.parse($('#input-words').val())
    const subjects = JSON.parse($('#input-subjects').val())
    const skills = JSON.parse($('#input-skills').val())
    const orderedWords = JSON.parse($('#input-ordered-words').val())

    selectSubjects($('#doc-box'), subjects, words, cls['subject'])
    findSkills($('#doc-box'), skills, words, cls['skills'], orderedWords)
    findExecutive($('#doc-box'), cls['management'])

    // При клике на теги-элементы удаляем их и удаляем их выделение в тексте.
    $('#recog-result .badge').on('click', (e) => {
        clearBadges(e, words)
    })

    // Контекстное меню.
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

    // Меню-выбор контекстного меню.
    $('#context-menu a').on('click', function(e) {
        e.preventDefault()

        const selection = getSelectedText()
        // Если что-то выделено, то вызываем контекстное меню.
        if (selection) {
            const action = $(this).attr('data-type')
            let match = searchWord(selection, words)

            match = match || selection // если выделенное – фраза, то сохраняем как есть.

            switch (action) {
                case 'management': {
                    addNewBadge($('#employees'), cls.management, match, words)
                    underscoreWords($('#doc-box'), cls.management, match)
                    break
                }
                case 'skill': {
                    addNewBadge($('#skills'), cls.skills, match, words)
                    underscoreWords($('#doc-box'), cls.skills, match)
                    break
                }
                case 'subject': {
                    addNewBadge($('#subjects'), cls.subject, match, words)
                    underscoreWords($('#doc-box'), cls.subject, match)
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

// Находит все слова в тексте, которые соответствуют выделенному фрагменту (включая различные их вариации).
const searchWord = (selection, words) => {
    for (word in words) {
        if (words[word].includes(selection) || word === selection) {
            return { 
                norm: word, 
                variants: words[word]
            }
        }
    }
    return undefined
}

// Добавление отметки.
const addNewBadge = (where, cls, match, words) => {
    let toAdd = match
    if (match.variants) {
        toAdd = match.norm
    }

    $(where).append(
        '<a href="#" class="badge ' + cls + '"' + '>' + toAdd + '</a>'
    )

    // Вешаем ивент на новые элементы.
    $(where).children().on('click', (e) => {
        clearBadges(e, words)
    })
}

// Удаление отметок.
const clearBadges = (e, words) => {
    const cls = $(e.target).attr('class')
    const txt = $(e.target).text()
    removeUnderscore($('#doc-box'), cls, txt, words)
    $(e.target).remove()
}

// Выделение слов в тексте документа.
const underscoreWords = (where, cls, match) => {
    let text = $(where).html()

    // Проверяем нашли ли несколько слов?
    if (match.variants) {
        // Distinct array.
        match.variants = Array.from(new Set(match.variants))

        for (let i = 0; i < match.variants.length; i++) {
            const span = '<span class="badge ' + cls + '">' + match.variants[i] + '</span>'
            text = text.replaceAll(match.variants[i], span)
        }
    }
    else {
        const span = '<span class="badge ' + cls + '">' + match + '</span>'
        text = text.replaceAll(match, span)
    }
    
    $(where).html(text)
}

// Удаление выделения слов в тексте.
const removeUnderscore = (where, cls, txt, words) => {
    let text = $(where).html()
    
    // 1. Проверяем, есть ли среди слов выбранный нами текст. Если нет, то берем текст.
    const match = searchWord(txt, words) || txt

    // 2. Находим все вхождения данного текста в html-документе.
    if (match.variants) {
        for (let i = 0; i < match.variants.length; i++) {
            const span = '<span class="'+ cls +'">' + match.variants[i] + '</span>'
            text = text.replaceAll(span, match.variants[i])
        }
    }
    else {
        const span = '<span class="' + cls +'">' + match + '</span>'
        text = text.replaceAll(span, match)
    }

    $(where).html(text)
}

// Поиск и выделение предметных областей.
const selectSubjects = (where, subjects, words, cls) => {
    let foundSubjects = []

    // 1. Поиск предметных областей.
    for (let i = 0; i < subjects.length; i++) {
        for (word in words) {
            if (word === subjects[i].name) {
                foundSubjects.push(word)
            }
        }
    }

    // 2. Выделение и заполнение предметных областей.
    for (word in words) {
        if (foundSubjects.includes(word)) {
            underscoreWords($(where), cls, {
                norm: word,
                variants: words[word]
            })
            addNewBadge($('#subjects'), cls, {
                norm: word,
                variants: words[word]
            })
        }
    }
}

const findSkills = (where, skills, words, cls, orderedWords) => {
    let foundSkills = []

    // orderedWords
    // { raw: '', norm: '' }

    // 1. Поиск компетенций и сращение компетенций.
    for (let i = 0; i < orderedWords.length; i++) {
        const w = orderedWords[i]
        let skill = undefined
        for (let j = 0; j < skills.length; j++) {
            if (skills[j].name === w.norm) {
                skill = skills[j]
                break
            }
        }

        if (skill) {
            const frwd = skill.foreword
            
            if (frwd != 0) {
                // Верхняя граница.
                if (i === 0 && frwd < 0) {
                    foundSkills.push(w.norm)   
                    continue
                }

                // Нижняя граница.
                if (i === orderedWords.length - 1 && frwd > 0) {
                    foundSkills.push(w.norm)   
                    continue
                }

                // Внутренний текст.
                if (frwd === -1) {
                    foundSkills.push(orderedWords[i - 1].raw + ' ' + orderedWords[i].raw)
                } else if (frwd === 1) {
                    foundSkills.push(orderedWords[i].raw + ' ' + orderedWords[i + 1].raw)
                }
            }
            else {
                foundSkills.push(w.norm)   
            }
        }
    }

    // Distinct.
    foundSkills = Array.from(new Set(foundSkills))

    // 2. Выделение компетенций в тексте.
    for (let i = 0; i < foundSkills.length; i++) {
        const skill = foundSkills[0].split(' ')

        // Ищем комбинацию слов "окном".
        if (skill.length > 1) {
            const shift = skill.length
            for (let j = 0; j < orderedWords.length; j++) {
                let str = orderedWords[j].raw
                for (let n = 1; n < shift; n++) {
                    if (j + n < orderedWords.length) {
                        str += ' ' + orderedWords[j + n].raw
                    }
                }
                str = str.trim()

                // Комбинация найдена!
                if (str === foundSkills[i]) {
                    underscoreWords($(where), cls, {
                        norm: str,
                        variants: [str]
                    })
                    addNewBadge($('#skills'), cls, {
                        norm: str,
                        variants: [str]
                    })
                    break
                }
            }
        } else {
            for (let j = 0; j < orderedWords.length; j++) {
                if (skill[0] == orderedWords[j].norm) {
                    // Комбинация найдена!
                    if (str === foundSkills[i]) {
                        underscoreWords($(where), cls, {
                            norm: skill[0],
                            variants: [skill[0]]
                        })
                        addNewBadge($('#skills'), cls, {
                            norm: skill[0],
                            variants: [skill[0]]
                        })
                        break
                    }
                }
            }
        }
    }
}

// Поиск человека, который отвечает за исполнение поручения.
const findExecutive = (where, cls) => {
    $rows = $(where).find('table tr')
    if ($rows && $rows.length >= 5) {
        const text = $rows.eq(5).text()
        const employees = text.match(/[А-я]*\s[А-я]\.[А-я]\./) // так делать плохо!

        for (let i = 0; i < employees.length; i++) {
            const str = employees[i]

            underscoreWords($(where), cls, str)
            addNewBadge($('#employees'), cls, {
                norm: str,
                variants: [str]
            })
        }
    }
}

// Заменить все строки на указанные подстроки в тексте.
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement); // регулярка не совсем хорошо работает с кириллицей.
};

const saveFirstPhase = () => {
    $('#btn-save-user-info').on('click', (e) => {
        $('.preloader').show()
        e.preventDefault()
        
        // Форма.
        const $form = $('#form-user-info')
        const action = $form.attr('action')

        // Готовим данные.
        const data = prepareData()
        const toSend = {
            firstPhase: true,
            data
        }

        // Фаза 1. Проверяем, а есть ли такие пользователи уже?
        fetch(action, {
            method: 'POST',
            body: JSON.stringify(toSend),
            headers: { 'Content-Type': 'application/json' }
        }).then((res) => {
            return res.json()
        }).then((data) => {
            // Генерация контента в таблице в модальном окне.
            if (data.doubledUsers.length > 0) {
                let html = ''
                for (let i = 0; i < data.doubledUsers.length; i++) {
                    html += ('<tr class="row-to-update">' + 
                        '<td>' + '<span class="nm badge badge-primary">' + data.doubledUsers[i] + '</span>'+ '</td>' +
                        '<td>' + generateList(toSend.data.subjects, 'sbj badge badge-success') + '</td>' +
                        '<td>' + generateList(toSend.data.skills, 'skl badge badge-warning') + '</td>' +
                        '<td>' + '<input class="updt" type="checkbox">' + '</td>' +
                    '</tr>')
                }

                $('#tbody-update-users').html(html)
                $('#div-update-users').removeAttr('hidden')
            }

            if (data.newUsers.length > 0) {
                let html = ''
                for (let i = 0; i < data.newUsers.length; i++) {
                    html += ('<tr class="row-to-create">' + 
                        '<td>' + '<span class="nm badge badge-primary">' + data.newUsers[i] + '</span>'+ '</td>' +
                        '<td>' + generateList(toSend.data.subjects, 'sbj badge badge-success') + '</td>' +
                        '<td>' + generateList(toSend.data.skills, 'skl badge badge-warning') + '</td>' +
                    '</tr>')
                }

                $('#tbody-new-users').html(html)
                $('#div-new-users').removeAttr('hidden')
            }
            
            $('.preloader').hide()
            $('#modalSaveUserInfo').modal('show')
        }).catch((err) => {
            console.log(err)
        })
    })
}

// Подготовка данных для их будущего сохранения.
const prepareData = () => {
    let employees = []
    let subjects = []
    let skills = []

    $employees = $('#employees a')
    for (let i = 0; i < $employees.length; i++) {
        employees.push($employees.eq(i).text())        
    }

    $skills = $('#skills a')
    for (let i = 0; i < $skills.length; i++) {
        skills.push($skills.eq(i).text())        
    }

    $subjects = $('#subjects a')
    for (let i = 0; i < $subjects.length; i++) {
        subjects.push($subjects.eq(i).text())        
    }

    data = {
        skills, subjects, employees
    }

    return data
}

// Генерация списка для модульного окна. 
const generateList = (data, cls) => {
    let html = ''
    for (let i = 0; i < data.length; i++) {
        html += '<span class="' + cls +'">' + data[i] + '</span>'
    }
    return html
}

// Фаза 2. Отправляем пользовательские данные и сохраняем их.
const saveSecondPhase = () => {
    $('#save-second-phase').on('click', (e) => {
        e.preventDefault()
        $('.preloader').show()

        // Для добавления.
        $toCreate = $('.row-to-create')
        let toAdd = []

        for (let i = 0; i < $toCreate.length; i++) {
            let subjects = []
            let skills = []
            let name = ''

            $toCreate.eq(i).find('.sbj').each((i, v) => {
                subjects.push({ name: v.innerText.toLowerCase() })
            })

            $toCreate.eq(i).find('.skl').each((i, v) => {
                skills.push({ name: v.innerText.toLowerCase() })
            })

            $toCreate.eq(i).find('.nm').each((i, v) => {
                name = v.innerText
            })

            toAdd.push({
                name, skills, subjects
            })
        }

        // Для пересохранения.
        $toUpdate = $('.row-to-update')
        let toUpdate = []

        for (let i = 0; i < $toUpdate.length; i++) {
            let subjects = []
            let skills = []
            let checked = false
            let name = ''

            $toUpdate.eq(i).find('.sbj').each((i, v) => {
                subjects.push({ name: v.innerText.toLowerCase() })
            })

            $toUpdate.eq(i).find('.skl').each((i, v) => {
                skills.push({ name: v.innerText.toLowerCase() })
            })

            $toUpdate.eq(i).find('.nm').each((i, v) => {
                name = v.innerText
            })

            $toUpdate.eq(i).find('.updt').each((i, v) => {
                checked = v.checked
            })

            toUpdate.push({
                name, skills, subjects, checked
            })
        }

        const toSend = {
            secondPhase: true,
            toAdd, toUpdate
        }

        // Форма.
        const $form = $('#form-user-info')
        const action = $form.attr('action')

        fetch(action, {
            method: 'POST',
            body: JSON.stringify(toSend),
            headers: { 'Content-Type': 'application/json' }
        }).then((res) => {
            console.log('Ok!')
        }).catch((err) => {
            console.log(err)
        }).finally(() => {
            $('#modalSaveUserInfo').modal('hide')
            $('.preloader').hide()
        })
    })    
}