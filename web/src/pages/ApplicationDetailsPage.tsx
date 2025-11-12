import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Application } from '../types/application';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { statusConfig } from '../components/ApplicationCard';
import { mockApplications } from '../data/mockApplications';
import {
    ArrowLeft,
    User,
    Users,
    Calendar,
    FileText,
    MapPin,
    Clock,
    Download,
    CheckCircle,
    FileUp,
    Upload,
    X,
    AlertCircle
} from 'lucide-react';

export const ApplicationDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [isAdmin] = useState(true);

    useEffect(() => {
        const loadApplication = () => {
            setIsLoading(true);
            setTimeout(() => {
                const foundApplication = mockApplications.find(app => app.id === id);
                if (foundApplication) {
                    const applicationWithFile = foundApplication.status === 'completed' ? {
                        ...foundApplication,
                        certificateFile: {
                            id: '1',
                            name: `Справка_${foundApplication.fullName.replace(/\s+/g, '_')}.pdf`,
                            url: '/sample-certificate.pdf',
                            uploadedAt: new Date().toISOString(),
                            size: 1024 * 512
                        }
                    } : foundApplication;

                    setApplication(applicationWithFile);
                } else {
                    setApplication(null);
                }
                setIsLoading(false);
            }, 500);
        };

        loadApplication();
    }, [id]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDownload = () => {
        if (application?.certificateFile) {
            const link = document.createElement('a');
            link.href = application.certificateFile.url;
            link.download = application.certificateFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setUploadError(null);

        if (!file) return;

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
            setUploadError('Недопустимый формат файла. Разрешены только PDF и Word документы.');
            setSelectedFile(null);
            event.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setUploadError('Файл слишком большой. Максимальный размер: 10MB.');
            setSelectedFile(null);
            event.target.value = '';
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !application) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const certificateFile = {
                id: Date.now().toString(),
                name: selectedFile.name,
                url: URL.createObjectURL(selectedFile),
                uploadedAt: new Date().toISOString(),
                size: selectedFile.size,
                mimeType: selectedFile.type
            };

            const updatedApplication: Application = {
                ...application,
                status: 'completed',
                certificateFile,
                updatedAt: new Date().toISOString()
            };

            setApplication(updatedApplication);
            setSelectedFile(null);

            const fileInput = document.getElementById('certificate-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error) {
            setUploadError('Ошибка при загрузке файла. Попробуйте еще раз.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadError(null);
        const fileInput = document.getElementById('certificate-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="bg-white rounded-xl p-8">
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Заявка не найдена</h2>
                        <p className="text-gray-600 mb-6">Заявка с указанным ID не существует.</p>
                        <Button
                            onClick={() => navigate('/applications')}
                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                            Вернуться к списку
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const status = statusConfig[application.status];
    const hasCertificate = application.status === 'completed' && application.certificateFile;
    const canUpload = isAdmin && !hasCertificate;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/applications')}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                        Назад к списку
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Заявка №{application.id}
                                </h1>
                                <p className="text-gray-600">
                                    {application.fullName}
                                </p>
                            </div>
                            <Badge variant={status.variant} icon={status.icon} size="lg">
                                {status.label}
                            </Badge>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Основная информация
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">ФИО</p>
                                            <p className="text-gray-900">{application.fullName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Группа</p>
                                            <p className="text-gray-900">{application.groupNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Год поступления</p>
                                            <p className="text-gray-900">{application.admissionYear}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                    Детали заявки
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Количество экземпляров</p>
                                            <p className="text-gray-900">{application.copiesCount}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Место предоставления</p>
                                            <p className="text-gray-900">{application.submissionPlace}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Дата создания</p>
                                            <p className="text-gray-900">{formatDate(application.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {canUpload && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Загрузка справки
                                </h3>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <Upload className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-yellow-900 text-lg mb-2">
                                                Прикрепите готовую справку
                                            </h4>
                                            <p className="text-yellow-700 text-sm">
                                                Загрузите готовый файл справки. После загрузки статус заявки автоматически изменится на "Завершена".
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex-1">
                                                <input
                                                    id="certificate-upload"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                    disabled={isUploading}
                                                />
                                                <label htmlFor="certificate-upload" className="block">
                                                    <div className="border-2 border-dashed border-yellow-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:bg-yellow-100 transition-colors">
                                                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-2" />
                                                        <p className="text-yellow-700 font-medium text-sm sm:text-base">
                                                            {selectedFile ? 'Файл выбран' : 'Выберите файл'}
                                                        </p>
                                                        <p className="text-yellow-600 text-xs sm:text-sm mt-1">
                                                            PDF или Word документ (макс. 10MB)
                                                        </p>
                                                    </div>
                                                </label>
                                            </div>

                                            {selectedFile && (
                                                <div className="flex items-center gap-2 bg-white rounded-lg border border-yellow-300 p-2 sm:p-3 min-w-0">
                                                    <FileText className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <p className="font-medium text-yellow-900 truncate text-sm" title={selectedFile.name}>
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-yellow-700 text-xs truncate">
                                                            {formatFileSize(selectedFile.size)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleRemoveFile}
                                                        disabled={isUploading}
                                                        leftIcon={<X className="w-3 h-3" />}
                                                        className="flex-shrink-0 px-2 py-1 text-xs"
                                                    >
                                                        Удалить
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {selectedFile && (
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="success"
                                                    onClick={handleUpload}
                                                    loading={isUploading}
                                                    disabled={isUploading}
                                                    leftIcon={<Upload className="w-4 h-4" />}
                                                    className="flex-1"
                                                >
                                                    {isUploading ? 'Загрузка...' : 'Загрузить справку'}
                                                </Button>
                                            </div>
                                        )}

                                        {uploadError && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                <p className="text-red-700 text-sm">{uploadError}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasCertificate && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <CheckCircle className="w-7 h-7 text-green-600" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Готовая справка
                                        </h3>
                                        <p className="text-green-600 text-sm mt-1">
                                            Справка готова и доступна для скачивания
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <FileUp className="w-7 h-7 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-green-900 text-lg mb-2 break-words">
                                                    {application.certificateFile!.name}
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-green-800">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                                        <span className="truncate">Загружено: {formatDate(application.certificateFile!.uploadedAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="success"
                                            onClick={handleDownload}
                                            leftIcon={<Download className="w-4 h-4" />}
                                            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                        >
                                            Скачать справку
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailsPage;
