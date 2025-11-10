import { Application } from '../types/application';

export const mockApplications: Application[] = [
    {
        id: '1',
        fullName: 'Иванов Иван Иванович',
        groupNumber: 'ИТ-21-1',
        admissionYear: '2021',
        copiesCount: '2',
        submissionPlace: 'Деканат факультета информационных технологий',
        status: 'pending',
        createdAt: '2024-01-15T10:30:00Z',
        notes: 'Справка требуется для предоставления в военкомат'
    },
    {
        id: '2',
        fullName: 'Петрова Анна Сергеевна',
        groupNumber: 'ПМИ-20-2',
        admissionYear: '2020',
        copiesCount: '1',
        submissionPlace: 'Отдел кадров ООО "Технологии будущего"',
        status: 'approved',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-14T16:45:00Z'
    },
    {
        id: '3',
        fullName: 'Сидоров Алексей Владимирович',
        groupNumber: 'ФИ-22-1',
        admissionYear: '2022',
        copiesCount: '3',
        submissionPlace: 'Стипендиальная комиссия',
        status: 'completed',
        createdAt: '2024-01-13T09:15:00Z',
        updatedAt: '2024-01-15T11:20:00Z'
    },
    {
        id: '4',
        fullName: 'Козлова Мария Дмитриевна',
        groupNumber: 'ИТ-21-2',
        admissionYear: '2021',
        copiesCount: '1',
        submissionPlace: 'Посольство Германии для получения визы',
        status: 'rejected',
        createdAt: '2024-01-12T16:40:00Z',
        updatedAt: '2024-01-13T10:15:00Z',
        notes: 'Необходимо уточнить цель предоставления справки'
    },
    {
        id: '5',
        fullName: 'Никитин Денис Олегович',
        groupNumber: 'ПМИ-19-1',
        admissionYear: '2019',
        copiesCount: '2',
        submissionPlace: 'Банк для получения кредита',
        status: 'pending',
        createdAt: '2024-01-15T08:20:00Z'
    },
    {
        id: '6',
        fullName: 'Орлова Екатерина Павловна',
        groupNumber: 'ФИ-20-3',
        admissionYear: '2020',
        copiesCount: '1',
        submissionPlace: 'Аспирантура для поступления',
        status: 'approved',
        createdAt: '2024-01-11T11:30:00Z',
        updatedAt: '2024-01-12T13:25:00Z'
    }
];
