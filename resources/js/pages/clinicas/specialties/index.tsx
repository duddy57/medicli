import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';

import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Specialty {
    id: number;
    clinica_id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Clinica {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    clinica: Clinica;
    specialties: Specialty[];
}

export default function SpecialtiesIndex({ clinica, specialties }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
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
        title: '',
        description: '',
    });

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditingSpecialty(null);
        reset();
        clearErrors();
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (specialty: Specialty) => {
        setEditingSpecialty(specialty);
        setData({
            title: specialty.title,
            description: specialty.description || '',
        });
        clearErrors();
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/${clinica.slug}/specialties`, {
            onSuccess: () => closeModals(),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingSpecialty) return;

        patch(`/${clinica.slug}/specialties/${editingSpecialty.id}`, {
            onSuccess: () => closeModals(),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta especialidade?')) {
            router.delete(`/${clinica.slug}/specialties/${id}`);
        }
    };

    return (
        <>
            <Head title="Especialidades" />

            <div className="flex flex-col space-y-6 p-8">
                {flashMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        {flashMessage}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Especialidades"
                        description={`Gerencie as especialidades da clínica ${clinica.name}`}
                    />

                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Especialidade
                    </Button>
                </div>

                <div className="rounded-lg border bg-card shadow-sm">
                    {specialties.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="w-[100px] text-right">
                                        Ações
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {specialties.map((specialty) => (
                                    <TableRow key={specialty.id}>
                                        <TableCell className="font-medium">
                                            {specialty.title}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {specialty.description || '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEditModal(specialty)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleDelete(specialty.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Excluir</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Stethoscope className="mb-4 h-12 w-12 text-muted-foreground/40" />
                            <h3 className="text-lg font-medium text-foreground">
                                Nenhuma especialidade cadastrada
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                Comece adicionando a primeira especialidade para esta clínica.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={openCreateModal}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Especialidade
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
                        <DialogTitle>Nova Especialidade</DialogTitle>
                        <DialogDescription>
                            Adicione uma nova especialidade para esta clínica.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ex: Cardiologia"
                                autoFocus
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Breve descrição da especialidade"
                            />
                            <InputError message={errors.description} />
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
                                {processing ? 'Criando...' : 'Criar Especialidade'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!editingSpecialty}
                onOpenChange={(open) => {
                    if (!open) closeModals();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Especialidade</DialogTitle>
                        <DialogDescription>
                            Atualize os detalhes da especialidade.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdate} className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Título</Label>
                            <Input
                                id="edit-title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ex: Cardiologia"
                                autoFocus
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Input
                                id="edit-description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Breve descrição da especialidade"
                            />
                            <InputError message={errors.description} />
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
                                {processing ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

SpecialtiesIndex.layout = (props: Props) => {
    const clinica = props.clinica;

    if (!clinica) return {};

    return {
        breadcrumbs: [
            { title: 'Clínicas', href: '#' },
            { title: clinica.name, href: '#' },
            { title: 'Especialidades', href: `/${clinica.slug}/specialties` },
        ],
    };
};