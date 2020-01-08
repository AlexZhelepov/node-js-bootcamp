
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const employees = [
    {
        _id: uuidv4(),
        name: 'Alex',
        expYears: 5,
        vacation: 1,
        skills: [
            {
                name: 'Навык 1',
                value: 0.74
            },
            {
                name: 'Навык 2',
                value: 0.67
            },
            {
                name: 'Навык 3',
                value: 0.23
            }
        ]
    },
    {
        _id: uuidv4(),
        name: 'Ivan',
        expYears: 6,
        vacation: 0,
        skills: [
            {
                name: 'Навык 1',
                value: 0.3
            },
            {
                name: 'Навык 2',
                value: 0.43
            },
            {
                name: 'Навык 3',
                value: 0.54
            }
        ]
    },
    {
        _id: uuidv4(),
        name: 'Oleg',
        expYears: 34,
        vacation: 0.4,
        skills: [
            {
                name: 'Навык 1',
                value: 0.9
            },
            {
                name: 'Навык 2',
                value: 0.91
            },
            {
                name: 'Навык 3',
                value: 0.79
            }
        ]
    },
    {
        _id: uuidv4(),
        name: 'Petr',
        expYears: 6,
        vacation: 0.67,
        skills: [
            {
                name: 'Навык 1',
                value: 0.78
            },
            {
                name: 'Навык 2',
                value: 0.54
            },
            {
                name: 'Навык 3',
                value: 0.78
            }
        ]
    },
    {
        _id: uuidv4(),
        name: 'Olga',
        expYears: 2,
        vacation: 0.12,
        skills: [
            {
                name: 'Навык 1',
                value: 0.45
            },
            {
                name: 'Навык 2',
                value: 0.76
            },
            {
                name: 'Навык 3',
                value: 0.34
            }
        ]
    },
    {
        _id: uuidv4(),
        name: 'Olesya',
        expYears: 1,
        vacation: 0.54,
        skills: [
            {
                name: 'Навык 1',
                value: 0.21
            },
            {
                name: 'Навык 2',
                value: 0.12
            },
            {
                name: 'Навык 3',
                value: 0.14
            }
        ]
    },
]

const project = {
    name: 'Проект 1',
    desciption: 'Описание проекта',
    vacancies: [
        {
            name: 'Вакансия 1',
            reqExp: 5,
            weightExp: 0.89,
            weightSkls: 0.94
        },
        {
            name: 'Вакансия 2',
            reqExp: 2,
            weightExp: 0.4,
            weightSkls: 0.7
        },
        {
            name: 'Вакансия 3',
            reqExp: 1,
            weightExp: 0.2,
            weightSkls: 0.4
        }
    ]
}

// Формирование команд первого поколения.
const initializeTeams = (employees, number, project) => {
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
                team.push(employees[r])
                usedMembers.push(r)
            }
        }
        teams.push(team)
    }

    return teams
}

// Функция подсчета значения функции для каждой из команд. 
// Примечание: Вакансия, которую занимает сотрудник соответствует его номеру в команде.
const calcFunc = (project, teams) => {
    let rating = [] // { teamNumber: 0, value: 3.2 }

    for (let i = 0; i < teams.length; i++) {
        let teamValue = 0

        // Расчет отдельного участника команды.
        for (let j = 0; j < teams[i].length; j++) {
            const reqExp = project.vacancies[j].reqExp
            const userExp = teams[i][j].expYears
            const weightExp = project.vacancies[j].weightExp
            const weightSkills = project.vacancies[j].weightSkls
            const vacation = teams[i][j].vacation
            const skills = teams[i][j].skills

            let sumSkills = 0
            for (let n = 0; n < skills.length; n++) {
                sumSkills += skills[n].value
            }

            const Cp = weightExp * (userExp - reqExp) / reqExp + weightSkills * sumSkills + vacation
            teamValue += (1 - Cp) // согласно формуле.
        }

        teamValue /= project.vacancies.length
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

// Получаем элитные хромосомы и те, которые не очень.
const getRating = (rating, teams, eliteCount) => {
    let eliteTeams = []
    let restTeams = []

    rating = rating.sort(compare)

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
const createNextGenerationTeams = (rating, employees, changeCount) => {
    let teams = []

    // Сохранение элитных команд.
    rating.eliteTeams.forEach((v, i) => {
        teams.push(v)
    })

    // Обновление остальных и создание команд.
    for (let i = 0; i < rating.restTeams.length; i++) {
        // Создание на основе алгоритма мутации.
        const newTeam = randChange(rating.restTeams[i], employees, changeCount)
        teams.push(newTeam)
    }

    return teams
}

// АЛГОРИТМЫ МУТАЦИИ.
// Случайным образом: берем и меняем несколько членов команды (да вот просто так).
const randChange = (team, employees, changeCount) => {
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
    const newTeam = makeChange(team, mustBeChangedIndices, availableEmployees)
   
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
const makeChange = (team, changedIndices, availableEmployees) => {
    let newTeam = []
    let substitutes = []

    // Ищем кем подменить.
    while (substitutes.length < changedIndices.length) {
        const r = Math.floor(Math.random() * availableEmployees.length)
        if (substitutes.includes(r)) {
            continue
        } else {
            substitutes.push(r)
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
const geneticAlgorithm = (project, employees, teamNumber = 30, changeCount = 2, eliteCount = 1, iterations = 30) => {
    // Создание команд.
    let teams = []
    let epoch = 0

    while (epoch < iterations) {
        if (epoch === 0) {
            teams = initializeTeams(employees, teamNumber, project)
        }

        // Расчет функции.
        let result = calcFunc(project, teams)

        // Формирование рейтинга.
        let rating = getRating(result, teams, eliteCount)

        printRating(result, eliteCount, epoch.toString())
        printTeam(rating.eliteTeams[0])

        // Формирование группы команд.
        teams = createNextGenerationTeams(rating, employees, changeCount)

        epoch++
    }

    let finalRes = calcFunc(project, teams)
    let finalRating = getRating(finalRes, teams, eliteCount)

    printRating(finalRes, eliteCount, 'Final')
    printTeam(finalRating.eliteTeams[0])
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

geneticAlgorithm(project, employees, teamNumber=4, changeCount=1, eliteCount=1, iterations=30)