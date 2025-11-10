import React, { useState } from 'react';
import ApplicationList from '../components/ApplicationList';
import { mockApplications } from '../data/mockApplications';
import { Application } from '../types/application';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ApplicationsPage: React.FC = () => {
    const [applications, _] = useState<Application[]>(mockApplications);
    const navigate = useNavigate();

    const handleCreateApplication = () => {
        navigate('/applications/create');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои заявки</h1>
                        <p className="text-gray-600">
                            Всего заявок: {applications.length}
                        </p>
                    </div>

                    <Button
                        onClick={handleCreateApplication}
                        variant="success"
                        leftIcon={<Plus className="w-5 h-5" />}
                    >
                        Новая заявка
                    </Button>
                </div>

                <ApplicationList
                    applications={applications}
                    emptyStateMessage="У вас пока нет созданных заявок"
                />
            </div>
        </div>
    );
};

export default ApplicationsPage;
