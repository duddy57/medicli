import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface SpecialtyOption {
    id: number;
    title: string;
}

interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number;
    specialty_id: number | null;
    specialty?: {
        id: number;
        title: string;
    } | null;
}

interface Clinica {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    clinica: Clinica;
    services: Service[];
    specialties: SpecialtyOption[];
}

export default function ServicesIndex({
    clinica,
    services,
    specialties,
}: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
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
        name: '',
        description: '',
        price: '',
        specialty_id: '',
    });

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditingService(null);
        reset();
        clearErrors();
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setData({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            specialty_id: service.specialty_id?.toString() || '',
        });
        clearErrors();
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/${clinica.slug}/services`, {
            onSuccess: () => closeModals(),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingService) return;

        patch(`/${clinica.slug}/services/${editingService.id}`, {
            onSuccess: () => closeModals(),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            router.delete(`/${clinica.slug}/services/${id}`);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    return (
        <>
            <Head title="Serviços" />

            <div className="flex flex-col space-y-6 p-8">
                {flashMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {flashMessage}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Serviços"
                        description={`Gerencie os serviços da clínica ${clinica.name}`}
                    />

                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Serviço
                    </Button>
                </div>

                <div className="rounded-lg border bg-card shadow-sm">
                    {services.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Especialidade</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Preço</TableHead>
                                    <TableHead className="w-[100px] text-right">
                                        Ações
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">
                                            {service.name}
                                        </TableCell>
                                        <TableCell>
                                            {service.specialty ? (
                                                <Badge variant="outline">
                                                    {service.specialty.title}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate text-muted-foreground">
                                            {service.description || '—'}
                                        </TableCell>
                                        <TableCell className="font-medium text-green-600 dark:text-green-400">
                                            {formatPrice(service.price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        openEditModal(service)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Editar
                                                    </span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(service.id)
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
                            <Wrench className="mb-4 h-12 w-12 text-muted-foreground/40" />
                            <h3 className="text-lg font-medium text-foreground">
                                Nenhum serviço cadastrado
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                Comece adicionando o primeiro serviço para esta
                                clínica.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={openCreateModal}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Serviço
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog
                open={isCreateModalOpen}
                onOpenChange={(open) => {
                    if (!open) closeModals();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Novo Serviço</DialogTitle>
                        <DialogDescription>
                            Adicione um novo serviço para esta clínica.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Ex: Consulta Geral"
                                autoFocus
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Breve descrição do serviço"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="price">Preço (R$)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                placeholder="0.00"
                                required
                            />
                            <InputError message={errors.price} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="specialty_id">Especialidade</Label>
                            <Select
                                value={data.specialty_id}
                                onValueChange={(value) =>
                                    setData('specialty_id', value)
                                }
                            >
                                <SelectTrigger id="specialty_id">
                                    <SelectValue placeholder="Selecione uma especialidade (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {specialties.map((specialty) => (
                                        <SelectItem
                                            key={specialty.id}
                                            value={specialty.id.toString()}
                                        >
                                            {specialty.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.specialty_id} />
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
                                {processing ? 'Criando...' : 'Criar Serviço'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!editingService}
                onOpenChange={(open) => {
                    if (!open) closeModals();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Serviço</DialogTitle>
                        <DialogDescription>
                            Atualize os detalhes do serviço.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdate} className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input
                                id="edit-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Ex: Consulta Geral"
                                autoFocus
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Input
                                id="edit-description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Breve descrição do serviço"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-price">Preço (R$)</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                placeholder="0.00"
                                required
                            />
                            <InputError message={errors.price} />
                        </div>

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
                                <SelectTrigger id="edit-specialty_id">
                                    <SelectValue placeholder="Selecione uma especialidade (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {specialties.map((specialty) => (
                                        <SelectItem
                                            key={specialty.id}
                                            value={specialty.id.toString()}
                                        >
                                            {specialty.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.specialty_id} />
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

ServicesIndex.layout = (props: Props) => {
    const clinica = props.clinica;

    if (!clinica) return {};

    return {
        breadcrumbs: [
            { title: 'Clínicas', href: '#' },
            { title: clinica.name, href: '#' },
            { title: 'Serviços', href: `/${clinica.slug}/services` },
        ],
    };
};
