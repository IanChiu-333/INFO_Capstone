import { useState, useMemo } from 'react';
import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Icon from '@cloudscape-design/components/icon';
import type { Intern } from '../../services';
import InternFormModal from './InternFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import styles from './InternsTable.module.css';

const PAGE_SIZE = 8;

interface Props {
  interns: Intern[];
  onRowClick?: (intern: Intern) => void;
  onAdd: (intern: Intern) => void;
  onUpdate: (intern: Intern) => void;
  onDelete: (id: string) => void;
}

export default function InternsTable({ interns, onRowClick, onAdd, onUpdate, onDelete }: Props) {
  const [currentPage, setCurrentPage]   = useState(1);
  const [filterText, setFilterText]     = useState('');
  const [selectedItems, setSelectedItems] = useState<Intern[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget]     = useState<Intern | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const costCenterOptions = useMemo(
    () => [...new Set(interns.map(i => i.costCenter).filter(Boolean))].sort(),
    [interns]
  );

  const [sortingField, setSortingField]           = useState<keyof Intern | null>(null);
  const [sortingDescending, setSortingDescending] = useState(false);

  const filteredInterns = useMemo(() => {
    if (!filterText.trim()) return interns;
    const q = filterText.toLowerCase();
    return interns.filter(i =>
      i.internName.toLowerCase().includes(q)  ||
      i.managerName.toLowerCase().includes(q) ||
      i.l8.toLowerCase().includes(q)          ||
      i.location.toLowerCase().includes(q)    ||
      i.costCenter.toLowerCase().includes(q)  ||
      i.stage.toLowerCase().includes(q)
    );
  }, [interns, filterText]);

  const sortedInterns = useMemo(() => {
    if (!sortingField) return filteredInterns;
    return [...filteredInterns].sort((a, b) => {
      const av = String(a[sortingField] ?? '');
      const bv = String(b[sortingField] ?? '');
      const cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
      return sortingDescending ? -cmp : cmp;
    });
  }, [filteredInterns, sortingField, sortingDescending]);

  const totalPages  = Math.ceil(sortedInterns.length / PAGE_SIZE);
  const pageItems   = sortedInterns.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const showingFrom = sortedInterns.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo   = Math.min(currentPage * PAGE_SIZE, sortedInterns.length);

  function handleAdd(intern: Intern) {
    onAdd(intern);
    setAddModalOpen(false);
  }

  function handleUpdate(intern: Intern) {
    onUpdate(intern);
    setEditTarget(null);
  }

  function handleDeleteConfirmed() {
    selectedItems.forEach(i => onDelete(i.internId));
    setSelectedItems([]);
    setShowDeleteConfirm(false);
  }

  return (
    <>
      <Table
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        trackBy="internId"
        sortingColumn={sortingField ? { sortingField } : undefined}
        sortingDescending={sortingDescending}
        onSortingChange={({ detail }) => {
          setSortingField((detail.sortingColumn.sortingField as keyof Intern) ?? null);
          setSortingDescending(detail.isDescending ?? false);
          setCurrentPage(1);
        }}
        header={
          <Header
            variant="h2"
            description="Complete roster across all stages and locations"
            counter={`(${interns.length})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <span className={styles.totalBadge}>
                  <Icon name="group" />{' '}{interns.length} total
                </span>
                {selectedItems.length > 0 && (
                  <Button
                    iconName="remove"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete ({selectedItems.length})
                  </Button>
                )}
                <Button iconName="add-plus" onClick={() => setAddModalOpen(true)}>
                  Add intern
                </Button>
                <Button variant="primary" iconName="download">
                  Export table
                </Button>
              </SpaceBetween>
            }
          >
            All Interns
          </Header>
        }
        filter={
          <div className={styles.filterRow}>
            <div className={styles.searchWrapper}>
              <Input
                value={filterText}
                onChange={({ detail }) => {
                  setFilterText(detail.value);
                  setCurrentPage(1);
                }}
                placeholder="Enter value"
                type="search"
              />
            </div>
            <Box color="text-body-secondary" fontSize="body-s">
              {sortedInterns.length} matches
            </Box>
          </div>
        }
        columnDefinitions={[
          { id: 'internName',  header: 'Intern Name',  sortingField: 'internName',             cell: (i: Intern) => i.internName },
          { id: 'managerName', header: 'Manager',      sortingField: 'managerName',            cell: (i: Intern) => i.managerName },
          { id: 'l8',          header: 'L8',           sortingField: 'l8',                    cell: (i: Intern) => i.l8 },
          { id: 'location',    header: 'Location',     sortingField: 'location',              cell: (i: Intern) => i.location },
          { id: 'costCenter',  header: 'Cost Center',  sortingField: 'costCenter',            cell: (i: Intern) => i.costCenter },
          { id: 'stage',       header: 'Stage',        sortingField: 'stage',                 cell: (i: Intern) => i.stage },
          { id: 'graduation',  header: 'Grad Date',    sortingField: 'expectedGraduationDate', cell: (i: Intern) => i.expectedGraduationDate },
          {
            id: 'actions',
            header: '',
            width: 48,
            cell: (i: Intern) => (
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="icon"
                  iconName="edit"
                  ariaLabel={`Edit ${i.internName}`}
                  onClick={() => setEditTarget(i)}
                />
              </div>
            ),
          },
        ]}
        items={pageItems}
        onRowClick={onRowClick ? ({ detail }) => onRowClick(detail.item) : undefined}
        pagination={
          <Pagination
            currentPageIndex={currentPage}
            pagesCount={totalPages}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
          />
        }
        footer={
          <Box color="text-body-secondary" fontSize="body-s">
            Showing {showingFrom}–{showingTo} of {sortedInterns.length} interns • Click any row to view full details
          </Box>
        }
      />

      {addModalOpen && (
        <InternFormModal
          mode="add"
          costCenterOptions={costCenterOptions}
          onConfirm={handleAdd}
          onDismiss={() => setAddModalOpen(false)}
        />
      )}

      {editTarget && (
        <InternFormModal
          mode="edit"
          initial={editTarget}
          costCenterOptions={costCenterOptions}
          onConfirm={handleUpdate}
          onDismiss={() => setEditTarget(null)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          items={selectedItems}
          onConfirm={handleDeleteConfirmed}
          onDismiss={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
