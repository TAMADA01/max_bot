import React from 'react';
import { Badge } from './ui/Badge';
import { Application, ApplicationStatus } from '../types/application';
import {
    Users,
    Calendar,
    FileText,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    Package,
} from 'lucide-react';

interface ApplicationCardProps {
    application: Application;
}

export const statusConfig: Record<ApplicationStatus, {
    variant: 'default' | 'primary' | 'success' | 'warning' | 'error';
    icon: React.ReactNode;
    label: string;
}> = {
    pending: {
        variant: 'warning',
        icon: <Clock className="w-3 h-3" />,
        label: 'На рассмотрении'
    },
    approved: {
        variant: 'primary',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Одобрена'
    },
    rejected: {
        variant: 'error',
        icon: <XCircle className="w-3 h-3" />,
        label: 'Отклонена'
    },
    completed: {
        variant: 'success',
        icon: <Package className="w-3 h-3" />,
        label: 'Готова к выдаче'
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
    application,
}) => {
    const status = statusConfig[application.status];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{application.fullName}</h3>
                <Badge variant={status.variant} icon={status.icon}>
                    {status.label}
                </Badge>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Группа: <strong>{application.groupNumber}</strong></span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Год поступления: <strong>{application.admissionYear}</strong></span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>Количество экземпляров: <strong>{application.copiesCount}</strong></span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>Место предоставления: <strong>{application.submissionPlace}</strong></span>
                </div>
            </div>


            <div className="text-xs text-gray-500">
                Создано: {formatDate(application.createdAt)}
            </div>

        </div>
    );
};

export default ApplicationCard;
