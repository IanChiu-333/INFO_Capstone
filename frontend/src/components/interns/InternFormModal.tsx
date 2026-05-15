import { useState } from 'react';
import Modal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Autosuggest from '@cloudscape-design/components/autosuggest';
import DatePicker from '@cloudscape-design/components/date-picker';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import type { Intern, InternStage, InclinedStatus, ProgramStatus } from '../../services';

const LOCATION_OPTIONS = [
  { label: 'ATL11', value: 'ATL11' },
  { label: 'AUS13', value: 'AUS13' },
  { label: 'DTW10', value: 'DTW10' },
  { label: 'JFK27', value: 'JFK27' },
  { label: 'MAD12', value: 'MAD12' },
  { label: 'MAD15', value: 'MAD15' },
  { label: 'MRY11', value: 'MRY11' },
  { label: 'PDX17', value: 'PDX17' },
  { label: 'SAN13', value: 'SAN13' },
  { label: 'SAN21', value: 'SAN21' },
  { label: 'SBA11', value: 'SBA11' },
  { label: 'SBP1',  value: 'SBP1'  },
  { label: 'SBP10', value: 'SBP10' },
  { label: 'SBP12', value: 'SBP12' },
  { label: 'SEA22', value: 'SEA22' },
  { label: 'SEA24', value: 'SEA24' },
  { label: 'SEA26', value: 'SEA26' },
  { label: 'SEA76', value: 'SEA76' },
  { label: 'SEA94', value: 'SEA94' },
  { label: 'SJC13', value: 'SJC13' },
  { label: 'YVR26', value: 'YVR26' },
  { label: 'YYJ1',  value: 'YYJ1'  },
];

const STAGE_OPTIONS = [
  { label: 'Stage 1', value: 'Stage 1' },
  { label: 'Stage 2', value: 'Stage 2' },
  { label: 'Stage 3', value: 'Stage 3' },
  { label: 'Stage 4', value: 'Stage 4' },
];

const INCLINED_OPTIONS = [
  { label: 'Yes',     value: 'Yes' },
  { label: 'No',      value: 'No' },
  { label: 'Pending', value: 'Pending' },
];

const PROGRAM_STATUS_OPTIONS = [
  { label: 'Active',     value: 'Active' },
  { label: 'Graduated',  value: 'Graduated' },
  { label: 'Early Exit', value: 'Early Exit' },
];

interface FormState {
  internName: string;
  managerName: string;
  l8: string;
  location: string;
  costCenter: string;
  stage: string;
  startDate: string;
  expectedGraduationDate: string;
  inclinedStatus: string;
  programStatus: string;
}

const EMPTY_FORM: FormState = {
  internName: '',
  managerName: '',
  l8: '',
  location: '',
  costCenter: '',
  stage: '',
  startDate: '',
  expectedGraduationDate: '',
  inclinedStatus: 'Pending',
  programStatus: 'Active',
};

interface Props {
  mode: 'add' | 'edit';
  initial?: Intern;
  costCenterOptions: string[];
  onConfirm: (intern: Intern) => void;
  onDismiss: () => void;
}

