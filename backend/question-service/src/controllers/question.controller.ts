import {
    createQuestion,
    findOneQuestionById,
    findOneQuestionByTitle,
    findPaginatedQuestions,
    findQuestionCount,
} from '../models/question.repository'

import { CreateQuestionDto } from '../types/CreateQuestionDto'
import { QuestionDto } from '../types/QuestionDto'
import { Response } from 'express'
import { TypedRequest } from '../types/TypedRequest'
import { ValidationError } from 'class-validator'

export async function handleCreateQuestion(
    request: TypedRequest<CreateQuestionDto>,
    response: Response
): Promise<void> {
    const createDto = CreateQuestionDto.fromRequest(request)
    const errors = await createDto.validate()
    if (errors.length) {
        const errorMessages = errors.map((error: ValidationError) => `INVALID_${error.property.toUpperCase()}`)
        response.status(400).json(errorMessages).send()
        return
    }

    const duplicate = await findOneQuestionByTitle(createDto.title)
    if (duplicate) {
        response.status(409).json('DUPLICATE_TITLE').send()
        return
    }

    const question = await createQuestion(createDto)
    const dto = QuestionDto.fromModel(question)
    response.status(201).json(dto).send()
}

export async function handleGetPaginatedQuestions(request: TypedRequest<void>, response: Response): Promise<void> {
    const page = parseInt(request.query.page as string)
    const limit = parseInt(request.query.limit as string)

    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        response.status(400).json('INVALID_PAGINATION').send()
        return
    }

    const start = (page - 1) * limit
    const count = await findQuestionCount()
    const nextPage = start + limit < count ? page + 1 : null

    const questions = await findPaginatedQuestions(start, limit)
    const dto = questions.map((question) => QuestionDto.fromModel(question))

    response.status(200).json({
        currentPage: page,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        nextPage,
        dto,
    })
}

export async function handleGetQuestionById(request: TypedRequest<void>, response: Response): Promise<void> {
    const id = request.params.id

    const question = await findOneQuestionById(id)

    if (!question) {
        response.status(404).json('NOT_FOUND').send()
        return
    }

    const dto = QuestionDto.fromModel(question)
    response.status(200).json(dto).send()
}
