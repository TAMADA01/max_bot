import React from 'react';
import { Badge } from './ui/Badge';
import { Application, ApplicationStatus } from '../types/application';
import {MapPin, Calendar, Package, XCircle, Clock, CheckCircle} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const formatCompactDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

interface ApplicationCardProps {
    application: Application;
    onView?: (application: Application) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
    application,
    onView
}) => {
    const navigate = useNavigate();
    const status = statusConfig[application.status];

    const handleView = () => {
        if (onView) {
            onView(application);
        } else {
            navigate(`/applications/${application.id}`);
        }
    };

    return (
        <div
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleView()}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            № {application.id}
                        </span>
                        <Badge variant={status.variant} icon={status.icon} size="sm">
                            {status.label}
                        </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">
                        {application.fullName}
                    </h3>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{application.submissionPlace}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{formatCompactDate(application.createdAt)}</span>
                </div>
            </div>
        </div>
    );
};

export default ApplicationCard;