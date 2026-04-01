export type ClinicaRole = 'owner' | 'admin' | 'doctor' | 'member';

export type Clinica = {
    id: number;
    name: string;
    slug: string;
    isPersonal: boolean;
    publicId: string;
    role?: ClinicaRole;
    roleLabel?: string;
    isCurrent?: boolean;
};

export type ClinicaMember = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role: ClinicaRole;
    role_label: string;
};

export type ClinicaInvitation = {
    code: string;
    email: string;
    role: ClinicaRole;
    role_label: string;
    created_at: string;
};

export type ClinicaPermissions = {
    canUpdateClinica: boolean;
    canDeleteClinica: boolean;
    canAddMember: boolean;
    canUpdateMember: boolean;
    canRemoveMember: boolean;
    canCreateInvitation: boolean;
    canCancelInvitation: boolean;
};

export type RoleOption = {
    value: ClinicaRole;
    label: string;
};
