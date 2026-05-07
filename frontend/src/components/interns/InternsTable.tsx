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
import styles from './InternsTable.module.css';

const PAGE_SIZE = 8;

interface Props {
  interns: Intern[];
  onRowClick?: (intern: Intern) => void;
}

export default function InternsTable({ interns, onRowClick }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText]   = useState('');

  const filteredInterns = useMemo(() => {
    if (!filterText.trim()) return interns;
    const q = filterText.toLowerCase();
    return interns.filter(i =>
      i.internName.toLowerCase().includes(q) ||
      i.managerName.toLowerCase().includes(q) ||
      i.l8.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.stage.toLowerCase().includes(q)
    );
  }, [interns, filterText]);

  const totalPages  = Math.ceil(filteredInterns.length / PAGE_SIZE);
  const pageItems   = filteredInterns.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const showingFrom = filteredInterns.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo   = Math.min(currentPage * PAGE_SIZE, filteredInterns.length);

  return (
    <Table
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
              <Button variant="primary" iconName="download">
                Export table
              </Button>
            </SpaceBetween>
          }
        >
          All Active Interns
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
          {filterText.trim() && (
            <Box color="text-body-secondary" fontSize="body-s">
              {filteredInterns.length} matches
            </Box>
          )}
        </div>
      }
      columnDefinitions={[
        { id: 'internName',  header: 'Intern Name',     cell: (i: Intern) => i.internName },
        { id: 'managerName', header: 'Manager',         cell: (i: Intern) => i.managerName },
        { id: 'l8',          header: 'L8',              cell: (i: Intern) => i.l8 },
        { id: 'location',    header: 'Location',        cell: (i: Intern) => i.location },
        { id: 'stage',       header: 'Current Stage',   cell: (i: Intern) => i.stage },
        { id: 'graduation',  header: 'Graduation Date', cell: (i: Intern) => i.expectedGraduationDate },
        { id: 'inclined',    header: 'Inclined Status', cell: (i: Intern) => i.inclinedStatus },
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
          Showing {showingFrom}–{showingTo} of {filteredInterns.length} interns • Click any row to view full details
        </Box>
      }
    />
  );
}