export default function InternFormModal({ mode, initial, costCenterOptions, onConfirm, onDismiss }: Props) {
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          internName:             initial.internName,
          managerName:            initial.managerName,
          l8:                     initial.l8,
          location:               initial.location,
          costCenter:             initial.costCenter,
          stage:                  initial.stage,
          startDate:              initial.startDate,
          expectedGraduationDate: initial.expectedGraduationDate,
          inclinedStatus:         initial.inclinedStatus,
          programStatus:          initial.programStatus,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.internName.trim())          next.internName = 'Required';
    if (!form.managerName.trim())         next.managerName = 'Required';
    if (!form.l8.trim())                  next.l8 = 'Required';
    if (!form.location)                   next.location = 'Required';
    if (!/^\d{4}$/.test(form.costCenter))  next.costCenter = 'Must be exactly 4 digits';
    if (!form.stage)                      next.stage = 'Required';
    if (!form.startDate)                  next.startDate = 'Required';
    if (!form.expectedGraduationDate)     next.expectedGraduationDate = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleReview() {
    if (validate()) setStep('confirm');
  }

  function handleConfirm() {
    const intern: Intern = {
      internId:               initial?.internId ?? `intern-${Date.now()}`,
      internName:             form.internName.trim(),
      managerName:            form.managerName.trim(),
      l8:                     form.l8.trim(),
      location:               form.location,
      costCenter:             form.costCenter.trim(),
      stage:                  form.stage as InternStage,
      startDate:              form.startDate,
      expectedGraduationDate: form.expectedGraduationDate,
      inclinedStatus:         form.inclinedStatus as InclinedStatus,
      programStatus:          form.programStatus as ProgramStatus,
      offerExtendedDate:      initial?.offerExtendedDate ?? null,
      headcountSource:        initial?.headcountSource ?? null,
      hiringMeetingDate:      initial?.hiringMeetingDate,
      hiringMeetingUpcomingDate: initial?.hiringMeetingUpcomingDate,
      lastPromotionDate:      initial?.lastPromotionDate,
    };
    onConfirm(intern);
  }

  const title = mode === 'add' ? 'Add intern' : 'Edit intern';

  if (step === 'confirm') {
    return (
      <Modal
        visible
        onDismiss={onDismiss}
        header={`Confirm — ${title}`}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => setStep('form')}>Back</Button>
              <Button variant="primary" onClick={handleConfirm}>
                {mode === 'add' ? 'Add intern' : 'Save changes'}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box color="text-body-secondary">
            Review the information below before confirming.
          </Box>
          <KeyValuePairs
            columns={2}
            items={[
              { label: 'Intern name',       value: form.internName },
              { label: 'Manager',           value: form.managerName },
              { label: 'L8 manager',        value: form.l8 },
              { label: 'Location',          value: form.location },
              { label: 'Cost center',       value: form.costCenter },
              { label: 'Stage',             value: form.stage },
              { label: 'Start date',        value: form.startDate },
              { label: 'Graduation date',   value: form.expectedGraduationDate },
              { label: 'Inclined status',   value: form.inclinedStatus },
              { label: 'Program status',    value: form.programStatus },
            ]}
          />
        </SpaceBetween>
      </Modal>
    );
  }

  return (
    <Modal
      visible
      size="large"
      onDismiss={onDismiss}
      header={title}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={onDismiss}>Cancel</Button>
            <Button variant="primary" onClick={handleReview}>
              Review
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Form>
        <ColumnLayout columns={2}>
          <FormField label="Intern name" errorText={errors.internName}>
            <Input
              value={form.internName}
              onChange={({ detail }) => set('internName', detail.value)}
              placeholder="Full name"
            />
          </FormField>
          <FormField label="Manager" errorText={errors.managerName}>
            <Input
              value={form.managerName}
              onChange={({ detail }) => set('managerName', detail.value)}
              placeholder="Manager name"
            />
          </FormField>
          <FormField label="L8 manager" errorText={errors.l8}>
            <Input
              value={form.l8}
              onChange={({ detail }) => set('l8', detail.value)}
              placeholder="L8 manager name"
            />
          </FormField>
          <FormField label="Location" errorText={errors.location}>
            <Select
              selectedOption={LOCATION_OPTIONS.find(o => o.value === form.location) ?? null}
              onChange={({ detail }) => set('location', detail.selectedOption.value ?? '')}
              options={LOCATION_OPTIONS}
              placeholder="Select location"
            />
          </FormField>
          <FormField label="Cost center" errorText={errors.costCenter}>
            <Autosuggest
              value={form.costCenter}
              onChange={({ detail }) => {
                const digits = detail.value.replace(/\D/g, '').slice(0, 4);
                set('costCenter', digits);
              }}
              options={costCenterOptions.map(cc => ({ value: cc }))}
              enteredTextLabel={value => `Use "${value}"`}
              placeholder="4-digit code"
              empty="No existing cost centers"
            />
          </FormField>
          <FormField label="Stage" errorText={errors.stage}>
            <Select
              selectedOption={STAGE_OPTIONS.find(o => o.value === form.stage) ?? null}
              onChange={({ detail }) => set('stage', detail.selectedOption.value ?? '')}
              options={STAGE_OPTIONS}
              placeholder="Select stage"
            />
          </FormField>
          <FormField label="Start date" errorText={errors.startDate}>
            <DatePicker
              value={form.startDate}
              onChange={({ detail }) => set('startDate', detail.value)}
              placeholder="YYYY/MM/DD"
            />
          </FormField>
          <FormField label="Expected graduation date" errorText={errors.expectedGraduationDate}>
            <DatePicker
              value={form.expectedGraduationDate}
              onChange={({ detail }) => set('expectedGraduationDate', detail.value)}
              placeholder="YYYY/MM/DD"
            />
          </FormField>
          <FormField label="Inclined status">
            <Select
              selectedOption={INCLINED_OPTIONS.find(o => o.value === form.inclinedStatus) ?? INCLINED_OPTIONS[2]}
              onChange={({ detail }) => set('inclinedStatus', detail.selectedOption.value ?? 'Pending')}
              options={INCLINED_OPTIONS}
            />
          </FormField>
          <FormField label="Program status">
            <Select
              selectedOption={PROGRAM_STATUS_OPTIONS.find(o => o.value === form.programStatus) ?? PROGRAM_STATUS_OPTIONS[0]}
              onChange={({ detail }) => set('programStatus', detail.selectedOption.value ?? 'Active')}
              options={PROGRAM_STATUS_OPTIONS}
            />
          </FormField>
        </ColumnLayout>
      </Form>
    </Modal>
  );
}
