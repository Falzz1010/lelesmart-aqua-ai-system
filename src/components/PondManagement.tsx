
/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useState, Fragment } from 'react';
import type { FC } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { PondForm, PondFormData } from "@/components/pond/PondForm";
import { PondCard } from "@/components/pond/PondCard";
import { Pond } from "@/hooks/usePonds";

const PondManagement = () => {
  const { ponds, loading, createPond, updatePond, deletePond } = usePonds();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPond, setEditingPond] = useState<Pond | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: PondFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPond) {
        await updatePond(editingPond.id, formData);
      } else {
        await createPond(formData);
      }
      setIsDialogOpen(false);
      setEditingPond(null);
    } catch (error) {
      console.error('Error submitting pond:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pond: Pond) => {
    setEditingPond(pond);
    setIsDialogOpen(true);
  };

  const handleDelete = async (pondId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kolam ini?')) {
      await deletePond(pondId);
    }
  };

  const handleAddNew = () => {
    setEditingPond(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Manajemen Kolam</h2>
            <p className="text-gray-600 mt-1">Kelola dan monitor kolam budidaya ikan lele</p>
          </div>
          
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kolam
          </Button>
        </div>

        {/* Ponds Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {ponds.map((pond) => (
            <PondCard
              key={pond.id}
              pond={pond}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {ponds.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardContent className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum Ada Kolam</h3>
              <p className="text-gray-500 mb-4 text-sm sm:text-base">Mulai dengan menambahkan kolam budidaya pertama Anda</p>
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kolam Pertama
              </Button>
            </CardContent>
          </Card>
        )}

        <PondForm
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingPond(null);
          }}
          onSubmit={handleSubmit}
          editingPond={editingPond}
          isLoading={isSubmitting}
        />
      </div>
    </Fragment>
  );
};

export default PondManagement;
