export interface Application {
    id: string;
    fullName: string;
    groupNumber: string;
    admissionYear: string;
    copiesCount: string;
    submissionPlace: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: string;
    updatedAt?: string;
    notes?: string;
}

export type ApplicationStatus = Application['status'];
