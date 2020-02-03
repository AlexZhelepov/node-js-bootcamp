// Формирование команд первого поколения.
const initializeTeams = (employees, number, project, rand) => {
    let teams = []
    
    if (project.vacancies.length > employees.length) {
        return {
            code: -1,
            msg: 'Недостаточно людей на проект',
            res: undefined
        }
    }

    if (project.vacancies.length == employees.length) {
        return {
            code: 1,
            msg: 'Людей как раз хватает на проект, но ни есть хорошо',
            res: employees
        }
    }

    for (let i = 0; i < number; i++) {
        let team = []
        let usedMembers = []
        
        if (rand) {
            while (team.length < project.vacancies.length) {
                // Сотрудников просто не хватает.
                if (usedMembers.length == employees.length) {
                    return -2
                }

                const r = Math.floor(Math.random() * employees.length)
                if (usedMembers.includes(r)) {
                    continue
                }
                else {
                    // Выбираем сотрудника случайным образом.
                    team.push(employees[r])
                    usedMembers.push(r)
                }
            }
        }
        // или через не рандом, с учетом всех скиллов пользователей.
        else {
            for (let i = 0; i < project.vacancies.length; i++) {
                const selected = selectTeamMemberBySkills(employees, project.vacancies[i], usedMembers)
                team.push(employees[selected])
                usedMembers.push(selected)
            }
        }
        teams.push(team)
    }

    return teams
}

// Алгоритм определения наиболее подходящего человека под вакансию.
const selectTeamMemberBySkills = (members, vacancy, employed) => {
    // Составляем рейтинг соответствия вакансии. subjects = skills (в данном случае).
    const requiredSkills = vacancy.subjects.split(',')
    let max_rating = -10
    let max_user = -1

    for (let i = 0; i < members.length; i++) {
        const m = members[i]
        const mSkills = m.skills.map((v) => { return v.name })
        let userRating = 0

        // Проверяем, насколько человек соответствует вакансии.
        for (let j = 0; j < requiredSkills.length; j++) {
            const skill = requiredSkills[j]
            if (mSkills.includes(skill)) {
                userRating++
            }
        }

        // Сразу ищем максимум + учитываем условие, что пользователь не задействован нигде.
        if (max_rating === -10 || max_rating < userRating) {
            if (employed.includes(i)) {
                continue
            }
            else {
                max_user = i
                max_rating = userRating
            }
        }
    }

    return max_user
}

// Рассчет рейтинга скиллов команды.
const calcSkillsRating = (project, team) => {
    let val = 0
    const vacancies = project.vacancies
    
    for (let i = 0; i < team.length; i++) {
        // Какие скиллы требуются на вакансию.
        const requiredSkills = vacancies[i].subjects.split(',')

        // Какие скиллы есть у члена команды.
        const memberSkills = team[i].skills.map((v) => {return v.name})

        // Если есть пересечение, то плюсуем, накручивая рейтинг.
        for (let j = 0; j < requiredSkills.length; j++) {
            if (memberSkills.includes(requiredSkills[j])) {
                val++
            }
        }
    }

    return val
}

// Функция подсчета значения функции для каждой из команд. 
// Примечание: Вакансия, которую занимает сотрудник соответствует его номеру в команде.
const calcFunc = (project, teams, rand) => {
    let rating = [] // { teamNumber: 0, value: 3.2 }
    
    for (let i = 0; i < teams.length; i++) {
        let teamValue = 0

        // Расчет отдельного участника команды.
        if (rand) {
            for (let j = 0; j < teams[i].length; j++) {
                const reqExp = project.vacancies[j].requiredExperienceYears
                const userExp = teams[i][j].experienceYears
                const weightExp = project.vacancies[j].weightExperience / 100
                const weightSkills = project.vacancies[j].weightSkill / 100
                const vacation = teams[i][j].vacation / 100
                const skills = teams[i][j].skills

                let sumSkills = 0
                for (let n = 0; n < skills.length; n++) {
                    sumSkills += skills[n].value / 100
                }

                const Cp = weightExp * (userExp - reqExp) / reqExp + weightSkills * sumSkills + vacation
                teamValue += (1 - Cp) // согласно формуле.
            }

            teamValue /= project.vacancies.length
        }
        else {
            teamValue = calcSkillsRating(project, teams[i])
        }

        rating.push({ index: i, value: teamValue })
    }

    return rating
}

// Функция сортировки для составления рейтинга команд.
const compare = (a, b) => {
    if (a.value > b.value) {
        return 1
    }
    if (b.value > a.value) {
        return -1
    }
    return 0
}

const compareDesc = (a, b) => {
    if (a.value < b.value) {
        return 1
    }
    if (b.value < a.value) {
        return -1
    }
    return 0
}

// Получаем элитные хромосомы и те, которые не очень.
const getRating = (rating, teams, eliteCount, rand) => {
    let eliteTeams = []
    let restTeams = []

    if (rand) {
        rating = rating.sort(compare)
    } else {
        rating = rating.sort(compareDesc)
    }

    for (let i = 0; i < rating.length; i++) {
        if (i < eliteCount) {
            eliteTeams.push(teams[rating[i].index])       
        } else {
            restTeams.push(teams[rating[i].index])
        }
    }

    return {
        eliteTeams,
        restTeams
    }
}

