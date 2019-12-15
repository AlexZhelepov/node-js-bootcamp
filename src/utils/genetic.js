const UserInfo = require('../models/userInfo')
const Project = require('../models/project')
const Vacancy = require('../models/vacancy')

// Набор сотрудников.
// 1. Имя.
// 1.1 Должность и место работы
// 2. Набор навыков.
// 2.1 Значения навыков
// 3. Набор предметных областей.
// 3.1 Значения предметных областей
// 4. Вероятность смыться в отпуск во время проекта.
// 5. Текущее количество проектов (рассчитывается из числа вакансий, занятых сотрудником)

// Проект с рядом вакансий.

// Сущность проекта - это
// 1. Название.
// 2. Описание.

// Сущность вакансия
// 1. Название
// 2. Уровень квалификации
// 3. Кем занята
// 4. Проект

const genetic = async (projectId, steps = 5, elit = 5) => {
    const users = await UserInfo.find({})
    const project = await Project.findById(projectId)

    let epoch = 0

    // 1. Создание первого поколения. 
    prepareFirstGeneration(project, users)

    while (epoch <= steps) {
        epoch++
    }
}

const prepareFirstGeneration = (project, vacancies, users) => {

}

const makeNextGeneration = () => {

}



module.exports = genetic