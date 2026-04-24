import { useState } from 'react';
import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import Box from '@cloudscape-design/components/box';
import Icon from '@cloudscape-design/components/icon';
import type { Intern } from '../../services';
import styles from './InternsTable.module.css';

const PAGE_SIZE = 8;

interface Props {
  interns: Intern[];
  onRowClick?: (intern: Intern) => void;
}

export default function InternsTable({ interns, onRowClick }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages  = Math.ceil(interns.length / PAGE_SIZE);
  const pageItems   = interns.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const showingFrom = (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo   = Math.min(currentPage * PAGE_SIZE, interns.length);

  return (
    <Table
      header={
        <Header
          variant="h2"
          description="Complete roster across all stages and locations"
          actions={
            <span className={styles.totalBadge}>
              <Icon name="group" />{interns.length} Total
            </span>
          }
        >
          All Active Interns
        </Header>
      }
      columnDefinitions={[
        { id: 'name',       header: 'Intern Name',     cell: (i: Intern) => i.name },
        { id: 'manager',    header: 'Manager',         cell: (i: Intern) => i.manager },
        { id: 'location',   header: 'Location',        cell: (i: Intern) => i.location },
        { id: 'stage',      header: 'Current Stage',   cell: (i: Intern) => i.stage },
        { id: 'graduation', header: 'Graduation Date', cell: (i: Intern) => i.graduationDate },
        { id: 'inclined',   header: 'Inclined Status', cell: (i: Intern) => i.inclinedStatus },
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
          Showing {showingFrom}–{showingTo} of {interns.length} Interns • Click any row to view full details
        </Box>
      }
    />
  );
}
