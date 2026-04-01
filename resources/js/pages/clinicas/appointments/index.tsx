import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Calendar, Clock, Edit, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface ServiceOption {
    id: number;
    name: string;
    price: number;
}

interface SelectedService {
    service_id: number;
    quantity: number;
    name: string;
    price: number;
}

interface EmployeeOption {
    id: number;
    name: string;
}

interface SpecialtyOption {
    id: number;
    title: string;
}

interface Appointment {
    id: number;
    occurs_at: string;
    observation: string | null;
    status: string | null;
    reason: string | null;
    notes: string | null;
    payment_status: string | null;
    payment_method: string | null;
    total: number;
    employee: { id: number; name: string } | null;
    specialty: { id: number; title: string } | null;
    services: {
        id: number;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }[];
}

interface Clinica {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    clinica: Clinica;
    appointments: Appointment[];
    employees: EmployeeOption[];
    specialties: SpecialtyOption[];
    services: ServiceOption[];
}

export default function AppointmentsIndex({
    clinica,
    appointments,
    employees,
    specialties,
    services,
}: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] =
        useState<Appointment | null>(null);
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    const { flash } = usePage().props as { flash?: { success?: string } };

    useEffect(() => {
        if (flash?.success) {
            setFlashMessage(flash.success);
            const timer = setTimeout(() => setFlashMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const {
        data,
        setData,
        post,
        patch,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        occurs_at: '',
        observation: '',
        status: '',
        reason: '',
        notes: '',
        payment_status: '',
        payment_method: '',
        employee_id: '',
        specialty_id: '',
        services: [] as SelectedService[],
    });

    const total = useMemo(() => {
        return data.services.reduce((sum, s) => sum + s.price * s.quantity, 0);
    }, [data.services]);

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditingAppointment(null);
        reset();
        clearErrors();
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setData({
            occurs_at: appointment.occurs_at,
            observation: appointment.observation || '',
            status: appointment.status || '',
            reason: appointment.reason || '',
            notes: appointment.notes || '',
            payment_status: appointment.payment_status || '',
            payment_method: appointment.payment_method || '',
            employee_id: appointment.employee?.id.toString() || '',
            specialty_id: appointment.specialty?.id.toString() || '',
            services: appointment.services.map((s) => ({
                service_id: s.id,
                quantity: s.quantity,
                name: s.name,
                price: s.price,
            })),
        });
        clearErrors();
    };

    const addService = (serviceId: string) => {
        const service = services.find((s) => s.id.toString() === serviceId);
        if (!service) return;

        const alreadyExists = data.services.some(
            (s) => s.service_id === service.id,
        );
        if (alreadyExists) return;

        setData('services', [
            ...data.services,
            {
                service_id: service.id,
                quantity: 1,
                name: service.name,
                price: service.price,
            },
        ]);
    };

    const removeService = (serviceId: number) => {
        setData(
            'services',
            data.services.filter((s) => s.service_id !== serviceId),
        );
    };

    const updateServiceQuantity = (serviceId: number, quantity: number) => {
        setData(
            'services',
            data.services.map((s) =>
                s.service_id === serviceId ? { ...s, quantity } : s,
            ),
        );
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${clinica.slug}/appointments`, {
            onSuccess: () => closeModals(),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAppointment) return;
        patch(`/${clinica.slug}/appointments/${editingAppointment.id}`, {
            onSuccess: () => closeModals(),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este atendimento?')) {
            router.delete(`/${clinica.slug}/appointments/${id}`);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const availableServicesForSelect = services.filter(
        (s) => !data.services.some((selected) => selected.service_id === s.id),
    );

    return (
        <>
            <Head title="Atendimentos" />

            <div className="flex flex-col space-y-6 p-8">
                {flashMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {flashMessage}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Atendimentos"
                        description={`Gerencie os atendimentos da clínica ${clinica.name}`}
                    />

                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Atendimento
                    </Button>
                </div>

                <div className="rounded-lg border bg-card shadow-sm">
                    {appointments.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data/Hora</TableHead>
                                    <TableHead>Funcionário</TableHead>
                                    <TableHead>Especialidade</TableHead>
                                    <TableHead>Serviços</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px] text-right">
                                        Ações
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.map((appointment) => (
                                    <TableRow key={appointment.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {formatDate(
                                                    appointment.occurs_at,
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {appointment.employee?.name || '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {appointment.specialty?.title ||
                                                '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {appointment.services.map(
                                                    (s) => (
                                                        <Badge
                                                            key={s.id}
                                                            variant="outline"
                                                        >
                                                            {s.name}{' '}
                                                            {s.quantity > 1 &&
                                                                `×${s.quantity}`}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-green-600 dark:text-green-400">
                                            {formatPrice(appointment.total)}
                                        </TableCell>
                                        <TableCell>
                                            {appointment.status ? (
                                                <Badge variant="secondary">
                                                    {appointment.status}
                                                </Badge>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        openEditModal(
                                                            appointment,
                                                        )
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Editar
                                                    </span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(
                                                            appointment.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Excluir
                                                    </span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Clock className="mb-4 h-12 w-12 text-muted-foreground/40" />
                            <h3 className="text-lg font-medium text-foreground">
                                Nenhum atendimento cadastrado
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                Comece adicionando o primeiro atendimento para
                                esta clínica.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={openCreateModal}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Atendimento
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={(open) => {
                    if (!open) closeModals();
                }}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Novo Atendimento</DialogTitle>
                        <DialogDescription>
                            Registre um novo atendimento com os serviços
                            realizados.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="occurs_at">Data/Hora</Label>
                                <Input
                                    id="occurs_at"
                                    type="datetime-local"
                                    value={data.occurs_at}
                                    onChange={(e) =>
                                        setData('occurs_at', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.occurs_at} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="employee_id">Funcionário</Label>
                                <Select
                                    value={data.employee_id}
                                    onValueChange={(value) =>
                                        setData('employee_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem
                                                key={emp.id}
                                                value={emp.id.toString()}
                                            >
                                                {emp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.employee_id} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="specialty_id">
                                    Especialidade
                                </Label>
                                <Select
                                    value={data.specialty_id}
                                    onValueChange={(value) =>
                                        setData('specialty_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {specialties.map((spec) => (
                                            <SelectItem
                                                key={spec.id}
                                                value={spec.id.toString()}
                                            >
                                                {spec.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.specialty_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">
                                            Agendado
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            Em Andamento
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Concluído
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelado
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="grid gap-3 rounded-lg border p-4">
                            <Label>Serviços</Label>

                            {data.services.length > 0 && (
                                <div className="space-y-2">
                                    {data.services.map((service) => (
                                        <div
                                            key={service.service_id}
                                            className="flex items-center gap-3 rounded-md bg-muted p-2"
                                        >
                                            <span className="flex-1 text-sm font-medium">
                                                {service.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={service.quantity}
                                                    onChange={(e) =>
                                                        updateServiceQuantity(
                                                            service.service_id,
                                                            parseInt(
                                                                e.target.value,
                                                                10,
                                                            ) || 1,
                                                        )
                                                    }
                                                    className="w-16 rounded border bg-background px-2 py-1 text-center text-sm"
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {formatPrice(
                                                        service.price *
                                                            service.quantity,
                                                    )}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() =>
                                                        removeService(
                                                            service.service_id,
                                                        )
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Select onValueChange={addService}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="+ Adicionar serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableServicesForSelect.map(
                                            (service) => (
                                                <SelectItem
                                                    key={service.id}
                                                    value={service.id.toString()}
                                                >
                                                    {service.name} —{' '}
                                                    {formatPrice(service.price)}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.services.length > 0 && (
                                <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2">
                                    <span className="text-sm font-medium">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            )}
                            <InputError
                                message={
                                    (errors as Record<string, string>)[
                                        'services'
                                    ]
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="observation">Observação</Label>
                            <Textarea
                                id="observation"
                                value={data.observation}
                                onChange={(e) =>
                                    setData('observation', e.target.value)
                                }
                                placeholder="Observações sobre o atendimento"
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModals}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Criando...'
                                    : 'Criar Atendimento'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={!!editingAppointment}
                onOpenChange={(open) => {
                    if (!open) closeModals();
                }}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Atendimento</DialogTitle>
                        <DialogDescription>
                            Atualize os detalhes do atendimento.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdate} className="grid gap-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-occurs_at">
                                    Data/Hora
                                </Label>
                                <Input
                                    id="edit-occurs_at"
                                    type="datetime-local"
                                    value={data.occurs_at}
                                    onChange={(e) =>
                                        setData('occurs_at', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.occurs_at} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-employee_id">
                                    Funcionário
                                </Label>
                                <Select
                                    value={data.employee_id}
                                    onValueChange={(value) =>
                                        setData('employee_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem
                                                key={emp.id}
                                                value={emp.id.toString()}
                                            >
                                                {emp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-specialty_id">
                                    Especialidade
                                </Label>
                                <Select
                                    value={data.specialty_id}
                                    onValueChange={(value) =>
                                        setData('specialty_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {specialties.map((spec) => (
                                            <SelectItem
                                                key={spec.id}
                                                value={spec.id.toString()}
                                            >
                                                {spec.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">
                                            Agendado
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            Em Andamento
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Concluído
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelado
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="grid gap-3 rounded-lg border p-4">
                            <Label>Serviços</Label>

                            {data.services.length > 0 && (
                                <div className="space-y-2">
                                    {data.services.map((service) => (
                                        <div
                                            key={service.service_id}
                                            className="flex items-center gap-3 rounded-md bg-muted p-2"
                                        >
                                            <span className="flex-1 text-sm font-medium">
                                                {service.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={service.quantity}
                                                    onChange={(e) =>
                                                        updateServiceQuantity(
                                                            service.service_id,
                                                            parseInt(
                                                                e.target.value,
                                                                10,
                                                            ) || 1,
                                                        )
                                                    }
                                                    className="w-16 rounded border bg-background px-2 py-1 text-center text-sm"
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {formatPrice(
                                                        service.price *
                                                            service.quantity,
                                                    )}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() =>
                                                        removeService(
                                                            service.service_id,
                                                        )
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Select onValueChange={addService}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="+ Adicionar serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableServicesForSelect.map(
                                            (service) => (
                                                <SelectItem
                                                    key={service.id}
                                                    value={service.id.toString()}
                                                >
                                                    {service.name} —{' '}
                                                    {formatPrice(service.price)}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.services.length > 0 && (
                                <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2">
                                    <span className="text-sm font-medium">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-observation">Observação</Label>
                            <Textarea
                                id="edit-observation"
                                value={data.observation}
                                onChange={(e) =>
                                    setData('observation', e.target.value)
                                }
                                placeholder="Observações sobre o atendimento"
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModals}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Salvando...'
                                    : 'Salvar Alterações'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

AppointmentsIndex.layout = (props: Props) => {
    const clinica = props.clinica;

    if (!clinica) return {};

    return {
        breadcrumbs: [
            { title: 'Clínicas', href: '#' },
            { title: clinica.name, href: '#' },
            {
                title: 'Atendimentos',
                href: `/${clinica.slug}/appointments`,
            },
        ],
    };
};
