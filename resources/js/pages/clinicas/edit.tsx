import { Transition } from '@headlessui/react';
import { Form, Head, router } from '@inertiajs/react';
import { Check, ChevronDown, Copy, Mail, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import CancelInvitationModal from '@/components/cancel-invitation-modal';
import DeleteClinicaModal from '@/components/delete-clinica-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import InviteMemberModal from '@/components/invite-member-modal';
import RemoveMemberModal from '@/components/remove-member-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClipboard } from '@/hooks/use-clipboard';
import { useInitials } from '@/hooks/use-initials';
import { edit, index, update } from '@/routes/clinicas';
import { update as updateMember } from '@/routes/clinicas/members';
import type {
    RoleOption,
    Clinica,
    ClinicaInvitation,
    ClinicaMember,
    ClinicaPermissions,
} from '@/types';

type Props = {
    clinica: Clinica;
    members: ClinicaMember[];
    invitations: ClinicaInvitation[];
    permissions: ClinicaPermissions;
    availableRoles: RoleOption[];
};

export default function ClinicaEdit({
    clinica,
    members,
    invitations,
    permissions,
    availableRoles,
}: Props) {
    const getInitials = useInitials();
    const [, copy] = useClipboard();
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopyCode = async () => {
        const success = await copy(clinica.publicId);
        if (success) {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<ClinicaMember | null>(
        null,
    );
    const [cancelInvitationDialogOpen, setCancelInvitationDialogOpen] =
        useState(false);
    const [invitationToCancel, setInvitationToCancel] =
        useState<ClinicaInvitation | null>(null);

    const pageTitle = useMemo(
        () =>
            permissions.canUpdateClinica
                ? `Edit ${clinica.name}`
                : `View ${clinica.name}`,
        [permissions.canUpdateClinica, clinica.name],
    );

    const updateMemberRole = (member: ClinicaMember, newRole: string) => {
        router.visit(updateMember([clinica.slug, member.id]), {
            data: { role: newRole },
            preserveScroll: true,
        });
    };

    const confirmRemoveMember = (member: ClinicaMember) => {
        setMemberToRemove(member);
        setRemoveMemberDialogOpen(true);
    };

    const confirmCancelInvitation = (invitation: ClinicaInvitation) => {
        setInvitationToCancel(invitation);
        setCancelInvitationDialogOpen(true);
    };

    return (
        <>
            <Head title={pageTitle} />

            <h1 className="sr-only">{pageTitle}</h1>

            <div className="flex flex-col space-y-10">
                <div className="space-y-6">
                    {permissions.canUpdateClinica ? (
                        <>
                            <Heading
                                variant="small"
                                title="Clinica settings"
                                description="Update your clinica name and settings"
                            />

                            <Form
                                {...update.form(clinica.slug)}
                                className="space-y-6"
                            >
                                {({
                                    errors,
                                    processing,
                                    recentlySuccessful,
                                }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">
                                                Clinica name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                data-test="clinica-name-input"
                                                defaultValue={clinica.name}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button
                                                type="submit"
                                                data-test="clinica-save-button"
                                                disabled={processing}
                                            >
                                                Save
                                            </Button>

                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-neutral-600">
                                                    Saved.
                                                </p>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </>
                    ) : (
                        <>
                            <Heading variant="small" title={clinica.name} />
                        </>
                    )}
                </div>

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Clinica code"
                        description="Share this code so others can join your clinica"
                    />

                    <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
                        <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm select-all">
                            {clinica.publicId}
                        </code>

                        <TooltipProvider>
                            <Tooltip open={copiedCode}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyCode}
                                        data-test="copy-clinica-code-button"
                                    >
                                        {copiedCode ? (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Copy clinica code to clipboard</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Heading
                            variant="small"
                            title="Clinica members"
                            description={
                                permissions.canCreateInvitation
                                    ? 'Manage who belongs to this clinica'
                                    : ''
                            }
                        />

                        {permissions.canCreateInvitation ? (
                            <Button
                                data-test="invite-member-button"
                                onClick={() => setInviteDialogOpen(true)}
                            >
                                <UserPlus /> Invite member
                            </Button>
                        ) : null}
                    </div>

                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                data-test="member-row"
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        {member.avatar ? (
                                            <AvatarImage
                                                src={member.avatar}
                                                alt={member.name}
                                            />
                                        ) : null}
                                        <AvatarFallback>
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                            {member.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {member.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {member.role !== 'owner' &&
                                    permissions.canUpdateMember ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    data-test="member-role-trigger"
                                                >
                                                    {member.role_label}
                                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                {availableRoles.map((role) => (
                                                    <DropdownMenuItem
                                                        key={role.value}
                                                        data-test="member-role-option"
                                                        onSelect={() =>
                                                            updateMemberRole(
                                                                member,
                                                                role.value,
                                                            )
                                                        }
                                                    >
                                                        {role.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Badge variant="secondary">
                                            {member.role_label}
                                        </Badge>
                                    )}

                                    {member.role !== 'owner' &&
                                    permissions.canRemoveMember ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="member-remove-button"
                                                        onClick={() =>
                                                            confirmRemoveMember(
                                                                member,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Remove member</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {invitations.length > 0 ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Pending invitations"
                            description="Invitations that haven't been accepted yet"
                        />

                        <div className="space-y-3">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.code}
                                    data-test="invitation-row"
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {invitation.email}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {invitation.role_label}
                                            </div>
                                        </div>
                                    </div>

                                    {permissions.canCancelInvitation ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="invitation-cancel-button"
                                                        onClick={() =>
                                                            confirmCancelInvitation(
                                                                invitation,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Cancel invitation</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {permissions.canDeleteClinica && !clinica.isPersonal ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Delete clinica"
                            description="Permanently delete your clinica"
                        />
                        <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                            <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                                <p className="font-medium">Warning</p>
                                <p className="text-sm">
                                    Please proceed with caution, this cannot be
                                    undone.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                data-test="delete-clinica-button"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Delete clinica
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>

            {permissions.canCreateInvitation ? (
                <InviteMemberModal
                    clinica={clinica}
                    availableRoles={availableRoles}
                    open={inviteDialogOpen}
                    onOpenChange={setInviteDialogOpen}
                />
            ) : null}

            <RemoveMemberModal
                clinica={clinica}
                member={memberToRemove}
                open={removeMemberDialogOpen}
                onOpenChange={setRemoveMemberDialogOpen}
            />

            <CancelInvitationModal
                clinica={clinica}
                invitation={invitationToCancel}
                open={cancelInvitationDialogOpen}
                onOpenChange={setCancelInvitationDialogOpen}
            />

            {permissions.canDeleteClinica && !clinica.isPersonal ? (
                <DeleteClinicaModal
                    clinica={clinica}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
            ) : null}
        </>
    );
}

ClinicaEdit.layout = (props: { clinica: { name: string; slug: string } }) => ({
    breadcrumbs: [
        {
            title: 'Clinicas',
            href: index(),
        },
        {
            title: props.clinica.name,
            href: edit(props.clinica.slug),
        },
    ],
});
