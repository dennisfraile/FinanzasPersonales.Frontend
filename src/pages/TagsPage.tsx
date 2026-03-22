import { useState } from 'react';
import { type Tag, type CreateTagDto } from '../services/tagsService';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../hooks/useQueryHooks';
import HelpTooltip from '../components/HelpTooltip';
import { sectionHelp } from '../utils/helpContent';

export const TagsPage = () => {
    const { data: tags = [] } = useTags();
    const createTagMutation = useCreateTag();
    const updateTagMutation = useUpdateTag();
    const deleteTagMutation = useDeleteTag();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<CreateTagDto>({ nombre: '', color: '#3b82f6' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateTagMutation.mutateAsync({ id: editingId, data: formData });
                toast.success('Tag actualizado');
            } else {
                await createTagMutation.mutateAsync(formData);
                toast.success('Tag creado');
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving tag:', error);
            toast.error('Error al guardar tag');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Eliminar este tag?')) {
            try {
                await deleteTagMutation.mutateAsync(id);
                toast.success('Tag eliminado');
            } catch (error) {
                console.error('Error deleting tag:', error);
                toast.error('Error al eliminar tag');
            }
        }
    };

    const handleEdit = (tag: Tag) => {
        setEditingId(tag.id);
        setFormData({ nombre: tag.nombre, color: tag.color });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ nombre: '', color: '#3b82f6' });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">Tags <HelpTooltip content={sectionHelp.tags} /></h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nuevo Tag
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tags.map(tag => (
                        <div key={tag.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                />
                                <div>
                                    <p className="font-semibold dark:text-white">{tag.nombre}</p>
                                    <p className="text-xs text-gray-500">{tag.color}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(tag)}
                                    className="text-blue-600 hover:text-blue-800"
                                    aria-label="Editar"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(tag.id)}
                                    className="text-red-600 hover:text-red-800"
                                    aria-label="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">
                                {editingId ? 'Editar' : 'Nuevo'} Tag
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="tag-nombre" className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
                                    <input
                                        id="tag-nombre"
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                        maxLength={50}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="tag-color" className="block text-sm font-medium mb-1 dark:text-gray-300">Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="tag-color"
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-16 h-10 border rounded"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="#3b82f6"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                            aria-label="Código de color hexadecimal"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