// Создание поколения новых команд.
const createNextGenerationTeams = (project, rating, employees, changeCount, rand) => {
    let teams = []

    // Сохранение элитных команд.
    rating.eliteTeams.forEach((v, i) => {
        teams.push(v)
    })

    // Обновление остальных и создание команд.
    for (let i = 0; i < rating.restTeams.length; i++) {
        // Создание на основе алгоритма мутации.
        const newTeam = randChange(project, rating.restTeams[i], employees, changeCount, rand)
        teams.push(newTeam)
    }

    return teams
}

// АЛГОРИТМЫ МУТАЦИИ.
// Случайным образом: берем и меняем несколько членов команды.
const randChange = (project, team, employees, changeCount, rand) => {
    // Доступные для команды сотрудники.
    const availableEmployees = getAvailableEmployees(employees, team)
    
    // Если число заменяемых членов команды больше чем в команде, то выдаем ошибку.
    if (changeCount > team.length) {
        return -1
    }

    // Если число доступных сотрудников меньше числа заменяемых, тогда тоже ошибку выкинуть.
    if (availableEmployees.length < changeCount) {
        return -1
    }

    // Кого меняем в команде.
    const mustBeChangedIndices = defineWhoMustBeChanged(team, changeCount)

    // Производим замену(ы).
    const newTeam = makeChange(project, team, mustBeChangedIndices, availableEmployees, rand)
   
    return newTeam
}

// Функция получения доступных сотрудников.
const getAvailableEmployees = (employees, team) => {
    let availableEmployees = []

    for (let i = 0; i < employees.length; i++) {
        const checkedId = employees[i]._id
        let found = false

        for (let j = 0; j < team.length; j++) {
            const teamMemberId = team[j]._id

            if (teamMemberId === checkedId) {
                found = true
            }
        }

        if (found === false) {
            availableEmployees.push(employees[i])
        }
    }

    return availableEmployees
}

// Определение тех кто должен быть заменен (на самом деле случайно).
const defineWhoMustBeChanged = (team, changeCount) => {
    let vacNums = []

    while (vacNums.length < changeCount) {
        const r = Math.floor(Math.random() * team.length)
        if (vacNums.includes(r)) {
            continue
        } else {
            vacNums.push(r)
        }
    }

    return vacNums
}

// Меняем сотрудников на новых.
const makeChange = (project, team, changedIndices, availableEmployees, rand) => {
    let newTeam = []
    let substitutes = []

    if (rand) {
        // Ищем кем подменить.
        while (substitutes.length < changedIndices.length) {
            // Если алгоритм построен на случайном подборе.
            const r = Math.floor(Math.random() * availableEmployees.length)
            if (substitutes.includes(r)) {
                continue
            } else {
                substitutes.push(r)
            }
        }
    }
    // Если алгоритм учитывает навыки пользователей. 
    else {
        for (let i = 0; i < changedIndices.length; i++) { 
            const selected = selectTeamMemberBySkills(availableEmployees, project.vacancies[changedIndices[i]], substitutes)
            substitutes.push(selected)
        }
    }

    // Формируем новую команду, заменяя указанных членов определенными.
    for (let i = 0, n = 0; i < team.length; i++) {
        if (changedIndices.includes(i)) {
            newTeam.push(availableEmployees[substitutes[n]])
            n++
        } else {
            newTeam.push(team[i])
        }
    }

    return newTeam
}

// Генетический алгоритм.
const geneticAlgorithm = (project, employees, teamNumber = 30, changeCount = 2, eliteCount = 1, iterations = 30, rand) => {
    changeCount = project.vacancies.length < changeCount ? project.vacancies.length : changeCount
    
    // Создание команд.
    let teams = []
    let epoch = 0

    while (epoch < iterations) {
        if (epoch === 0) {
            teams = initializeTeams(employees, teamNumber, project, rand)
        }

        // Расчет функции.
        let result = calcFunc(project, teams)

        // Формирование рейтинга.
        let rating = getRating(result, teams, eliteCount, rand)

        /*printRating(result, eliteCount, epoch.toString())
        printTeam(rating.eliteTeams[0])*/

        // Формирование группы команд.
        teams = createNextGenerationTeams(project, rating, employees, changeCount, rand)
        epoch++
    }

    let finalRes = calcFunc(project, teams)
    let finalRating = getRating(finalRes, teams, eliteCount, rand)

    //printRating(finalRes, eliteCount, 'Final')
    //printTeam(finalRating.eliteTeams[0])

    // Возвращаем только лучшую команду.
    return finalRating.eliteTeams[0]
}

const printRating = (rating, eliteCount, epoch) => {
    console.log('=== ' + epoch + ' ===')

    rating = rating.sort(compare)

    for (let i = 0; i < eliteCount; i++) {
        console.log(rating[i].value)
    }

    console.log('==========')
}

const printTeam = (team) => {
    for (let i = 0; i < team.length; i++) {
        console.log(team[i].name)
    }
}

// Отдаем наружу.
module.exports = {
    geneticAlgorithm
}