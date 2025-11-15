import React from 'react';
import { Application } from '../types/application';
import ApplicationCard from './ApplicationCard';

interface ApplicationListProps {
    applications: Application[];
    emptyStateMessage?: string;
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
    applications,
    emptyStateMessage = 'Заявки не найдены'
}) => {
    if (applications.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет заявок</h3>
                <p className="text-gray-600">{emptyStateMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((application) => (
                <ApplicationCard
                    key={application.id}
                    application={application}
                />
            ))}
        </div>
    );
};

export default ApplicationList;
