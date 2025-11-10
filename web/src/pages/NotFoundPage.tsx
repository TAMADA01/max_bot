import React from 'react';
import { Button } from '../components/ui/Button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-400">404</div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Страница не найдена
                </h1>

                <p className="text-gray-600 mb-8">
                    Извините, мы не смогли найти страницу, которую вы ищете.
                    Возможно, она была перемещена или удалена.
                </p>

                <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    fullWidth
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    className="mb-8"
                >
                    Назад
                </Button>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Основные страницы:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                            onClick={() => navigate('/applications')}
                            variant="outline"
                            size="sm"
                            leftIcon={<FileText className="w-4 h-4" />}
                        >
                            Мои заявки
                        </Button>
                        <Button
                            onClick={() => navigate('/applications/create')}
                            variant="outline"
                            size="sm"
                            leftIcon={<FileText className="w-4 h-4" />}
                        >
                            Новая заявка
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
