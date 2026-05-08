'use client';
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/context/storeContext';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Trash2, RotateCcw, Loader2 } from 'lucide-react';
import { Patient } from '@/types/patient.types';

const PatientsPage: React.FC = () => {
  const { patientStore } = useStore();
  const router = useRouter();

  // State for notes modal
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = React.useState(false);
  const [editedNotes, setEditedNotes] = React.useState('');
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);

  useEffect(() => {
    patientStore.loadPatients();
  }, [patientStore]);

  const handleRowClick = (patient: Patient) => {
    router.push(`/dashboard/patients/${patient.id}`);
  };

  const handleNotesClick = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setEditedNotes(patient.notes || '');
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    setIsSavingNotes(true);
    try {
      await patientStore.updatePatientInfo(selectedPatient.id, {
        notes: editedNotes,
      });
      setIsNotesModalOpen(false);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await patientStore.softDeletePatient(id);
  };

  const handleRestore = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await patientStore.restoreDeletedPatient(id);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatGender = (gender: string | null): string => {
    if (!gender) return '—';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Patients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your patient records
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/patients/add')}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* ── Error ──────────────────────────────────────────── */}
      {patientStore.error && (
        <ErrorAlert
          error={patientStore.error}
          onDismiss={() => patientStore.clearError()}
        />
      )}

      {/* ── Summary Card ───────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {patientStore.isLoading ? (
                    <Skeleton className="h-5 w-24 inline-block" />
                  ) : (
                    `${patientStore.totalPatients} Patient${patientStore.totalPatients !== 1 ? 's' : ''}`
                  )}
                </CardTitle>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-deleted"
                checked={patientStore.includeDeleted}
                onCheckedChange={(checked) =>
                  patientStore.setIncludeDeleted(checked === true)
                }
              />
              <label
                htmlFor="include-deleted"
                className="text-sm font-medium leading-none cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include Deleted Patients
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* ── Loading Skeleton ──────────────────────────── */}
          {patientStore.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : patientStore.filteredPatients.length === 0 ? (
            /* ── Empty State ─────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No patients found
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {patientStore.includeDeleted
                  ? 'No patient records exist yet.'
                  : 'No active patients. Toggle "Include Deleted Patients" to see all records.'}
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => router.push('/dashboard/patients/add')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Patient
              </Button>
            </div>
          ) : (
            /* ── Table ───────────────────────────────────── */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
                    <TableHead className="hidden md:table-cell">Gender</TableHead>
                    <TableHead>Medical Record #</TableHead>
                    <TableHead className="hidden lg:table-cell">Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientStore.filteredPatients.map((patient) => {
                    const isDeleted = !!patient.deletedAt;

                    return (
                      <TableRow
                        key={patient.id}
                        className={`cursor-pointer transition-colors ${
                          isDeleted
                            ? 'opacity-60 bg-muted/30'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleRowClick(patient)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {patient.firstName}
                            {isDeleted && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Deleted
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{patient.lastName}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(patient.dateOfBirth)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatGender(patient.gender)}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {patient.medicalRecordNumber}
                          </code>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span
                            onClick={(e) => handleNotesClick(e, patient)}
                            className="text-primary hover:text-primary/80 underline decoration-dotted underline-offset-4 cursor-pointer font-bold tracking-widest"
                            title={patient.notes || 'No notes'}
                          >
                            ........
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isDeleted ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleRestore(e, patient.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="Restore patient"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDelete(e, patient.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete patient"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Notes Modal ────────────────────────────────────── */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Patient Notes - {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogTitle>
            <DialogDescription>
              View and edit patient notes below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Enter patient notes..."
              className="min-h-[200px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNotesModalOpen(false)}
              disabled={isSavingNotes}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
              {isSavingNotes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default observer(PatientsPage);
