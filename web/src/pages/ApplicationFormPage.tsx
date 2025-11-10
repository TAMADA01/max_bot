import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import {
    User,
    Users,
    Calendar,
    FileText,
    MapPin,
    Send,
    Trash2,
    Check, ArrowLeft
} from 'lucide-react';

interface ApplicationFormData {
    fullName: string;
    groupNumber: string;
    admissionYear: string;
    copiesCount: string;
    submissionPlace: string;
}

interface FormErrors {
    fullName?: string;
    groupNumber?: string;
    admissionYear?: string;
    copiesCount?: string;
    submissionPlace?: string;
}

export const ApplicationFormPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ApplicationFormData>({
        fullName: '',
        groupNumber: '',
        admissionYear: '',
        copiesCount: '',
        submissionPlace: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'ФИО обязательно для заполнения';
        } else if (formData.fullName.trim().split(' ').length < 2) {
            newErrors.fullName = 'Введите фамилию, имя и отчество полностью';
        }

        if (!formData.groupNumber.trim()) {
            newErrors.groupNumber = 'Номер группы обязателен';
        } else if (!/^[А-Яа-яA-Za-z0-9-]+$/.test(formData.groupNumber)) {
            newErrors.groupNumber = 'Некорректный формат номера группы';
        }

        if (!formData.admissionYear.trim()) {
            newErrors.admissionYear = 'Год поступления обязателен';
        } else if (!/^\d{4}$/.test(formData.admissionYear)) {
            newErrors.admissionYear = 'Введите год в формате: 2024';
        } else {
            const year = parseInt(formData.admissionYear);
            const currentYear = new Date().getFullYear();
            if (year < 2000 || year > currentYear) {
                newErrors.admissionYear = `Год должен быть между 2000 и ${currentYear}`;
            }
        }

        if (!formData.copiesCount.trim()) {
            newErrors.copiesCount = 'Количество экземпляров обязательно';
        } else if (!/^\d+$/.test(formData.copiesCount)) {
            newErrors.copiesCount = 'Введите число';
        } else {
            const copies = parseInt(formData.copiesCount);
            if (copies < 1 || copies > 10) {
                newErrors.copiesCount = 'Количество должно быть от 1 до 10';
            }
        }

        if (!formData.submissionPlace.trim()) {
            newErrors.submissionPlace = 'Укажите место предоставления справки';
        } else if (formData.submissionPlace.trim().length < 5) {
            newErrors.submissionPlace = 'Укажите более подробное место предоставления';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof ApplicationFormData) =>
        (value: string | React.ChangeEvent<HTMLInputElement>) => {
            const newValue = typeof value === 'string' ? value : value.target.value;
            setFormData(prev => ({ ...prev, [field]: newValue }));

            if (errors[field]) {
                setErrors(prev => ({ ...prev, [field]: undefined }));
            }
        };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            console.log('Данные заявки:', formData);
            setIsSubmitting(false);
            setIsSubmitted(true);

            setTimeout(() => {
                navigate('/applications');
            }, 2000);
        }, 1500);
    };

    const handleReset = () => {
        setFormData({
            fullName: '',
            groupNumber: '',
            admissionYear: '',
            copiesCount: '',
            submissionPlace: '',
        });
        setErrors({});
        setIsSubmitted(false);
    };

    const handleBackToApplications = () => {
        navigate('/applications');
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Заявка успешно отправлена!</h2>
                            <p className="text-gray-600 mb-2">Ваша заявка на получение справки принята в обработку.</p>
                            <p className="text-gray-500 text-sm mb-6">Справка будет готова в течение 3-5 рабочих дней.</p>
                            <div className="animate-pulse text-sm text-blue-600">
                                Перенаправляем к списку заявок...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={handleBackToApplications}
                        fullWidth
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                        К списку заявок
                    </Button>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Заявка на получение справки
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Заполните форму для получения официальной справки из учебного заведения
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="ФИО полностью *"
                            placeholder="Иванов Иван Иванович"
                            value={formData.fullName}
                            onChange={handleInputChange('fullName')}
                            error={errors.fullName}
                            leftIcon={<User className="w-4 h-4" />}
                        />

                        <Input
                            label="Номер группы *"
                            placeholder="ИТ-21-1"
                            value={formData.groupNumber}
                            onChange={handleInputChange('groupNumber')}
                            error={errors.groupNumber}
                            helperText="Пример: ИТ-21-1, ПМИ-20-2"
                            leftIcon={<Users className="w-4 h-4" />}
                        />

                        <Input
                            label="Год поступления *"
                            placeholder="2024"
                            value={formData.admissionYear}
                            onChange={handleInputChange('admissionYear')}
                            error={errors.admissionYear}
                            helperText="Введите год поступления"
                            leftIcon={<Calendar className="w-4 h-4" />}
                            maxLength={4}
                        />

                        <Input
                            label="Количество экземпляров *"
                            placeholder="2"
                            value={formData.copiesCount}
                            onChange={handleInputChange('copiesCount')}
                            error={errors.copiesCount}
                            helperText="Введите число от 1 до 10"
                            leftIcon={<FileText className="w-4 h-4" />}
                            maxLength={2}
                        />

                        <Input
                            label="Место предоставления справки *"
                            placeholder="Например: деканат факультета информационных технологий, отдел кадров предприятия"
                            value={formData.submissionPlace}
                            onChange={handleInputChange('submissionPlace')}
                            error={errors.submissionPlace}
                            helperText="Укажите организацию или отдел, куда требуется предоставить справку"
                            leftIcon={<MapPin className="w-4 h-4" />}
                        />

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                type="submit"
                                variant="success"
                                size="lg"
                                fullWidth
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                leftIcon={<Send className="w-5 h-5" />}
                            >
                                {isSubmitting ? 'Отправка...' : 'Подать заявку'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                fullWidth
                                onClick={handleReset}
                                disabled={isSubmitting}
                                leftIcon={<Trash2 className="w-5 h-5" />}
                            >
                                Очистить
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplicationFormPage;
